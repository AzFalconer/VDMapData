//Requirements
//Display where all Meteorites have landed on a world map.
//User can tell the relative size of the meteorite, just by looking at the way it's represented on the map.
//User can mouse over the meteorite's data point for additional data.

$(document).ready(function() {

//Variables
let margin = {top: 50, left: 50, right: 50, bottom: 50},
    urlMap = 'https://unpkg.com/world-atlas@1/world/110m.json',
    urlMeteor = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json',
    height = 750 - margin.top - margin.bottom,
    width = 1000 - margin.left - margin.right;

let svg = d3.select("#map")
  .append("svg")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width +margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

let projection = d3.geoMercator() //Creates a new projection using Mercator
  .translate ([width/2,height/2]) //Center it
  //.scale(150) //Zooms in or out (150 seems to fit best in this case...)

let path = d3.geoPath() //Create path using the Mercator projection
  .projection(projection);

let radiusScale = d3.scalePow().exponent(.5).range([2, 40]);
let color = d3.scaleOrdinal(d3.schemeCategory20c);

//Execute
getData();

//Function
function massSort(a, b) {
  return b.properties.mass - a.properties.mass;
}

function getData() {
  d3.queue()
    .defer(d3.json, urlMap) //Get world map with country borders
    .defer(d3.json, urlMeteor) //Get meteorite-strike-data
    .await(gotData);
}

function gotData(error, world, meteors){
  //Clean up meteor data
  //Filter out meteors missing coords or mass.
  meteors.features = meteors.features.filter(m => {return m.geometry !== null && m.properties.mass !== null;})
    .sort(massSort) //Sort meteors by mass descending... So large meteors get rendered before smaller ones.
  //Scale meteor circle radius by meteor mass
  radiusScale.domain(d3.extent(meteors.features, function(d) {return Number(d.properties.mass);}));
  //Draw Countries
  let countries = topojson.feature(world, world.objects.countries).features; //Use topojson to make raw data useable.
  svg.selectAll(".country")
    .data(countries)
    .enter().append("path")
      .attr("class", "country")
      .attr("d", path);
  //Draw Meteor Strikes
  svg.selectAll(".meteor")
    .data(meteors.features)
    .enter().append("circle")
      .attr("class", "meteor")
      .attr("r", function(d) {return radiusScale(parseInt(d.properties.mass));})
      .attr("fill", function(d) {return color(parseInt(d.properties.mass));})
      .attr("transform", function(d) {return ("translate(" + projection([d.geometry.coordinates[0], d.geometry.coordinates[1]]) + ")");});
}//Close gotData
});//Close DocumentReady
