import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/function";

import { UnknownError, UserInitiated } from "./errors";

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
    TE.flatMap((response) =>
      response ? TE.right(undefined as void) : TE.left(UserInitiated),
    ),
  );
