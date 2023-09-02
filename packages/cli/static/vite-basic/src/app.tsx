import * as UI from "ui-ts";
import { ADT, match } from "ts-adt";

type State = {};

type Event = ADT<{}>;

const initial: State = {};

const render: UI.Render<State, Event> = (trigger, state) => <></>;

const update: UI.Update<State, Event> = match({});

export default UI.createApp(initial, render, update);
