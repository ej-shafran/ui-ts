import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import mri from "mri";

import { DEFAULT_TEMPLATE, TEMPLATES, USAGE } from "./constants";
import {
  UnrecognizedFlag,
  UnrecognizedTemplate,
  UserInitiated,
} from "./errors";
import { join } from "path";

export type Flags = {
  template: string;
  help: boolean | undefined;
  force: boolean | undefined;
};

const unsafeArgs = (argv: string[]) =>
  mri<Flags>(argv, {
    default: {
      template: DEFAULT_TEMPLATE,
    },
    string: ["template"],
    boolean: ["help", "force"],
    alias: {
      t: "template",
      h: "help",
      f: "force",
    },
    unknown(flag) {
      throw flag;
    },
  });

export const parseArgs = (argv: string[], cwd: string) =>
  pipe(
    argv,
    E.tryCatchK(unsafeArgs, UnrecognizedFlag),
    E.flatMap((args) =>
      !args.help ? E.right(args) : E.left(UserInitiated(USAGE)),
    ),
    E.filterOrElseW(
      (args) => TEMPLATES.includes(args.template),
      (args) => UnrecognizedTemplate(args.template),
    ),
    E.map((args) => ({
      force: !!args.force,
      template: args.template,
      directory: join(cwd, args._[0] ?? ""),
    })),
  );
