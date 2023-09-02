import { ADT, match } from "ts-adt";
import * as UI from "ui-ts";
import { produce } from "immer";

type State = {
  // your application state goes here
  count: number;
};

type Event = ADT<{
  // your application's events go here
  Click: {
    // additional event data can go here
  };
}>;

// the initial state for your app
const initial: State = {
  count: 0,
};

// the function which renders the application for a given state
// `trigger` is a function which triggers an event, causing a rerender
const render: UI.Render<State, Event> = (trigger, state) => (
  <button onClick={() => trigger({ _type: "Click" })}>
    Count: {state.count}
  </button>
);

// the function that handles your application's events,
// returning an updated state
// it's built to be easy-to-use with `immer`'s curried `produce` syntax
const update: UI.Update<State, Event> = match({
  Click: () =>
    produce((state: State) => {
      state.count++;
    }),
});

export const app = UI.createApp(initial, render, update);
