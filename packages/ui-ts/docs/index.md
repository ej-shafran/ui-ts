---
title: Introduction
nav_order: 1
---

<img src="ui-ts-logo.png" alt="UI-TS Logo" style="display: block; width: 200px; margin-bottom: 2em;"/>

# UI With `fp-ts`

A tiny-tiny UI library that uses JSX and [`fp-ts`](https://gcanti.github.io/fp-ts/) to make for easy, small UIs.

## Elm-like Style

Every `ui-ts` application is built with the following building blocks:

- A `State` type, which holds the global state of the application
- An `Event` type, which represents the different possible events that may occur (usually with [`ts-adt`](https://github.com/pfgray/ts-adt))
- An `initial` variable, which is the initial `State` of the application
- A `render` function, which takes the current state and a `trigger` callback, and returns the HTML to render to the screen (using JSX)
- An `update` function, which returns a new state based on the previous state and an event

Calling `UI.createApp` with all of these returns an `App`, which can then be run with `UI.runApp` or `UI.runWithRoot`.

## Get Started

You can use [the CLI](https://npmjs.com/package/ui-ts-cli) to initialize a new `ui-ts` project, using `npx ui-ts`.
