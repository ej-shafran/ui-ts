---
title: UI.ts
nav_order: 3
parent: Modules
---

## UI overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [app](#app)
  - [App (type alias)](#app-type-alias)
  - [Render (type alias)](#render-type-alias)
  - [Trigger (type alias)](#trigger-type-alias)
  - [Update (type alias)](#update-type-alias)
  - [createApp](#createapp)
  - [runApp](#runapp)
  - [runWithRoot](#runwithroot)
- [jsx](#jsx)
  - [element](#element)
  - [fragment](#fragment)
- [model](#model)
  - [Element (type alias)](#element-type-alias)
  - [Node](#node)
  - [TagName (type alias)](#tagname-type-alias)
  - [UINode (type alias)](#uinode-type-alias)
- [utils](#utils)
  - [Produce (type alias)](#produce-type-alias)
  - [produce](#produce)

---

# app

## App (type alias)

Return type of `createApp`.

**Signature**

```ts
export type App = (root: HTMLElement) => IOO.IOOption<void>
```

Added in v1.0.0

## Render (type alias)

Type of the `render` callback of `createApp`.

**Signature**

```ts
export type Render<TState, TEvent> = (trigger: Trigger<TEvent>, state: Readonly<TState>) => Element
```

Added in v1.0.0

## Trigger (type alias)

Type of the `trigger` param passed to the `render` callback of `createApp`.

**Signature**

```ts
export type Trigger<TEvent> = (e: TEvent) => void
```

Added in v1.0.0

## Update (type alias)

Type of the `update` callback of `createApp`.

**Signature**

```ts
export type Update<TState, TEvent> = (e: TEvent) => (state: Readonly<TState>) => TState
```

Added in v1.0.0

## createApp

**Signature**

```ts
export declare const createApp: <TState, TEvent>(
  initial: TState,
  render: Render<TState, TEvent>,
  update: Update<TState, TEvent>
) => App
```

**Example**

```ts
import { ADT, match } from 'ts-adt'
import * as UI from 'ui-ts'

type Event = ADT<{
  Click: {}
}>

const Click: Event = { _type: 'Click' }

type State = {
  count: number
}

const initial: State = {
  count: 0,
}

// you'll probably use JSX for this, like
// <button onClick={() => trigger(Click)}>Count: {state.count}</button>
const render: UI.Render<State, Event> = (trigger, state) =>
  UI.element('button', { onClick: () => trigger(Click) }, 'Count: ', state.count)

const update: UI.Update<State, Event> = match({
  Click: () =>
    UI.produce<State>((draft) => {
      draft.count++
    }),
})

// this is an `App` that can later be run with `runApp`
const app = UI.createApp(initial, render, update)
```

Added in v1.0.0

## runApp

Run an `App` with a certain HTML elemtn, given that element's ID.

**Signature**

```ts
export declare const runApp: (app: App, rootId?: string | undefined) => void
```

Added in v1.0.0

## runWithRoot

A low-level function for running an `App`, in case you can't get the `HTMLElement` through `document.getElementById`.

**Signature**

```ts
export declare const runWithRoot: (app: App, root: HTMLElement) => boolean
```

Added in v1.0.0

# jsx

## element

**Signature**

```ts
export declare const element: (
  tagName:
    | 'object'
    | 'fragment'
    | 'a'
    | 'abbr'
    | 'address'
    | 'applet'
    | 'area'
    | 'article'
    | 'aside'
    | 'audio'
    | 'b'
    | 'base'
    | 'basefont'
    | 'bdi'
    | 'bdo'
    | 'blockquote'
    | 'body'
    | 'br'
    | 'button'
    | 'canvas'
    | 'caption'
    | 'cite'
    | 'code'
    | 'col'
    | 'colgroup'
    | 'data'
    | 'datalist'
    | 'dd'
    | 'del'
    | 'details'
    | 'dfn'
    | 'dialog'
    | 'dir'
    | 'div'
    | 'dl'
    | 'dt'
    | 'em'
    | 'embed'
    | 'fieldset'
    | 'figcaption'
    | 'figure'
    | 'font'
    | 'footer'
    | 'form'
    | 'frame'
    | 'frameset'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'head'
    | 'header'
    | 'hgroup'
    | 'hr'
    | 'html'
    | 'i'
    | 'iframe'
    | 'img'
    | 'input'
    | 'ins'
    | 'kbd'
    | 'label'
    | 'legend'
    | 'li'
    | 'link'
    | 'main'
    | 'map'
    | 'mark'
    | 'marquee'
    | 'menu'
    | 'meta'
    | 'meter'
    | 'nav'
    | 'noscript'
    | 'ol'
    | 'optgroup'
    | 'option'
    | 'output'
    | 'p'
    | 'param'
    | 'picture'
    | 'pre'
    | 'progress'
    | 'q'
    | 'rp'
    | 'rt'
    | 'ruby'
    | 's'
    | 'samp'
    | 'script'
    | 'section'
    | 'select'
    | 'slot'
    | 'small'
    | 'source'
    | 'span'
    | 'strong'
    | 'style'
    | 'sub'
    | 'summary'
    | 'sup'
    | 'table'
    | 'tbody'
    | 'td'
    | 'template'
    | 'textarea'
    | 'tfoot'
    | 'th'
    | 'thead'
    | 'time'
    | 'title'
    | 'tr'
    | 'track'
    | 'u'
    | 'ul'
    | 'var'
    | 'video'
    | 'wbr'
    | ((props: Record<string, unknown>) => Element),
  props: Record<string, unknown> | null,
  ...children: (string | number | Element)[]
) => Element
```

Added in v1.0.0

## fragment

**Signature**

```ts
export declare const fragment: 'fragment'
```

Added in v1.0.0

# model

## Element (type alias)

**Signature**

```ts
export type Element = ADT<{
  Root: {
    tagName: TagName
    props: Record<string, unknown> | null
    children: Element[]
  }
  Text: {
    value: string
  }
  Fragment: {
    children: Element[]
  }
}>
```

Added in v1.0.0

## Node

**Signature**

```ts
export declare const Node: UINode
```

Added in v1.0.0

## TagName (type alias)

**Signature**

```ts
export type TagName = keyof HTMLElementTagNameMap
```

Added in v1.0.0

## UINode (type alias)

**Signature**

```ts
type UINode = string | number | boolean | Element | UINode[]
```

Added in v1.0.0

# utils

## Produce (type alias)

**Signature**

```ts
export type Produce = <TState>(
  recipe: (state: Draft<TState>, initialState: TState) => TState | void | undefined
) => (state?: TState) => TState
```

Added in v1.0.0

## produce

A thin wrapper around `immer`'s `produce` that's easier to type within an `Update` function.

**Signature**

```ts
export declare const produce: Produce
```

Added in v1.0.0
