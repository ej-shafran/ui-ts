import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
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
};

const unsafeArgs = (argv: string[]) =>
  mri<Flags>(argv, {
    default: {
      template: DEFAULT_TEMPLATE,
    },
    string: ["template"],
    boolean: ["help"],
    alias: {
      t: "template",
      h: "help",
    },
    unknown(flag) {
      throw flag;
    },
  });

export const parseArgs = (argv: string[]) =>
  pipe(
    argv,
    E.tryCatchK(unsafeArgs, UnrecognizedFlag),
    TE.fromEither,
    TE.flatMap((args) =>
      !args.help
        ? TE.right(args)
        : TE.fromIOEither(() => {
            console.log(USAGE);
            return E.left(UserInitiated);
          }),
    ),
    TE.filterOrElseW(
      (args) => TEMPLATES.includes(args.template),
      (args) => UnrecognizedTemplate(args.template),
    ),
    TE.map((args) => ({
      template: args.template,
      directory: join(process.cwd(), args._[0] ?? ""),
    })),
  );
