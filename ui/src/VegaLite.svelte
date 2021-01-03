<script>
  import {onMount, onDestroy, afterUpdate} from "svelte";

  export let spec;
  export let style;
  let element;
  let view;

  afterUpdate(async () => {
    if( view ) view.finalize();
    const res = await vegaEmbed(element, spec, {renderer: "svg"});
    view = res.view;
    view.run();
  })

  onDestroy(() => {
    if( !view ) return;
    view.finalize();
  });
</script>

<style>
  .vega-lite {
      width: 100%;
  }
</style>

<div style="width: 100%;">
  <div class="vega-lite" {style} bind:this={element}/>
</div>
