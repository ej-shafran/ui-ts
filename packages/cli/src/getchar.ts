import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { UnknownError } from "./unknown-error";

export function getChar(prompt: string): TE.TaskEither<UnknownError, string> {
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
