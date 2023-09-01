import { ADT, match } from "ts-adt";
import * as UI from "../src/UI";
import { describe, expect, it } from "vitest";
import fc from "fast-check";

type State = {
  count: number;
};

type Event = ADT<{
  // ADT uses `{}` with a unique meaning
  // eslint-disable-next-line @typescript-eslint/ban-types
  Click: {};
}>;

const Click: Event = { _type: "Click" };

const initial: State = {
  count: 0,
};

const render: UI.Render<State, Event> = (trigger, state) => (
  <button onClick={() => trigger(Click)}>
    Count: <span>{state.count}</span>
  </button>
);

const update: UI.Update<State, Event> = match({
  Click: () =>
    UI.produce<State>((draft) => {
      draft.count++;
    }),
});

const app = UI.createApp(initial, render, update);

const setup = () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  UI.runApp(app);
};

const teardown = () => {
  document.body.childNodes.forEach((child) => child.remove());
};

describe("click counter", () => {
  it("should match the user's clicks", () => {
    const prop = fc.property(fc.nat({ max: 100 }), (clicks) => {
      const button = document.querySelector("button")!;
      expect(button).toBeTruthy();
      const counter = document.querySelector("button > span")!;
      expect(counter).toBeTruthy();

      for (let i = 0; i < clicks; i++) {
        button.click();
        expect(counter.textContent).toBe(String(i + 1));
      }
    });

    fc.assert(prop.beforeEach(setup).afterEach(teardown));
  });
});
