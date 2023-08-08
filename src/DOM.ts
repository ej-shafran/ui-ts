import * as IO from "fp-ts/IO";
import * as IOO from "fp-ts/IOOption";
import { pipe } from "fp-ts/lib/function";

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions
) {
  return IO.of(document.createElement(tagName, options));
}

export function createTextNode(data: string) {
  return IO.of(document.createTextNode(data));
}

export const contains: (child: Node) => (parent: Node) => IO.IO<boolean> =
  (child) => (parent) =>
    IO.of(parent.contains(child));

export const appendChild: (child: Node) => (parent: Node) => IO.IO<Node> =
  (child) => (parent) =>
    IO.of(parent.appendChild(child));

export const removeChild: (
  child: Node
) => (parent: Node) => IOO.IOOption<Node> = (child) => (parent) =>
  pipe(
    parent,
    contains(child),
    IOO.fromIO,
    IOO.flatMap((has) => (has ? IOO.some(parent.removeChild(child)) : IOO.none))
  );

export const replaceChild: (
  newChild: Node,
  oldChild: Node
) => (parent: Node) => IOO.IOOption<Node> = (newChild, oldChild) => (parent) =>
  pipe(
    parent,
    contains(oldChild),
    IOO.fromIO,
    IOO.flatMap((has) =>
      has ? IOO.some(parent.replaceChild(newChild, oldChild)) : IOO.none
    )
  );

export const removeAttribute: (
  attribute: string
) => (element: HTMLElement) => IO.IO<void> = (attribute) => (element) =>
  IO.of(element.removeAttribute(attribute));

export const setAttribute: (
  attribute: string,
  value: string
) => (element: HTMLElement) => IO.IO<void> = (attribute, value) => (element) =>
  IO.of(element.setAttribute(attribute, value));

export const addEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => (node: Node) => IO.IO<void> = (event, listener, options) => (node) =>
  IO.of(node.addEventListener(event, listener, options));

export const removeEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | boolean
) => (node: Node) => IO.IO<void> = (event, listener, options) => (node) =>
  IO.of(node.removeEventListener(event, listener, options));

export const getElementById: (id: string) => IOO.IOOption<HTMLElement> = (id) =>
  IOO.fromNullable(document.getElementById(id));
