import * as TE from "fp-ts/lib/TaskEither";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { cp, mkdir, readdir } from "fs/promises";
import { join } from "path";

import { FileExists, UnknownError } from "./errors";

export const isDirectoryEmpty = (dirPath: string) =>
  pipe(
    TE.tryCatch(() => mkdir(dirPath, { recursive: true }), UnknownError),
    TE.flatMapTask(() => () => readdir(dirPath)),
    TE.map(A.isEmpty),
  );

export const copyTemplate = (template: string, target: string) =>
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
        return UnknownError(error);
      }
    },
  );
