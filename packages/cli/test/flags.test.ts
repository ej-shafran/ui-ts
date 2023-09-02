import "./matchers";
import { describe, it, expect } from "vitest";

import { Left } from "fp-ts/lib/Either";
import { parseArgs } from "../src/args";
import {
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

    expect(result).toBeRightMatching({ directory: "some/dir" });
  });
});

describe("--help, -h", () => {
  it("should print out a `help` message", () => {
    const result = parseArgs(["--help"], "");

    expect(result).toBeLeftMatching<Pick<UserInitiated, "_type">>({
      _type: "UserInitiated",
    });
    expect((result as Left<UserInitiated>).left.message).toMatchSnapshot();
  });
});

describe("--template, -t", () => {
  it(`should default to "${DEFAULT_TEMPLATE}"`, () => {
    const result = parseArgs([], "");

    expect(result).toBeRightMatching({
      template: DEFAULT_TEMPLATE,
    });
  });

  it("should change the used template", () => {
    const template = TEMPLATES[1];

    const result = parseArgs(["--template", template], "");

    expect(result).toBeRightMatching({
      template,
    });
  });

  it("should fail for a nonexistent template", () => {
    const result = parseArgs(["--template", NONEXISTENT_TEMPLATE], "");

    expect(result).toBeLeftMatching<UnrecognizedTemplate>({
      _type: "UnrecognizedTemplate",
      template: NONEXISTENT_TEMPLATE,
    });
  });
});

describe("unrecognized flag", () => {
  it("should fail", () => {
    const result = parseArgs([NONEXISTENT_FLAG], "");
    expect(result).toBeLeftMatching<UnrecognizedFlag>({
      _type: "UnrecognizedFlag",
      flag: NONEXISTENT_FLAG,
    });
  });
});
