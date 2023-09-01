/* @since 1.0.0 */

import * as IO from "fp-ts/IO";
import * as IOO from "fp-ts/IOOption";
import { pipe } from "fp-ts/function";

/**
 * Creates an instance of the element for the specified tag.
 *
 * @param tagName The name of an element.
 *
 * @category utils
 * @since 1.0.0
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): IO.IO<HTMLElementTagNameMap[K]> {
  return () => document.createElement(tagName, options);
}

/**
 *
 * Creates a text string from the specified value.
 *
 * @param data String that specifies the `nodeValue` property of the text node.
 *
 * @category utils
 * @since 1.0.0
 */
export function createTextNode(data: string): IO.IO<Text> {
  return () => document.createTextNode(data);
}

/**
 * Creates a new document.
 *
 * @category utils
 * @since 1.0.0
 */
export function createDocumentFragment(): IO.IO<DocumentFragment> {
  return () => document.createDocumentFragment();
}

/**
 * Returns an IO of `true` if `child` is an inclusive descendant of `parent`, and an IO of `false` otherwise.
 *
 * @category utils
 * @since 1.0.0
 */
export const contains: (child: Node) => (parent: Node) => IO.IO<boolean> =
  (child) => (parent) => () =>
    parent.contains(child);

/**
 * @category utils
 * @since 1.0.0
 */
export const appendChild: (child: Node) => (parent: Node) => IO.IO<Node> =
  (child) => (parent) => () =>
    parent.appendChild(child);

/**
 * Returns a `IOO.none` if `child` is not contained within `parent`.
 * If it _is_ contained, the child is removed from the within the `parent` and returned within an `IOO.some`.
 *
 * @category utils
 * @since 1.0.0
 */
export const removeChild: (
  child: Node,
) => (parent: Node) => IOO.IOOption<Node> = (child) => (parent) =>
  pipe(
    parent,
    contains(child),
    IOO.fromIO,
    IOO.flatMap((has) =>
      has ? IOO.some(parent.removeChild(child)) : IOO.none,
    ),
  );

/**
 * Returns a `IOO.none` if `oldChild` is not contained within `parent`.
 * If it _is_ contained, `oldChild` is replaced by `newChild` and returned within an `IOO.some`.
 *
 * @category utils
 * @since 1.0.0
 */
export const replaceChild: (
  newChild: Node,
  oldChild: Node,
) => (parent: Node) => IOO.IOOption<Node> = (newChild, oldChild) => (parent) =>
  pipe(
    parent,
    contains(oldChild),
    IOO.fromIO,
    IOO.flatMap((has) =>
      has ? IOO.some(parent.replaceChild(newChild, oldChild)) : IOO.none,
    ),
  );

/**
 * @category utils
 * @since 1.0.0
 */
export const removeAttribute: (
  attribute: string,
) => (element: HTMLElement) => IO.IO<void> = (attribute) => (element) => () =>
  element.removeAttribute(attribute);

/**
 * Sets the value of `element`'s first attribute whose qualified name is `attribute` to `value`.
 *
 * @category utils
 * @since 1.0.0
 */
export const setAttribute: (
  attribute: string,
  value: string,
) => (element: HTMLElement) => IO.IO<void> =
  (attribute, value) => (element) => () =>
    element.setAttribute(attribute, value);

/**
 * Adds an event listener to `node`. See the [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) for more details.
 *
 * @category utils
 * @since 1.0.0
 */
export const addEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) => (node: Node) => IO.IO<void> = (event, listener, options) => (node) => () =>
  node.addEventListener(event, listener, options);

/**
 * Removes the event listener in `node`'s event listener list with the same type, callback, and options.
 *
 * @category utils
 * @since 1.0.0
 */
export const removeEventListener: (
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | boolean,
) => (node: Node) => IO.IO<void> = (event, listener, options) => (node) => () =>
  node.removeEventListener(event, listener, options);

/**
 * Returns a reference to the first object with the specified value of the ID attribute within the `document` param.
 *
 * @category utils
 * @since 1.0.0
 */
export const getElementById: (
  document: Document,
) => (id: string) => IOO.IOOption<HTMLElement> = (document) => (id) =>
  pipe(
    IOO.fromIO(() => document.getElementById(id)),
    IOO.flatMap((element) => (element ? IOO.some(element) : IOO.none)),
  );
