/* @since 1.0.0 */

import { ADT, match } from "ts-adt";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as IO from "fp-ts/IO";
import * as IOO from "fp-ts/IOOption";
import * as R from "fp-ts/Record";
import * as O from "fp-ts/Option";
import { Draft, produce as produce_ } from "immer";
import * as DOM from "./DOM";

/**
 * @category model
 * @since 1.0.0
 */
export type TagName = keyof HTMLElementTagNameMap;

/**
 * @category model
 * @since 1.0.0
 */
export type Element = ADT<{
  Root: {
    tagName: TagName;
    props: Record<string, unknown> | null;
    children: Element[];
  };
  Text: {
    value: string;
  };
  Fragment: {
    children: Element[];
  };
}>;

type RootElement = Element & { _type: "Root" };
type TextElement = Element & { _type: "Text" };
type FragmentElement = Element & { _type: "Fragment" };

/**
 * @category model
 * @since 1.0.0
 */
type UINode = string | number | boolean | Element | UINode[];
export type {
  /**
   * @category model
   * @since 1.0.0
   */
  UINode as Node,
};

type Instance =
  | {
      elem: RootElement;
      domNode: HTMLElement;
      childInsts: Instance[];
    }
  | {
      elem: TextElement;
      domNode: Text;
    }
  | {
      elem: FragmentElement;
      domNode: DocumentFragment;
      childInsts: Instance[];
    };

const normalizeChildren = (children: UINode[]): Element[] =>
  pipe(
    children,
    A.flatMap((child) => {
      switch (typeof child) {
        case "object": {
          if (!child) return [];

          if (Array.isArray(child)) return normalizeChildren(child);

          return [child];
        }
        case "boolean":
        case "undefined":
          return [];
        case "string":
        case "number":
        case "bigint":
        case "symbol":
          return [
            {
              _type: "Text",
              value: String(child),
            },
          ];
      }
    }),
  );

/**
 * @category jsx
 * @since 1.0.0
 */
export const fragment = "fragment";

/**
 * @category jsx
 * @since 1.0.0
 */
export const element = (
  tagName:
    | keyof HTMLElementTagNameMap
    | typeof fragment
    | ((props: Record<string, unknown>) => Element),
  props: Record<string, unknown> | null,
  ...children: (string | number | Element)[]
): Element => {
  if (tagName === fragment) {
    return { _type: "Fragment", children: normalizeChildren(children) };
  } else if (typeof tagName === "string") {
    return {
      _type: "Root",
      tagName,
      props,
      children: normalizeChildren(children),
    };
  } else if (typeof tagName === "function") {
    return tagName(props ?? {});
  } else {
    throw new Error(`Cannot construct UI.Element from ${String(tagName)}`);
  }
};

type PropertyCallback<A = unknown> = (
  k: string,
  a: A,
) => (element: HTMLElement) => IO.IO<void>;

const matchProp: (
  listenerCb: PropertyCallback<EventListener>,
  propCb: PropertyCallback<string>,
) => PropertyCallback = (listenerCb, propCb) => (k, a) => (element) => {
  if (k.startsWith("on") && a instanceof Function) {
    return pipe(
      element,
      listenerCb(k.slice(2).toLowerCase(), a as EventListener),
    );
  } else {
    return pipe(element, propCb(k, String(a)));
  }
};

const removeProp: PropertyCallback = matchProp(
  DOM.removeEventListener,
  DOM.removeAttribute,
);

const addProp: PropertyCallback = matchProp(
  DOM.addEventListener,
  DOM.setAttribute,
);

const updateDOM =
  (prev: Record<string, unknown>, next: Record<string, unknown>) =>
  (domNode: HTMLElement): IO.IO<HTMLElement> => {
    return pipe(
      prev,
      R.mapWithIndex((k, a) => pipe(domNode, removeProp(k, a))),
      () => next,
      R.mapWithIndex((k, a) => pipe(domNode, addProp(k, a))),
      () => () => domNode,
    );
  };

const hasOnInsert = (
  props: object | null,
): props is { onInsert: (domNode: HTMLElement) => void } =>
  !!props && "onInsert" in props && props["onInsert"] instanceof Function;

