# svelte-paperscript

Write [PaperScript](https://paperjs.org) code directly in your Svelte components! This preprocessor compiles PaperScript code to JavaScript, allowing you to use operator overloading and the global Paper.js API namespace in your Svelte components.

## Installation

```sh
npm install --save-dev svelte-paperscript@latest
```

Add the preprocessor to your Svelte configuration. For example, in a project built with Vite, like a SvelteKit project, use spread-syntax to add the preprocessor to the `preprocess` array in `svelte.config.js`:

```js
// svelte.config.js
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { paperscriptPreprocess } from "svelte-paperscript";

export default {
  // https://svelte.dev/docs#compile-time-svelte-preprocess
  preprocess: [
    ...paperscriptPreprocess({
      sourceMap: false, // default: true
    }),
    vitePreprocess(),
  ],
};
```

## Usage

To make a PaperScript component, create a `.svelte` file containing a `<script>` tag with `lang="paperscript"` and a `<canvas>` tag. You can then write your PaperScript code in the `<script>` tag.

```svelte
<script lang="paperscript">
  // PaperScript code goes here
  var path = new Path.Circle({
    center: [80, 50],
    radius: 30,
    fillColor: 'red'
  });
</script>

<canvas class="my-canvas" resize></canvas>

<style>
  .my-canvas {
    width: 100%;
    height: 100%;
  }
</style>
```

When Svelte compiles the component, the preprocessor will compile the PaperScript code to JavaScript and bind it to the `canvas` element.

> Yes, your linter will complain about everything in the `<script>` tag, as well as the optional `resize` attribute on the `<canvas>` tag.

You may not have more than one `canvas` per PaperScript component. If you need multiple canvases, you can use multiple components.

## Canvas configuration

All Paper.js canvas configuration options (e.g. `resize`) can be set on the `<canvas>` tag as attributes. See the [Paper.js documentation](http://paperjs.org/tutorials/getting-started/working-with-paper-js/#canvas-configuration) for a list of available options.

## Example

See the [example/](example) directory for a simple demo Svelte project. To run the example, open the directory in your terminal and run:

```sh
npm install
npm run dev
```
