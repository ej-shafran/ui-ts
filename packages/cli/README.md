# ui-ts/cli

Initializes a `ui-ts` project from a handful of templates

## Installation

You can either use `npx`:

```
> npx ui-ts
```

Or download globally:

```
> npm i -g @ui-ts/cli
```

## Usage

By default, creates the project in the CWD.

```
> ui-ts

Initializing a project in "mydir"...

All done! 🥳

You can run
  npm install
  npm run dev
to get started!

```

You can pass in a positional argument to set the path to create the project in.

```
> ui-ts ./otherdir/temp

Initializing a project in "temp"...

All done! 🥳

You can run
  cd otherdir/temp
  npm install
  npm run dev
to get started!

```

## Templates

You can use the `--templates` flag (or `-t`) to set the template of the project. As of now, the available templates are:

- [Basic](#basic)
- [Vite](#vite)
- [Counter](#counter)
- [Vite Basic](#vite-basic)

### Basic

Barebones - no styling, no comments, nothing in your way. You're on your own!

## Vite

Using Vite. Very similar to Vite's basic project templates (the ones created with `npm create vite`).

## Vite Basic

Uses Vite, but with no preset, similar to [Basic](#basic).

## Counter

This is the default. It's got a little bit of styling and some comments to explain what's going on.
