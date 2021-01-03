import camelize from "./camelize";

class Covid19 {
  // "Case No",
  // "Date",
  // "Sex",
  // "Age Range",
  // "Municipality",
  // "LTC Cases",
  // "Healthcare Workers",
  // "Date Case Resolved",
  // "Date of Death",
  // "Update Date"

  constructor( rows, endDate ) {
    this.rows = rows;
    this.headings = rows.shift().map( h => h.toLowerCase());
    this.total = rows.length;
    this.municipality = [...new Set(rows.map(item => item[this.indexOf("Municipality")]))];
    this.ageRange = [...new Set(rows.map(item => item[this.indexOf("Age Range")]))];
    this.sex = [...new Set(rows.map(item => item[this.indexOf("Sex")]))];
    this.dates = [...new Set(rows.map(item => item[this.indexOf("Date")]))];
    this.startDate = this.dates[0];
    if( endDate ) this.endDate = endDate;
    else this.endDate = this.dates[this.dates.length-1];
    this.newCases = this.rows.filter( r => r[1] === this.endDate ).length;
    this.cache = {};
    this.fieldCache = {};
    this.max = -1;
    this.last = this.dates[this.dates.length-1];
    const dd = new Date();
    let y, m, d;
    if( this.last ){
      [ y, m, d ] = this.last.split("-");
      dd.setFullYear(y);
      dd.setDate(d);
      dd.setMonth(m-1);
      this.daysAgo = Math.ceil((new Date().getTime() - dd.getTime())/86400000);
    }
  }

  maxPerDay(){
    if( this.max !== -1 ) return this.max;
    const data = this.highlightBy("dates", "Date");
    let max = 0;
    data.shift();
    data.forEach(row => max = max > row["Total Cases"] ? max : row["Total Cases"]);
    this.max = max;
    return this.max;
  }

  indexOf( field ){
    const f = field.toLowerCase();
    return this.headings.findIndex( h => h === f);
  }

  data(){
    const result = [...this.rows];
    result.unshift();
    return result;
  }

  dataAsJson(){
    const result = [...this.rows];
    result.unshift();
    const o = [];
    const dateIndex = this.indexOf( "Date" );
    const sexIndex = this.indexOf( "Sex" );
    const ageRangeIndex = this.indexOf( "Age Range" );
    const municipalityIndex = this.indexOf( "Municipality" );
    result.forEach( r => {
      o.push({
        "Date": r[dateIndex],
        "Sex": r[sexIndex],
        "Age Range": r[ageRangeIndex],
        "Municipality": r[municipalityIndex]
      });
    });
    return o;
  }

  filterBy( field, value ){
    const i = this.indexOf( field );
    if( i === -1) return null;

    let c1 = this.cache[field];
    if( c1 === undefined ){
      c1 = {};
      this.cache[field] = c1;
    }
    if( c1[value] !== undefined ) return c1[value];
    const result = this.rows.filter( row => row[i] === value );
    result.unshift(this.headings);
    c1[value] = new Covid19(result, this.endDate);
    return c1[value];
  }

  highlightBy(field, title){
    const createHighlight = (f, c, t, l) => {
      const o = {};
      o[title] = f;
      o["Total Cases"] = parseInt(c);
      o["Active Cases"] = parseInt(t);
      o["New Cases"] = parseInt(l);
      return o;
    };

    const highlights = [];
    let active = this.filterBy("Date Case Resolved", null );
    let latest = this.filterBy("Date", this.endDate);
    highlights.push( createHighlight( "All", this.total, active.total, latest.total));

    this[field].sort().forEach( f => {
      const local = this.filterBy(title, f);
      active = local.filterBy("Date Case Resolved", null );
      latest = local.filterBy("Date", this.endDate);
      highlights.push( createHighlight( f, local.total, active.total, latest.total));
    });

    return highlights;
  }

  maxPerDayGroupedBy(field ){
    let max = 0;

    const i = this.indexOf( field );
    if( i === -1) return null;

    const fieldCamelCase = camelize(field); // Age Range -> ageRange

    this[fieldCamelCase].forEach( f => {
      const m = this.filterBy(field, f);
      if( m.maxPerDay() > max ) max = m.maxPerDay();
    });
    return max;
  }
}

export default Covid19;
