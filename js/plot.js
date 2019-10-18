var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y),
    yAxis2 = d3.axisLeft(y2);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var line = d3.line()
    .x(function(d) { return x(d.wave); })
    .y(function(d) { return y(d.flux); });

var line2 = d3.line()
    .x(function(d) { return x2(d.wave); })
    .y(function(d) { return y2(d.flux); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("data/flux.csv", type, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.wave; }));
  y.domain([d3.min(data, function(d) { return d.flux; }) - .05, d3.max(data, function(d) { return d.flux; })]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

  context.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line2);

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  // context.append("g")
  //     .attr("class", "axis axis--y")
  //     .call(yAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, [0, 78.2]);
});

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);

  // removes handle to resize the brush
  d3.selectAll('.brush>.handle').remove();
  // removes crosshair cursor
  d3.selectAll('.brush>.overlay').remove();

}

function type(d) {
  d.wave = +d.wave;
  d.flux = +d.flux;
  return d;
}