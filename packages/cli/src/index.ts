#!/usr/bin/env node

import * as E from "fp-ts/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as A from "fp-ts/Array";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/function";
import { cp, mkdir, readdir } from "fs/promises";

import { ADT, match } from "ts-adt";
import { basename, join } from "path";

import { Flags, args } from "./args";
import { USAGE } from "./constants";
import { UnknownError } from "./unknown-error";
import { getChar } from "./getchar";

type CopyFileError =
  | ADT<{
      FileExists: { path: string };
    }>
  | UnknownError;

const FileExists = (path: string): CopyFileError => ({
  _type: "FileExists",
  path,
});

const UserInitiated = {
  _type: "UserInitiated",
} as const;
type UserInitiated = typeof UserInitiated;

const parseOpts = (opts: Flags & { _: string[] }) => async () => {
  if (opts.help) {
    console.log(USAGE);
    return E.left(UserInitiated);
  } else {
    return E.right({
      template: opts.template,
      directory: join(process.cwd(), opts._[0] ?? ""),
    });
  }
};

const isDirectoryEmpty = (dirPath: string) =>
  pipe(
    TE.tryCatch(
      () => mkdir(dirPath, { recursive: true }),
      (e) => UnknownError(e),
    ),
    TE.flatMapTask(() => () => readdir(dirPath)),
    TE.map(A.isEmpty),
  );

const promptToOverride = (dirPath: string) =>
  pipe(
    getChar(`"${dirPath}" is not empty. Proceed anyways? (Y/n)`),
    TE.map((c) => c.toLowerCase() === "y"),
    TE.flatMap((response) =>
      response ? TE.right(undefined as void) : TE.left(UserInitiated),
    ),
  );

const copyTemplate = (template: string, target: string) =>
  TE.tryCatch(
    () =>
      cp(join(__dirname, "..", "static", template), target, {
        force: false,
        errorOnExist: true,
        recursive: true,
      }),
    (error) => {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_FS_CP_EEXIST"
      ) {
        return FileExists((error as { code: string; path: string }).path);
      } else {
        console.log(error);
        return UnknownError(error);
      }
    },
  );

const main = pipe(
  TE.Do,
  TE.bind("opts", () =>
    pipe(process.argv.slice(2), args, TE.fromEither, TE.flatMap(parseOpts)),
  ),
  TE.bindW("isEmpty", ({ opts }) => isDirectoryEmpty(opts.directory)),
  TE.tap(({ isEmpty, opts }) =>
    !isEmpty ? promptToOverride(opts.directory) : TE.right(undefined as void),
  ),
  TE.tapIO(({ opts }) =>
    log(`Initializing a project in "${basename(opts.directory)}"...`),
  ),
  TE.tap(({ opts }) => copyTemplate(opts.template, opts.directory)),
  TE.match(
    match({
      UserInitiated: () => 0,
      FileExists: ({ path }) => {
        console.log(`File already exists: "${path}"`);
        return 1;
      },
      UnrecognizedFlag: ({ flag }) => {
        console.log(USAGE);
        console.log(`\nUnrecognized flag: ${flag}`);
        return 1;
      },
      UnknownError: ({ original }) => {
        console.log(
          "Unknown error occured. The original error was:\n",
          original,
        );
        return 1;
      },
    }),
    () => 0,
  ),
);

main().then(process.exit);
