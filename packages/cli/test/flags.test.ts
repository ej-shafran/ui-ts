import { Left, Right, isLeft, isRight } from "fp-ts/lib/Either";
import { parseArgs } from "../src/args";
import { describe, it, expect } from "vitest";
import {
  CLIError,
  UnrecognizedFlag,
  UnrecognizedTemplate,
  UserInitiated,
} from "../src/errors";
import { DEFAULT_TEMPLATE, TEMPLATES } from "../src/constants";

const NONEXISTENT_TEMPLATE = "does not exist";
const NONEXISTENT_FLAG = "--somethingelse";

describe("positional parameter", () => {
  it("should set the `directory` option relative to the CWD", () => {
    const result = parseArgs(["../some/dir"], "cwd");

    expect(isRight(result)).toBe(true);
    expect((result as Right<{ directory: string }>).right.directory).toBe(
      "some/dir",
    );
  });
});

describe("--help, -h", () => {
  it("should print out a `help` message", () => {
    const result = parseArgs(["--help"], "");

    expect(isLeft(result)).toBe(true);
    expect((result as Left<CLIError>).left._type).toBe<CLIError["_type"]>(
      "UserInitiated",
    );
    expect((result as Left<UserInitiated>).left.log).toMatchSnapshot();
  });
});

describe("--template, -t", () => {
  it(`should default to "${DEFAULT_TEMPLATE}"`, () => {
    const result = parseArgs([], "");

    expect(isRight(result)).toBe(true);
    expect((result as Right<{ template: string }>).right.template).toBe(
      DEFAULT_TEMPLATE,
    );
  });

  it("should change the used template", () => {
    const template = TEMPLATES[1];

    const result = parseArgs(["--template", template], "");

    expect(isRight(result)).toBe(true);
    expect((result as Right<{ template: string }>).right.template).toBe(
      template,
    );
  });

  it("should fail for a nonexistent template", () => {
    const result = parseArgs(["--template", NONEXISTENT_TEMPLATE], "");

    expect(isLeft(result)).toBe(true);
    expect((result as Left<CLIError>).left._type).toBe<CLIError["_type"]>(
      "UnrecognizedTemplate",
    );
    expect((result as Left<UnrecognizedTemplate>).left.template).toBe(
      NONEXISTENT_TEMPLATE,
    );
  });
});

describe("unrecognized flag", () => {
  it("should fail", () => {
    const result = parseArgs([NONEXISTENT_FLAG], "");

    expect(isLeft(result)).toBe(true);
    expect((result as Left<CLIError>).left._type).toBe<CLIError["_type"]>(
      "UnrecognizedFlag",
    );
    expect((result as Left<UnrecognizedFlag>).left.flag).toBe(NONEXISTENT_FLAG);
  });
});
