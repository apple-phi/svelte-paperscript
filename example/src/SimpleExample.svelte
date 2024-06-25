<script lang="paperscript">
  const path = new Path.Rectangle({
    point: view.center,
    size: view.size / 5,
    strokeColor: "orange",
    radius: 10,
    fillColor: "orange",
  });
  function onFrame(event) {
    path.rotate(3, (view.center + path.bounds.center) / 2);
  }
</script>

<canvas class="my-canvas" resize></canvas>

<style>
  .my-canvas[resize] {
    width: 100%;
    height: 100%;
  }
</style>
