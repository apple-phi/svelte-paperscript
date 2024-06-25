import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { paperscriptPreprocess } from "svelte-paperscript";

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    ...paperscriptPreprocess({
      sourceMap: false, // default: true
    }),
    vitePreprocess(),
  ],
};