const createInstance: (elem: Element) => IO.IO<Instance> = (elem) => {
  return pipe(
    elem,
    match({
      Root: (elem) =>
        pipe(
          IO.Do,
          IO.bind("domNode", () => DOM.createElement(elem.tagName)),
          IO.tap(({ domNode }) =>
            pipe(domNode, updateDOM({}, elem.props ?? {})),
          ),
          IO.bind(
            "childInsts",
            () =>
              IO.sequenceArray(elem.children.map(createInstance)) as IO.IO<
                Instance[]
              >,
          ),
          IO.tap(
            ({ childInsts, domNode }) =>
              () =>
                childInsts.map((child) =>
                  DOM.appendChild(child.domNode)(domNode),
                ),
          ),
          IO.tap(({ domNode }) => () => {
            if (hasOnInsert(elem.props)) {
              requestIdleCallback(() => {
                if (hasOnInsert(elem.props)) {
                  return elem.props["onInsert"](domNode);
                }
              });
            }
          }),
          IO.bind("elem", () => () => elem),
        ),
      Text: (elem) =>
        pipe(
          elem.value,
          DOM.createTextNode,
          IO.map((domNode) => ({ domNode, elem })),
        ),
      Fragment: (elem) =>
        pipe(
          IO.Do,
          IO.bind("domNode", () => DOM.createDocumentFragment()),
          IO.bind(
            "childInsts",
            () =>
              IO.sequenceArray(elem.children.map(createInstance)) as IO.IO<
                Instance[]
              >,
          ),
          IO.tap(
            ({ childInsts, domNode }) =>
              () =>
                childInsts.map((child) =>
                  DOM.appendChild(child.domNode)(domNode),
                ),
          ),
          IO.map(({ domNode, childInsts }) => ({ domNode, elem, childInsts })),
        ),
    }),
  );
};

const reconcileAdd: (container: Node) => (elem: Element) => IO.IO<Instance> =
  (container) => (elem) =>
    pipe(
      IO.Do,
      IO.bind("inst", () => createInstance(elem)),
      IO.tap(({ inst }) => pipe(container, DOM.appendChild(inst.domNode))),
      IO.map(({ inst }) => inst),
    );

const reconcileRemove: (
  container: Node,
) => (inst: Instance) => IOO.IOOption<Instance> = (container) => (inst) =>
  pipe(
    container,
    DOM.removeChild(inst.domNode),
    IOO.flatMap(() => IOO.none),
  );

const reconcileReplace: (
  container: Node,
  elem: Element,
  inst: Instance,
) => IOO.IOOption<Instance> = (container, elem, inst) =>
  pipe(
    createInstance(elem),
    IOO.fromIO,
    IOO.tap((newInst) =>
      DOM.replaceChild(newInst.domNode, inst.domNode)(container),
    ),
  );

const reconcileChildren = (
  elem: RootElement | FragmentElement,
  inst: Instance,
) => {
  const maxLength = Math.max(
    (inst as Instance & { childInsts: Instance[] }).childInsts.length,
    elem.children.length,
  );

  const childInsts = [] as Instance[];
  for (let i = 0; i < maxLength; i++) {
    const childElem = O.fromNullable(elem.children[i]);
    const childInst = O.fromNullable(
      (inst as Instance & { childInsts: Instance[] }).childInsts[i],
    );

    const childIO = reconcile(inst.domNode, childElem, childInst);

    pipe(
      childIO(),
      O.map((inst) => childInsts.push(inst)),
    );
  }

  return childInsts;
};

const reconcileUpdate: (elem: Element, inst: Instance) => IO.IO<Instance> = (
  elem,
  inst,
) =>
  pipe(
    elem,
    match({
      Root: (elem) => {
        pipe(
          inst.domNode as HTMLElement,
          updateDOM((inst.elem as RootElement).props ?? {}, elem.props ?? {}),
        );

        inst.elem = elem;

        const childInsts = reconcileChildren(elem, inst);

        return () => ({
          elem,
          childInsts,
          domNode: inst.domNode as HTMLElement,
        });
      },
      Text: (elem) => {
        if (elem.value !== (inst.elem as TextElement).value) {
          inst.domNode.nodeValue = elem.value;
          inst.elem = elem;
        }
        return () => inst;
      },
      Fragment: (elem) => {
        const childInsts = reconcileChildren(elem, inst);

        (inst as Instance & { childInsts: Instance[] }).childInsts = childInsts;

        return () => inst;
      },
    }),
  );

