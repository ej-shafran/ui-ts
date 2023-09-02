import * as UI from "ui-ts";
import { app } from "./App";

UI.runApp(app);

new EventSource("/esbuild").addEventListener("change", () => location.reload());
