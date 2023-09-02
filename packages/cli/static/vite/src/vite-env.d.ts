/// <reference types="vite/client" />

declare namespace JSX {
  type IntrinsicElements = Record<keyof HTMLElementTagNameMap, unknown>;
}