const reconcile: (
  container: Node,
  elem: O.Option<Element>,
  inst: O.Option<Instance>,
) => IOO.IOOption<Instance> = (container, elem, inst) => {
  if (O.isNone(inst)) {
    return pipe(elem, IOO.fromOption, IOO.flatMapIO(reconcileAdd(container)));
  } else if (O.isNone(elem)) {
    return pipe(inst, IOO.fromOption, IOO.flatMap(reconcileRemove(container)));
  } else if (
    elem.value._type !== inst.value.elem._type ||
    (elem.value as RootElement).tagName !==
      (inst.value.elem as RootElement).tagName
  ) {
    return reconcileReplace(container, elem.value, inst.value);
  } else {
    return pipe(reconcileUpdate(elem.value, inst.value), IOO.fromIO);
  }
};

/**
 * Type of the `trigger` param passed to the `render` callback of `createApp`.
 *
 * @category app
 * @since 1.0.0
 */
export type Trigger<TEvent> = (e: TEvent) => void;
/**
 * Type of the `render` callback of `createApp`.
 *
 * @category app
 * @since 1.0.0
 */
export type Render<TState, TEvent> = (
  trigger: Trigger<TEvent>,
  state: Readonly<TState>,
) => Element;

/**
 * Type of the `update` callback of `createApp`.
 *
 * @category app
 * @since 1.0.0
 */
export type Update<TState, TEvent> = (
  e: TEvent,
) => (state: Readonly<TState>) => TState;

/**
 * Return type of `createApp`.
 *
 * @category app
 * @since 1.0.0
 */
export type App = (root: HTMLElement) => IOO.IOOption<void>;

/**
 * @example
 * import { ADT, match } from 'ts-adt';
 * import * as UI from 'ui-ts';
 *
 * type Event = ADT<{
 *   Click: {};
 * }>;
 *
 * const Click: Event = { _type: "Click" };
 *
 * type State = {
 *   count: number;
 * };
 *
 * const initial: State = {
 *   count: 0,
 * };
 *
 * // you'll probably use JSX for this, like
 * // <button onClick={() => trigger(Click)}>Count: {state.count}</button>
 * const render: UI.Render<State, Event> = (trigger, state) =>
 *    UI.element("button", { onClick: () => trigger(Click) }, "Count: ", state.count);
 *
 * const update: UI.Update<State, Event> = match({
 *   Click: () => UI.produce<State>((draft) => {
 *    draft.count++;
 *   }),
 * });
 *
 * // this is an `App` that can later be run with `runApp`
 * const app = UI.createApp(initial, render, update);
 *
 * @category app
 * @since 1.0.0
 */
export const createApp =
  <TState, TEvent>(
    initial: TState,
    render: Render<TState, TEvent>,
    update: Update<TState, TEvent>,
  ): App =>
  (root) => {
    return pipe(
      IOO.some(root),
      IOO.map((container) => {
        let state = initial;
        let rootInst: O.Option<Instance> = O.none;
        let rootElem: O.Option<Element> = O.none;

        function trigger(e: TEvent) {
          state = update(e)(state);
          rootElem = O.some(render(trigger, state));
          rootInst = reconcile(container, rootElem, rootInst)();
        }

        rootElem = O.some(render(trigger, state));
        rootInst = reconcile(container, rootElem, rootInst)();
      }),
    );
  };

/**
 * A low-level function for running an `App`, in case you can't get the `HTMLElement` through `document.getElementById`.
 *
 * @category app
 * @since 1.0.0
 */
export const runWithRoot: (app: App, root: HTMLElement) => boolean = (
  app,
  root,
) => {
  const runnable = app(root);
  const result = runnable();
  return O.isSome(result);
};

/**
 * Run an `App` with a certain HTML elemtn, given that element's ID.
 *
 * @param app The `App` to run
 * @param rootId The ID of the element to append the resulting HTML to. Default: `"root"`.
 *
 * @category app
 * @since 1.0.0
 */
export const runApp: (app: App, rootId?: string) => void = (
  app,
  rootId = "root",
) => {
  const runnable = pipe(
    rootId,
    DOM.getElementById(document),
    IOO.map((root) => runWithRoot(app, root)),
  );
  const result = runnable();

  if (O.isNone(result) || result.value === false) {
    throw new Error(
      "Something went wrong when running the application. Time to debug :)",
    );
  }
};

/**
 * @category utils
 * @since 1.0.0
 */
export type Produce = <TState>(
  recipe: (
    state: Draft<TState>,
    initialState: TState,
  ) => TState | void | undefined,
) => (state?: TState) => TState;

/**
 * A thin wrapper around `immer`'s `produce` that's easier to type within an `Update` function.
 *
 * @category utils
 * @since 1.0.0
 */
export const produce: Produce = produce_;
