import { isLeft, isRight } from "fp-ts/lib/Either";
import { expect } from "vitest";

interface CustomMatchers<R = unknown> {
  toBeLeft(): R;
  toBeRight(): R;
  toBeLeftMatching<E>(value: E): R;
  toBeRightMatching<E>(value: E): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeLeft(recieved) {
    const { isNot } = this;

    return {
      pass: isLeft(recieved),
      message: () => `${recieved} is${isNot ? " not" : ""} Left`,
    };
  },

  toBeRight(recieved) {
    const { isNot } = this;

    return {
      pass: isRight(recieved),
      message: () => `${recieved} is${isNot ? " not" : ""} Right`,
    };
  },

  toBeLeftMatching(recieved, expected) {
    const { isNot, utils } = this;

    return {
      pass: isLeft(recieved) && !!utils.subsetEquality(recieved.left, expected),
      message: () =>
        `${JSON.stringify(recieved)} is${
          isNot ? "" : " not"
        } Left matching ${JSON.stringify(expected)}`,
    };
  },

  toBeRightMatching(recieved, expected) {
    const { isNot, utils } = this;

    return {
      pass:
        isRight(recieved) && !!utils.subsetEquality(recieved.right, expected),
      message: () =>
        `${JSON.stringify(recieved)} is${
          isNot ? "" : " not"
        } Right matching ${JSON.stringify(expected)}`,
    };
  },
});
