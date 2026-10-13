import { renderToString } from "react-dom/server";
import { App } from "./App";

/** Server render, as Hydrogen does before hydrating on the client. */
export function render() {
  return `<!doctype html>
<html lang="en" data-theme="brand">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Play Tee — Hydrogen React · plt-variant-picker</title>
    <link rel="stylesheet" href="demo.css">
  </head>
  <body class="bg-base-100 text-base-content">
    <div id="root">${renderToString(<App />)}</div>
    <script type="module" src="client.js"></script>
  </body>
</html>
`;
}
