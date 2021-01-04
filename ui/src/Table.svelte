<script>
  export let rows;
  export let highlight = r => false;
  export let fade = r => false;
</script>

<style>
    table {
    }

    th {
        padding: 4px;
        text-align: right;
    }

    th:first-child {
        text-align: left;
    }

    td {
        padding: 4px;
        text-align: right;
    }

    td:first-child {
        text-align: left;
        width: 210px;
    }
</style>

{#if rows.length > 1}
<table class="f6">
  <thead>
    <tr class="striped--light-gray">
      {#each rows[0] as heading}
        <th>{heading}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
  {#each rows.slice(1) as row}
    <tr class="striped--light-gray" class:fw6="{highlight(row)}" class:o-30={fade(row)}>
    {#each row as cell}
      <td>{cell}</td>
    {/each}
    </tr>
  {/each}
  </tbody>
</table>
{/if}