import { ADT, match } from "ts-adt";

import { TEMPLATES_STRING, USAGE } from "./constants";

export type CLIError = ADT<{
  UserInitiated: { log: string };
  UnrecognizedFlag: { flag: unknown };
  UnrecognizedTemplate: { template: string };
  FileExists: { path: string };
  TargetNotEmpty: { target: string; isInteractive: boolean };
  UnknownError: { original: unknown };
}>;

export type UserInitiated = CLIError & { _type: "UserInitiated" };
export const UserInitiated = (log: string): UserInitiated => ({
  _type: "UserInitiated",
  log,
});

export type UnrecognizedFlag = CLIError & { _type: "UnrecognizedFlag" };
export const UnrecognizedFlag = (flag: unknown): UnrecognizedFlag => ({
  _type: "UnrecognizedFlag",
  flag: String(flag),
});

export type UnrecognizedTemplate = CLIError & { _type: "UnrecognizedTemplate" };
export const UnrecognizedTemplate = (
  template: string,
): UnrecognizedTemplate => ({
  _type: "UnrecognizedTemplate",
  template,
});

export type FileExists = CLIError & { _type: "FileExists" };
export const FileExists = (path: string): FileExists => ({
  _type: "FileExists",
  path,
});

export type TargetNotEmpty = CLIError & { _type: "TargetNotEmpty" };
export const TargetNotEmpty = (
  target: string,
  isInteractive: boolean,
): TargetNotEmpty => ({
  _type: "TargetNotEmpty",
  target,
  isInteractive,
});

export type UnknownError = CLIError & { _type: "UnknownError" };
export const UnknownError = (original: unknown): UnknownError => ({
  _type: "UnknownError",
  original,
});

export const handleErrors: (error: CLIError) => number = match({
  UserInitiated: ({ log }) => {
    console.log(log);
    return 0;
  },
  TargetNotEmpty: ({ target, isInteractive }) => {
    if (isInteractive)
      console.log(
        `"${target}" is not empty. Use "--force" to initialize anyways.`,
      );
    return 1;
  },
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
    console.log("Unknown error occured. The original error was:\n", original);
    return 1;
  },
  UnrecognizedTemplate: ({ template }) => {
    console.log(
      `Unrecognized template "${template}". Available templates are ${TEMPLATES_STRING}.`,
    );
    return 1;
  },
});
