#!/usr/bin/env node

import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import { log } from "fp-ts/Console";
import { pipe } from "fp-ts/function";

import { basename, relative } from "path";

import { parseArgs } from "./args";
import { copyTemplate, isDirectoryEmpty, replaceProjectName } from "./fs";
import { promptToOverride } from "./prompt";
import { TargetNotEmpty, handleErrors } from "./errors";

const logDone = (directory: string, cwd: string) => {
  const cdCommand =
    directory === cwd ? "" : `  cd ${relative(cwd, directory)}\n`;
  return log(`
All done! 🥳

You can run
${cdCommand}  npm install
  npm run dev
To get started!
`);
};

export const program = (argv: string[], cwd: string, isInteractive: boolean) =>
  pipe(
    TE.Do,
    TE.bind("args", () => TE.fromEither(parseArgs(argv, cwd))),
    TE.bindW("isEmpty", ({ args }) =>
      args.force ? TE.of(true) : isDirectoryEmpty(args.directory),
    ),
    TE.tap(({ isEmpty, args }) => {
      if (isEmpty) {
        return TE.right(undefined);
      } else if (isInteractive) {
        return promptToOverride(args.directory);
      } else {
        return TE.left(TargetNotEmpty(args.directory, false));
      }
    }),
    TE.let("dirName", ({ args }) => basename(args.directory)),
    TE.tapIO(({ dirName }) => log(`Initializing a project in "${dirName}"...`)),
    TE.tap(({ args }) =>
      copyTemplate(args.template, args.directory, args.force),
    ),
    TE.tap(({ args, dirName }) => replaceProjectName(args.directory, dirName)),
    TE.tapIO(({ args }) => logDone(args.directory, cwd)),
    TE.matchE(T.fromIOK(handleErrors), () => T.of(0)),
  );

if (require.main === module) {
  const main = program(
    process.argv.slice(2),
    process.cwd(),
    process.stdin.isTTY,
  );
  main().then(process.exit);
}
