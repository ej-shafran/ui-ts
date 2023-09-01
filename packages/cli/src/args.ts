import { tryCatchK } from "fp-ts/lib/Either";
import mri from "mri";
import { ADT } from "ts-adt";
import { DEFAULT_TEMPLATE } from "./constants";

export type ArgsError = ADT<{
  UnrecognizedFlag: { flag: string };
}>;

export type Flags = {
  template: string | undefined;
  help: boolean | undefined;
};

const UnrecognizedFlag = (flag: unknown): ArgsError => ({
  _type: "UnrecognizedFlag",
  flag: String(flag),
});

const unsafeArgs = (argv: string[]) =>
  mri<Flags>(argv, {
    default: {
      template: DEFAULT_TEMPLATE,
    },
    string: ["template"],
    boolean: ["help"],
    alias: {
      t: "template",
      h: "help",
    },
    unknown(flag) {
      throw flag;
    },
  });

export const args = tryCatchK(unsafeArgs, UnrecognizedFlag);
