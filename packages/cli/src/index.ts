#!/usr/bin/env node

import { args } from "./args";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { USAGE } from "./constants";

pipe(
  process.argv.slice(2),
  args,
  E.map((opts) => {
    if (opts.help) {
      console.log(USAGE);
      return;
    } else {
      console.log(opts);
      return;
    }
  }),
);
