---
title: Home
nav_order: 1
---

# ui-ts

A tiny-tiny UI library that uses JSX and `fp-ts` to make for easy small UIs.

## Installation

### Using the CLI

See [CLI](https://www.npmjs.com/package/ui-ts-cli).

### Manual installation

Install, alongside `fp-ts`, `ts-adt`, and `immer`:

```
> pnpm install ui-ts fp-ts ts-adt immer
```

Setup a TSConfig like the following:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2016",

    // JSX
    "jsx": "react",
    "jsxFactory": "UI.element",
    "jsxFragmentFactory": "UI.fragment",

    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "strictBindCallApply": true
  }
}
```

And setup some sort of build process.
