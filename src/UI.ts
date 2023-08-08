import { ADT, match } from "ts-adt";
import * as DOM from "./DOM";
import * as IO from "fp-ts/IO";
import * as IOO from "fp-ts/IOOption";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

export type Elem = ADT<{
  root: {
    tagName: keyof HTMLElementTagNameMap;
    props: Record<string, unknown> | null;
    children: Elem[];
  };
  text: {
    value: string;
  };
  fragment: {
    children: Elem[];
  };
}>;

export type RootElem = Elem & { _type: "root" };
export type TextElem = Elem & { _type: "text" };
export type FragElem = Elem & { _type: "fragment" };

export type UINode = string | number | boolean | Elem | UINode[];

type Inst =
  | {
    elem: RootElem;
    domNode: HTMLElement;
    childInsts: Inst[];
  }
  | {
    elem: TextElem;
    domNode: Text;
  }
  | {
    elem: FragElem;
    domNode: DocumentFragment;
    childInsts: Inst[];
  };

const normalizeChildren = (children: UINode[]): Elem[] =>
  pipe(
    children,
    A.flatMap((child) => {
      if (typeof child === "object") {
        if (Array.isArray(child)) return normalizeChildren(child);

        return [child];
      } else if (typeof child === "boolean") {
        return [];
      } else {
        return [
          {
            _type: "text",
            value: String(child),
          },
        ];
      }
    })
  );

export const fragment = "fragment";

export const elem = (
  tagName: keyof HTMLElementTagNameMap | typeof fragment,
  props: Record<string, unknown> | null,
  ...children: (string | number | Elem)[]
): Elem =>
  tagName === fragment
    ? { _type: "fragment", children: normalizeChildren(children) }
    : {
      _type: "root",
      tagName,
      props,
      children: normalizeChildren(children),
    };

const updateDOM =
  (prev: Record<string, unknown>, next: Record<string, unknown>) =>
    (domNode: HTMLElement): IO.IO<HTMLElement> => {
      return pipe(
        prev,
        R.mapWithIndex((k, a) => pipe(domNode, removeProp(k, a))),
        () => next,
        R.mapWithIndex((k, a) => pipe(domNode, addProp(k, a))),
        () => IO.of(domNode)
      );
    };

type PropertyCb<A = unknown> = (
  k: string,
  a: A
) => (element: HTMLElement) => IO.IO<void>;

const matchProp: (
  listenerCb: PropertyCb<EventListener>,
  propCb: PropertyCb<string>
) => PropertyCb = (listenerCb, propCb) => (k, a) => (element) => {
  if (k.startsWith("on") && a instanceof Function) {
    return pipe(
      element,
      listenerCb(k.slice(2).toLowerCase(), a as EventListener)
    );
  } else {
    return pipe(element, propCb(k, String(a)));
  }
};

const removeProp: PropertyCb = matchProp(
  DOM.removeEventListener,
  DOM.removeAttribute
);

const addProp: PropertyCb = matchProp(DOM.addEventListener, DOM.setAttribute);

const createInst: (elem: Elem) => IO.IO<Inst> = (elem) => {
  return pipe(
    elem,
    match({
      root: (elem) =>
        pipe(
          IO.Do,
          IO.bind("domNode", () => DOM.createElement(elem.tagName)),
          IO.tap(({ domNode }) =>
            pipe(domNode, updateDOM({}, elem.props ?? {}))
          ),
          IO.bind(
            "childInsts",
            () =>
              IO.sequenceArray(elem.children.map(createInst)) as IO.IO<Inst[]>
          ),
          IO.tap(({ childInsts, domNode }) =>
            IO.of(
              childInsts.map((child) => DOM.appendChild(child.domNode)(domNode))
            )
          ),
          IO.tap(({ domNode }) => {
            return () =>
              requestIdleCallback(() => {
                if (
                  elem.props &&
                  "onInsert" in elem.props &&
                  elem.props.onInsert instanceof Function
                ) {
                  return elem.props.onInsert(domNode);
                }
              });
          }),
          IO.bind("elem", () => IO.of(elem))
        ),
      text: (elem) =>
        pipe(
          elem.value,
          DOM.createTextNode,
          IO.map((domNode) => ({ domNode, elem }))
        ),
      fragment: (elem) =>
        pipe(
          IO.Do,
          IO.bind("domNode", () => DOM.createDocumentFragment()),
          IO.bind(
            "childInsts",
            () =>
              IO.sequenceArray(elem.children.map(createInst)) as IO.IO<Inst[]>
          ),
          IO.tap(({ childInsts, domNode }) =>
            IO.of(
              childInsts.map((child) => DOM.appendChild(child.domNode)(domNode))
            )
          ),
          IO.map(({ domNode, childInsts }) => ({ domNode, elem, childInsts }))
        ),
    })
  );
};

