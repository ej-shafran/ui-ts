import * as IO from "fp-ts/IO";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { log } from "fp-ts/Console";

import { ADT, match } from "ts-adt";
import { inspect } from "util";

import { TEMPLATES_STRING, USAGE } from "./constants";

export type CLIError = ADT<{
  UserInitiated: { message: string };
  UnrecognizedFlag: { flag: unknown };
  UnrecognizedTemplate: { template: string };
  FileExists: { path: string };
  TargetNotEmpty: { target: string; isInteractive: boolean };
  UnknownError: { original: unknown };
}> & { exitCode: number };

export type UserInitiated = CLIError & { _type: "UserInitiated" };
export const UserInitiated = (message: string): UserInitiated => ({
  _type: "UserInitiated",
  message,
  exitCode: 0,
});

export type UnrecognizedFlag = CLIError & { _type: "UnrecognizedFlag" };
export const UnrecognizedFlag = (flag: unknown): UnrecognizedFlag => ({
  _type: "UnrecognizedFlag",
  flag: String(flag),
  exitCode: 1,
});

export type UnrecognizedTemplate = CLIError & { _type: "UnrecognizedTemplate" };
export const UnrecognizedTemplate = (
  template: string,
): UnrecognizedTemplate => ({
  _type: "UnrecognizedTemplate",
  template,
  exitCode: 1,
});

export type FileExists = CLIError & { _type: "FileExists" };
export const FileExists = (path: string): FileExists => ({
  _type: "FileExists",
  path,
  exitCode: 1,
});

export type TargetNotEmpty = CLIError & { _type: "TargetNotEmpty" };
export const TargetNotEmpty = (
  target: string,
  isInteractive: boolean,
): TargetNotEmpty => ({
  _type: "TargetNotEmpty",
  target,
  isInteractive,
  exitCode: 1,
});

export type UnknownError = CLIError & { _type: "UnknownError" };
export const UnknownError = (original: unknown): UnknownError => ({
  _type: "UnknownError",
  original,
  exitCode: 1,
});

export const handleErrors: (error: CLIError) => IO.IO<number> = (error) =>
  pipe(
    error,
    match({
      UserInitiated: ({ message }) => O.some(message),
      FileExists: ({ path }) => O.some(`File already exists: "${path}"`),
      UnrecognizedFlag: ({ flag }) =>
        O.some(USAGE + `\n\nUnrecognized flag: ${flag}`),
      UnrecognizedTemplate: ({ template }) =>
        O.some(
          `Unrecognized template "${template}". Available templates are ${TEMPLATES_STRING}.`,
        ),
      TargetNotEmpty: ({ target, isInteractive }) =>
        !isInteractive
          ? O.some(
              `"${target}" is not empty. Use "--force" to initialize anyways.`,
            )
          : O.none,
      UnknownError: ({ original }) =>
        O.some(
          `Unknown error occurred. The original error was:\n${inspect(
            original,
          )}`,
        ),
    }),
    O.traverse(IO.Applicative)(log),
    IO.map(() => error.exitCode),
  );
