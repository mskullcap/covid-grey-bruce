<script>
  import {onMount} from "svelte";
  import dateFormat from "dateformat";
  import Covid19 from "./Covid19";
  import VegaLite from "./VegaLite.svelte";
  import Table from "./Table.svelte";

  let newCases;
  let bubble;
  let activeCases;
  const days = 60;

  let c19;
  let active;
  let municipality = "All";
  let setMuni;
  let casesByAgeRange;
  let casesBySex;
  let casesByDate;
  let casesByMunicipality;

  let width;

  function parse(spec, params){
    const keys = Object.keys(params);
    return JSON.parse(spec, (k, v) => {
      if( !keys.find(j => j === v)) return v;
      return params[v];
    });
  }

  function generateCasesByAgeRange(){
    let data = active.highlightBy("ageRange", "Age Range");
    const result = [];
    result.push(["Age Range", "Total Cases", "Active Cases", "New Cases"]);
    data.shift()
    if( data[data.length-1]["Age Range"] === "Under 10" ){
      const under10 = data.pop();
      data.unshift(under10);
    }
    data.forEach( row => {
      result.push([row["Age Range"], row["Total Cases"], row["Active Cases"], row["New Cases"]]);
    });
    return result;
  }

  function generateCasesByMunicipality(){
    const data = c19.highlightBy("municipality", "Municipality");
    const result = [];
    result.push(["Municipality", "Total Cases", "Active Cases", "New Cases"]);
    data.shift();
    data.forEach( row => {
      result.push([row["Municipality"], row["Total Cases"], row["Active Cases"], row["New Cases"]])
    });
    return result;
  }

  function generateCasesBySex(){
    const data = active.highlightBy("sex", "Sex");
    const result = [];
    result.push(["Sex", "Total Cases", "Active Cases", "New Cases"]);
    data.shift();
    data.forEach( row => {
      result.push([row["Sex"], row["Total Cases"], row["Active Cases"], row["New Cases"]])
    });
    return result;
  }

  function generateCasesByDate(){
    let data = active.highlightBy("dates", "Date");
    const result = [];
    result.push(["Date (YYYY-MM-dd)", "Cases Reported", "Cumulative Cases"]);
    let cumulator = active.total;
    data.shift();
    data.sort((a, b) => {
      const aa = a["Date"];
      const bb = b["Date"];

      if (aa > bb) return -1;
      if (aa < bb) return 1;
      return 0;
    });

    data.forEach( row => {
      result.push([row["Date"], row["Total Cases"], cumulator]);
      cumulator -= row["Total Cases"];
    });
    return result;
  }

  function setMunicipality(newCasesSpec, bubbleSpec, topoJson, activeCasesSpec, m ){
    if( !m ) return;
    municipality = m;
    active = m === "All" ? c19 : c19.filterBy("Municipality", m);
    const data = active.dataAsJson();

    newCases = parse(newCasesSpec, {
      "{{startDate}}": c19.startDate,
      "{{endDate}}": dateFormat(new Date(), "yyyy-mm-dd"),
      "{{maxCases}}": c19.maxPerDay() + 1,
      "{{values}}": data
    });

    bubble = parse(bubbleSpec, {
      "{{dateDomain}}": [new Date().getTime() - days * 24 * 60 * 60 * 1000, new Date().getTime()],
      "{{municipalityDomain}}": [0.8, c19.maxPerDayGroupedBy("Municipality")],
      "{{test}}": `"${m}" != "All" && datum['Municipality'] != "${m}"`,
      "{{values}}": c19.dataAsJson()
    });

    activeCases = parse(activeCasesSpec, {
      "{{topoJson}}": topoJson,
      "{{values}}":
        c19.highlightBy("municipality", "Municipality").map(r => {
          r.Municipality = r.Municipality.toUpperCase();
          return r;
        }),
      "{{test}}": `${m !== "All"} && datum.Municipality != "${m.toUpperCase()}"`
    });

    casesByMunicipality = generateCasesByMunicipality();
    casesByAgeRange = generateCasesByAgeRange();
    casesByDate = generateCasesByDate();
    casesBySex = generateCasesBySex();
  }

  onMount(async () => {
    const [dataResponse, newCasesSpec, bubbleSpec, topoJson, activeCasesSpec] = await Promise.all([
      fetch("https://raw.githubusercontent.com/mskullcap/covid-grey-bruce/master/ui/public/greybruce.json"),
      fetch("new_cases_by_day.json"),
      fetch("bubble_chart.json"),
      fetch("Municipal_Boundary_-_Lower_and_Single_Tier.json"),
      fetch("active_cases.json")
    ]);

    const json = await dataResponse.json();
    c19 = new Covid19(json);
    active = c19;

    setMuni = setMunicipality.bind(
      null,
      await newCasesSpec.text(),
      await bubbleSpec.text(),
      await topoJson.json(),
      await activeCasesSpec.text()
    );
    setMuni(municipality);
  });
