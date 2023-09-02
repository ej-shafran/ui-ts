#!/usr/bin/env node

import * as TE from "fp-ts/lib/TaskEither";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/function";

import { basename } from "path";

import { parseArgs } from "./args";
import { copyTemplate, isDirectoryEmpty } from "./fs";
import { promptToOverride } from "./prompt";
import { handleErrors } from "./errors";

const main = pipe(
  TE.Do,
  TE.bind("args", () => parseArgs(process.argv.slice(2))),
  TE.bindW("isEmpty", ({ args }) => isDirectoryEmpty(args.directory)),
  TE.tap(({ isEmpty, args }) =>
    !isEmpty ? promptToOverride(args.directory) : TE.right(undefined as void),
  ),
  TE.tapIO(({ args }) =>
    log(`Initializing a project in "${basename(args.directory)}"...`),
  ),
  TE.tap(({ args }) => copyTemplate(args.template, args.directory)),
  TE.match(handleErrors, () => 0),
);

main().then(process.exit);
