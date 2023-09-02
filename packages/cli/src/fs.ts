import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import { constVoid, flow, pipe } from "fp-ts/function";

import { cp, mkdir, readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";

import { FileExists, UnknownError } from "./errors";
import { PLACEHOLDER } from "./constants";

export const isDirectoryEmpty = (dirPath: string) =>
  pipe(
    TE.tryCatch(() => mkdir(dirPath, { recursive: true }), UnknownError),
    TE.flatMapTask(() => () => readdir(dirPath)),
    TE.map(A.isEmpty),
  );

export const copyTemplate = (
  template: string,
  target: string,
  force: boolean,
) =>
  TE.tryCatch(
    () =>
      cp(join(__dirname, "..", "static", template), target, {
        force,
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

const walkDir = (
  dirName: string,
  cb: (fileName: string) => TE.TaskEither<UnknownError, void>,
): TE.TaskEither<UnknownError, void> => {
  return pipe(
    TE.tryCatch(() => readdir(dirName, { withFileTypes: true }), UnknownError),
    TE.flatMap(
      flow(
        A.map((file) =>
          file.isDirectory()
            ? walkDir(join(dirName, file.name), cb)
            : cb(join(dirName, file.name)),
        ),
        TE.sequenceArray,
        TE.map(constVoid),
      ),
    ),
  );
};

export const replaceProjectName = (dirPath: string, projectName: string) =>
  walkDir(dirPath, (fileName) =>
    pipe(
      TE.tryCatch(() => readFile(fileName, "utf-8"), UnknownError),
      TE.map((contents) => contents.replaceAll(PLACEHOLDER, projectName)),
      TE.flatMap((contents) =>
        TE.tryCatch(() => writeFile(fileName, contents), UnknownError),
      ),
    ),
  );
