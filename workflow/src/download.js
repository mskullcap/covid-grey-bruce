const xlsxFile = require("read-excel-file/node");
const fs = require("fs/promises")
const fetch = require("node-fetch");

async function loadSpreadsheet(filename){
  let rows = await xlsxFile(filename, { dateFormat: 'YYYY-MM-DD' });
  const headings = rows.shift();
  const result = [];
  rows = rows.sort((a,b) => (a[1].getTime() > b[1].getTime()) ? 1 : -1);
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
    if( row[2] === null ) row[2] = "M";
    row[1] = formatDate(row[1]);
    row[7] = formatDate(row[7]);
    row[8] = formatDate(row[8]);
    row[2] = row[2].toUpperCase();
    result.push(row);
  })
  result.unshift(headings);
  return result;
}

function formatDate(d){
    if( d == null ) return null;
    let m = d.getMonth() + 1;
    let day = d.getDate();
    if( m < 10 ) m = "0" + m;
    if( day < 10 ) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
}

(async () => {
  const res = await fetch("https://extranet.publichealthgreybruce.on.ca/COVID/Case_Log_GBHU.xlsx")
  const buffer = await res.buffer();
  await fs.writeFile("Case_Log_GBHU.xlsx", buffer);
  let rows = await loadSpreadsheet( "Case_Log_GBHU.xlsx");
  await fs.writeFile("../ui/public/greybruce.json", JSON.stringify(rows, null, 2));
  await fs.unlink("Case_Log_GBHU.xlsx");
})()
