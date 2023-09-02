import { ADT, match } from "ts-adt";
import * as UI from "ui-ts";

type State = {};

type Event = ADT<{}>;

const initial: State = {};

const render: UI.Render<State, Event> = (trigger, state) => <></>;

const update: UI.Update<State, Event> = match({});

export const app = UI.createApp(initial, render, update);
