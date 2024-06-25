<script lang="ts">
  import SimpleExample from "./SimpleExample.svelte";
  import MetaBallExample from "./MetaBallExample.svelte";
</script>

<div style="display:flex;">
  <div style="margin:auto;">
    <div class="example">
      <h1>Simple example:</h1>
      <SimpleExample />
    </div>

    <div class="example">
      <h1>
        More complex example (
        <a href="http://paperjs.org/examples/meta-balls/">link</a>
        ):
      </h1>
      <MetaBallExample />
    </div>
  </div>
</div>

<style>
  .example {
    width: 70vw;
    height: 70vh;
  }
</style>
