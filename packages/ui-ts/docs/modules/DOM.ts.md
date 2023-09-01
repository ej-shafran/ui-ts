---
title: DOM.ts
nav_order: 1
parent: Modules
---

## DOM overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [addEventListener](#addeventlistener)
  - [appendChild](#appendchild)
  - [contains](#contains)
  - [createDocumentFragment](#createdocumentfragment)
  - [createElement](#createelement)
  - [createTextNode](#createtextnode)
  - [getElementById](#getelementbyid)
  - [removeAttribute](#removeattribute)
  - [removeChild](#removechild)
  - [removeEventListener](#removeeventlistener)
  - [replaceChild](#replacechild)
  - [setAttribute](#setattribute)

---

# utils

## addEventListener

Adds an event listener to `node`. See the [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) for more details.

**Signature**

```ts
export declare const addEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions | undefined
) => (node: Node) => IO.IO<void>
```

Added in v1.0.0

## appendChild

**Signature**

```ts
export declare const appendChild: (child: Node) => (parent: Node) => IO.IO<Node>
```

Added in v1.0.0

## contains

Returns an IO of `true` if `child` is an inclusive descendant of `parent`, and an IO of `false` otherwise.

**Signature**

```ts
export declare const contains: (child: Node) => (parent: Node) => IO.IO<boolean>
```

Added in v1.0.0

## createDocumentFragment

Creates a new document.

**Signature**

```ts
export declare function createDocumentFragment(): IO.IO<DocumentFragment>
```

Added in v1.0.0

## createElement

Creates an instance of the element for the specified tag.

**Signature**

```ts
export declare function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions
): IO.IO<HTMLElementTagNameMap[K]>
```

Added in v1.0.0

## createTextNode

Creates a text string from the specified value.

**Signature**

```ts
export declare function createTextNode(data: string): IO.IO<Text>
```

Added in v1.0.0

## getElementById

Returns a reference to the first object with the specified value of the ID attribute within the `document` param.

**Signature**

```ts
export declare const getElementById: (id: string) => (document: Document) => IOO.IOOption<HTMLElement>
```

Added in v1.0.0

## removeAttribute

**Signature**

```ts
export declare const removeAttribute: (attribute: string) => (element: HTMLElement) => IO.IO<void>
```

Added in v1.0.0

## removeChild

Returns a `IOO.none` if `child` is not contained within `parent`.
If it _is_ contained, the child is removed from the within the `parent` and returned within an `IOO.some`.

**Signature**

```ts
export declare const removeChild: (child: Node) => (parent: Node) => IOO.IOOption<Node>
```

Added in v1.0.0

## removeEventListener

Removes the event listener in `node`'s event listener list with the same type, callback, and options.

**Signature**

```ts
export declare const removeEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions | undefined
) => (node: Node) => IO.IO<void>
```

Added in v1.0.0

## replaceChild

Returns a `IOO.none` if `oldChild` is not contained within `parent`.
If it _is_ contained, `oldChild` is replaced by `newChild` and returned within an `IOO.some`.

**Signature**

```ts
export declare const replaceChild: (newChild: Node, oldChild: Node) => (parent: Node) => IOO.IOOption<Node>
```

Added in v1.0.0

## setAttribute

Sets the value of `element`'s first attribute whose qualified name is `attribute` to `value`.

**Signature**

```ts
export declare const setAttribute: (attribute: string, value: string) => (element: HTMLElement) => IO.IO<void>
```

Added in v1.0.0
