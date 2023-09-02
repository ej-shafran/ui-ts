import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/function";

import { TargetNotEmpty, UnknownError } from "./errors";

function getChar(prompt: string): TE.TaskEither<UnknownError, string> {
  return () => {
    process.stderr.write(prompt);
    return new Promise<E.Either<UnknownError, string>>((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.setEncoding("utf-8");

      process.stdin.on("data", (chunk) => {
        process.stdin.removeAllListeners();
        process.stdin.setRawMode(false);

        process.stderr.write("\n");

        resolve(E.right(chunk.toString()));
      });

      process.stdin.on("error", (error) => {
        process.stdin.removeAllListeners();
        process.stdin.setRawMode(false);

        process.stderr.write("\n");

        resolve(E.left(UnknownError(error)));
      });
    });
  };
}

export const promptToOverride = (dirPath: string) =>
  pipe(
    getChar(`"${dirPath}" is not empty. Proceed anyways? (Y/n)`),
    TE.map((c) => c.toLowerCase() === "y"),
    TE.filterOrElseW(Boolean, () => TargetNotEmpty(dirPath, true)),
    TE.map(constVoid),
  );
