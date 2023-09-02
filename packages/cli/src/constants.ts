export const TEMPLATES = ["basic", "counter", "vite"];
export const DEFAULT_TEMPLATE = TEMPLATES[1];

const QUOTED_TEMPLATES = TEMPLATES.map((template) => `"${template}"`);
export const TEMPLATES_STRING =
  QUOTED_TEMPLATES.slice(0, -1).join(", ") + " or " + QUOTED_TEMPLATES.at(-1);

export const PLACEHOLDER = "PROJECT_NAME";

export const USAGE = `\
Usage:
  ui-ts [-t TEMPLATE] [PATH]

Initialize a "ui-ts" project in a given path, from one of several available templates.
If PATH is not provided, the CWD is used.

Options:
  --help, -h      Print this help and exit
  --template, -t  The template to use. Available templates are ${TEMPLATES_STRING}.
                  Default: "${DEFAULT_TEMPLATE}".`;