</script>

<style></style>

<svelte:window bind:innerWidth={width} />

<main class="App mw9 mw8-ns center pa3 ph5-ns lh-copy">
  <div class="flex items-center">
    <div class="flex-grow-1">
      <h1 class="mv0">Grey Bruce Covid</h1>
    </div>
    <div class="glow o-20" title="The source code for this project is available on GitHub.">
      <a href="https://github.com/mskullcap/covid-grey-bruce">
        <img height="32" width="32" src="https://unpkg.com/simple-icons@v4/icons/github.svg" />
      </a>
    </div>
  </div>

  {#if c19}
    <h4 class="mv1">Updated: {c19.endDate}</h4>
  {/if}

  {#if c19}
    <p>
      Select a municipality to get a focussed view relevant to that region, or leave it set to "All Municipalities"
      to get a good overview of the state of Covid-19 in Grey-Bruce.
    </p>
    <select bind:value={municipality} on:change={()=> setMuni(municipality)}>
      <option value="All">All Municipalities</option>
      {#each c19.municipality as m}
        <option value={m}>{m}</option>
      {/each}
    </select> <button on:click={() => setMuni("All")}>Reset</button>

    <h2 class="mt4">Cases for {municipality == "All" ? "all municipalities" : "the municipality of " + municipality }</h2>

    <table>
      <tr>
        <td>Total cases since {c19.startDate}:</td>
        <td><strong>{ active.total }</strong></td>
      </tr>
      <tr>
        <td>Active cases as of {c19.endDate}:</td>
        <td><strong>{ active.filterBy("Date Case Resolved", null ).total}</strong></td>
      </tr>
      <tr>
        <td>New cases:</td>
        <td><strong>{ active.newCases }</strong></td>
      </tr>
      <tr>
        <td>Most recent case:</td>
        <td><strong>{ active.daysAgo } { active.daysAgo === 1 ? "day" : "days"} ago</strong></td>
      </tr>
    </table>

    {#if newCases}
      <hr>
      <h3>New cases by day{municipality == "All" ? "" : ": " + municipality }</h3>
      <p>
        Get a quick overview of how many new cases have been detected each day since the start of the crisis.
      </p>
      <VegaLite spec={newCases}/>
    {/if}

    {#if bubble}
      <hr>
      <h3>Cases in the past {days} days{municipality == "All" ? "" : ": " + municipality }</h3>
      <p>
        The size of the ball conveys the number of new cases on a particular day and the colour is
        unique to each municipality.  Scroll down to see the caseload trends over the last {days} days.
      </p>
      <VegaLite spec={bubble} style="max-width: 700px;"/>
    {/if}

    {#if activeCases}
      <hr>
      <h3>Active cases{municipality == "All" ? "" : ": " + municipality }</h3>
      <p>
        Covid hotspots based on the number of currently active cases.  The more saturated the colour,
        the greater the number of active cases.
      </p>
      <VegaLite spec={activeCases} style="max-width: 700px;"/>
    {/if}

    {#if casesByMunicipality}
      <hr>
      <h3>Cases per municipality{municipality == "All" ? "" : ": " + municipality }</h3>
      <Table rows={casesByMunicipality} highlight={r => r[3] > 0} fade={ r => municipality !== "All" && r[0] != municipality}/>
    {/if}

    {#if casesByAgeRange}
      <hr>
      <h3>Cases by age range{municipality == "All" ? "" : ": " + municipality }</h3>
      <Table rows={casesByAgeRange} highlight={r => r[3] > 0}/>
    {/if}

    {#if casesBySex}
      <hr>
      <h3>Cases by sex{municipality == "All" ? "" : ": " + municipality }</h3>
      <Table rows={casesBySex} highlight={r => r[3] > 0}/>
    {/if}

    {#if casesByDate}
      <hr>
      <h3>Cases by date{municipality == "All" ? "" : ": " + municipality }</h3>
      <Table rows={casesByDate}/>
    {/if}
  {/if}
  <div class="f6 mt5">
    <hr>
    <p>
      I created this notebook so I could easily share the state of covid-19 infections where I
      live with friends and family. The data was provided by the <a href="https://www.publichealthgreybruce.on.ca/">Grey Bruce Health Unit</a>
      (thank you, GBHU!) and is updated weekdays around 4pm EST.
    </p>
    <p>
      Note: that there may occasionally be discrepancies
      between what is reported on the <a href="https://www.publichealthgreybruce.on.ca/">GBHU site</a> and what is shown see here.  Unfortunately the mismatch is
      is due to data integrity issues in the spreadsheet provided by the GBHU.  The issues seem to resolve in a day or
      two.
    </p>
  </div>
</main>