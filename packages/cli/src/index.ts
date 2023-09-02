#!/usr/bin/env node

import * as TE from "fp-ts/TaskEither";
import { log } from "fp-ts/Console";
import { pipe } from "fp-ts/function";

import { basename, relative } from "path";

import { parseArgs } from "./args";
import { copyTemplate, isDirectoryEmpty, replaceProjectName } from "./fs";
import { promptToOverride } from "./prompt";
import { handleErrors } from "./errors";

const logDone = (directory: string) => {
  const cwd = process.cwd();
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

const main = pipe(
  TE.Do,
  TE.bind("args", () => parseArgs(process.argv.slice(2))),
  TE.bindW("isEmpty", ({ args }) => isDirectoryEmpty(args.directory)),
  TE.tap(({ isEmpty, args }) =>
    !isEmpty ? promptToOverride(args.directory) : TE.right(undefined as void),
  ),
  TE.let("dirName", ({ args }) => basename(args.directory)),
  TE.tapIO(({ dirName }) => log(`Initializing a project in "${dirName}"...`)),
  TE.tap(({ args }) => copyTemplate(args.template, args.directory)),
  TE.tap(({ args, dirName }) => replaceProjectName(args.directory, dirName)),
  TE.tapIO(({ args }) => logDone(args.directory)),
  TE.match(handleErrors, () => 0),
);

main().then(process.exit);
