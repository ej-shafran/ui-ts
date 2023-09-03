---
title: index.ts
nav_order: 2
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

---

Re-exports everything from `UI`.

Additionally, declares the JSX namespace needed to have type-checking on JSX.

### `onInsert`

It should be noted that every JSX element in UI-TS has an `onInsert` prop, which may be a callback which recieves the element itself. This callback is called in a `requestIdleCallback` after the element has been inserted to the DOM. This means you can do things like:

```tsx
const render = () => <input onInsert={(input) => input.focus()} />;
```

And it will work as expected.