const reconcileAdd: (container: Node) => (elem: Elem) => IO.IO<Inst> =
  (container) => (elem) =>
    pipe(
      IO.Do,
      IO.bind("inst", () => createInst(elem)),
      IO.tap(({ inst }) => pipe(container, DOM.appendChild(inst.domNode))),
      IO.map(({ inst }) => inst)
    );

const reconcileRemove: (
  container: Node
) => (inst: Inst) => IOO.IOOption<Inst> = (container) => (inst) =>
  pipe(
    container,
    DOM.removeChild(inst.domNode),
    IOO.flatMap(() => IOO.none)
  );

const reconcileReplace: (
  container: Node,
  elem: Elem,
  inst: Inst
) => IOO.IOOption<Inst> = (container, elem, inst) =>
    pipe(
      createInst(elem),
      IOO.fromIO,
      IOO.tap((newInst) =>
        DOM.replaceChild(newInst.domNode, inst.domNode)(container)
      )
    );

const reconcileChildren = (elem: RootElem | FragElem, inst: Inst) => {
  const maxLength = Math.max(
    (inst as Inst & { childInsts: Inst[] }).childInsts.length,
    elem.children.length
  );

  const childInsts = [] as Inst[];
  for (let i = 0; i < maxLength; i++) {
    const childElem = O.fromNullable(elem.children[i]);
    const childInst = O.fromNullable(
      (inst as Inst & { childInsts: Inst[] }).childInsts[i]
    );

    const childIO = reconcile(inst.domNode, childElem, childInst);

    pipe(
      childIO(),
      O.map((inst) => childInsts.push(inst))
    );
  }

  return childInsts;
};

const reconcileUpdate: (elem: Elem, inst: Inst) => IO.IO<Inst> = (elem, inst) =>
  pipe(
    elem,
    match({
      root: (elem) => {
        pipe(
          inst.domNode as HTMLElement,
          updateDOM((inst.elem as RootElem).props ?? {}, elem.props ?? {})
        );

        inst.elem = elem;

        const childInsts = reconcileChildren(elem, inst);

        return IO.of({
          elem,
          childInsts,
          domNode: inst.domNode as HTMLElement,
        });
      },
      text: (elem) => {
        if (elem.value !== (inst.elem as TextElem).value) {
          inst.domNode.nodeValue = elem.value;
          inst.elem = elem;
        }
        return IO.of(inst);
      },
      fragment: (elem) => {
        const childInsts = reconcileChildren(elem, inst);

        (inst as Inst & { childInsts: Inst[] }).childInsts = childInsts;

        return IO.of(inst);
      },
    })
  );

const reconcile: (
  container: Node,
  elem: O.Option<Elem>,
  inst: O.Option<Inst>
) => IOO.IOOption<Inst> = (container, elem, inst) => {
  if (O.isNone(inst)) {
    return pipe(elem, IOO.fromOption, IOO.flatMapIO(reconcileAdd(container)));
  } else if (O.isNone(elem)) {
    return pipe(inst, IOO.fromOption, IOO.flatMap(reconcileRemove(container)));
  } else if (elem.value._type !== inst.value.elem._type) {
    return reconcileReplace(container, elem.value, inst.value);
  } else {
    return pipe(reconcileUpdate(elem.value, inst.value), IOO.fromIO);
  }
};

export type Trigger<TEvent> = (e: TEvent) => void;
export type Render<TState, TEvent> = (
  trigger: Trigger<TEvent>,
  state: Readonly<TState>
) => Elem;
export type Update<TState, TEvent> = (
  e: TEvent
) => (state: Readonly<TState>) => TState;
export type App = (root: HTMLElement) => IOO.IOOption<void>;

export const createApp =
  <TState, TEvent>(
    initial: TState,
    render: Render<TState, TEvent>,
    update: Update<TState, TEvent>
  ): App =>
    (root) => {
      return pipe(
        IOO.some(root),
        IOO.map((container) => {
          let state = initial;
          let rootInst: O.Option<Inst> = O.none;
          let rootElem: O.Option<Elem> = O.none;

          function trigger(e: TEvent) {
            state = update(e)(state);
            rootElem = O.some(render(trigger, state));
            rootInst = reconcile(container, rootElem, rootInst)();
          }

          rootElem = O.some(render(trigger, state));
          rootInst = reconcile(container, rootElem, rootInst)();
        })
      );
    };

export const runApp: (app: App, rootId?: string) => void = (
  app,
  rootId = "root"
) => {
  const runnable = pipe(rootId, DOM.getElementById, IOO.flatMap(app));
  const result = runnable();

  if (O.isNone(result)) {
    throw new Error(
      "Something went wrong when running the application. Time to debug :)"
    );
  }
};
