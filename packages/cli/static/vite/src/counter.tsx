import * as UI from "ui-ts";
import fpTsLogo from "./fp-ts-logo.svg";
import viteLogo from "/vite.svg";
import { ADT, match } from "ts-adt";

type State = {
  count: number;
};

type Event = ADT<{
  Click: {};
}>;

const Click: Event = { _type: "Click" };

const initial: State = {
  count: 0,
};

const render: UI.Render<State, Event> = (trigger, state) => (
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src={viteLogo} class="logo" alt="Vite logo" />
    </a>
    <a href="https://gcanti.github.io/fp-ts/" target="_blank">
      <img src={fpTsLogo} class="logo vanilla" alt="fp-ts logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button" onClick={() => trigger(Click)}>
        count is {state.count}
      </button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and <code>fp-ts</code> logos to learn more
    </p>
  </div>
);

const update: UI.Update<State, Event> = match({
  Click: () =>
    UI.produce<State>((draft) => {
      draft.count++;
    }),
});

export default UI.createApp(initial, render, update);
