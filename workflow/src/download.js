const xlsxFile = require("read-excel-file/node");
const fs = require("fs/promises")
const fetch = require("node-fetch");

async function loadSpreadsheet(filename){
  const rows = await xlsxFile(filename);
  const headings = rows.shift();
  const result = [];
  rows.forEach((row, i) => {
    if( row[0] === null ) return;
    if( row[4] === null ) return;
    const municipality = row[4].toLowerCase().replace("–", "-");
    let splitter = municipality.indexOf("-") > 0 ? "-" : " "
    row[4] = municipality.split(splitter).map( m => m.charAt(0).toUpperCase() + m.slice(1)).join(splitter);
    if( row[4] === "Hanvoer" ) {
      row[4] = "Hanover";
    } else if( row[4] === "Kincardines" ){
      row[4] = "Kincardine";
    }
    row[2] = row[2].toUpperCase();
    result.push(row);
  })
  result.unshift(headings);
  return result;
}

(async () => {
  const res = await fetch("https://extranet.publichealthgreybruce.on.ca/COVID/Case_Log_GBHU.xlsx")
  const buffer = await res.buffer();
  await fs.writeFile("Case_Log_GBHU.xlsx", buffer);
  let rows = await loadSpreadsheet( "Case_Log_GBHU.xlsx");
  await fs.writeFile("../ui/public/greybruce.json", JSON.stringify(rows, null, 2));
  await fs.unlink("Case_Log_GBHU.xlsx");
})()