var viz = function($element,layout,_this) {

	var id = senseUtils.setupContainer($element,layout,"d3vl_multi_line"),
		ext_width = $element.width(),
		ext_height = $element.height(),
		classDim = layout.qHyperCube.qDimensionInfo[1].qFallbackTitle.replace(/\s+/g, '-');

	var data = layout.qHyperCube.qDataPages[0].qMatrix;

	var margin = {top: 20, right: 20, bottom: 30, left: 20},
	    width = ext_width - margin.left - margin.right,
	    height = ext_height - margin.top - margin.bottom;


	var x = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.dim(1).qText); })
	    .y(function(d) { return y(d.measure(1).qNum); });

	var svg = d3.select("#" + id).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);

	x.domain(data.map(function(d) { return d.dim(1).qText; }));
 	y.domain(d3.extent(data, function(d) { return d.measure(1).qNum; }));

	var label_width = getLabelWidth(yAxis,svg);

	svg.selectAll(".temp_text")
		.data(data.map(function(d) { return d.dim(2).qText; }))
		.enter()
		.append("text")
		.attr("class","temp_text")
		.text(function(d) {return d});

	var series_label_width = d3.max(svg.selectAll(".temp_text")[0], function(d) {return d.clientWidth});

	// Remove the temp labels
	svg.selectAll(".temp_text").remove();

	// Update the margins, plot width, and x scale range based on the label size
	margin.left = margin.left + label_width;
	margin.right = margin.right + series_label_width;
	width = ext_width - margin.left - margin.right;
	x.rangePoints([0, width]);

	var plot = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	color.domain(data.map(function(d) { return d.dim(2).qText; }));

	var nest = d3.nest()
				.key(function(d) { return d.dim(2).qText})
				.entries(data);

	  plot.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  plot.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(senseUtils.getMeasureLabel(1,layout));

	  var series = plot.selectAll(".series")
	      .data(nest)
	    .enter().append("g")
	      .attr("class", "series");

	  series.append("path")
	      .attr("class", "line "+classDim)
	      .attr("id", function(d) { return d.key; })
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.key); })
	      .on("click", function(d) {
	      	d.values[0].dim(2).qSelect();
	      })
	      .on("mouseover", function(d){
	      	d3.selectAll($("."+classDim+"#"+d.key)).classed("highlight",true);
	      	d3.selectAll($("."+classDim+"[id!="+d.key+"]")).classed("dim",true);
	      })
	      .on("mouseout", function(d){
	      	d3.selectAll($("."+classDim+"#"+d.key)).classed("highlight",false);
	      	d3.selectAll($("."+classDim+"[id!="+d.key+"]")).classed("dim",false);
	      });

	  series.append("text")
	      .datum(function(d) { return {name: d.key, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + x(d.value.dim(1).qText) + "," + y(d.value.measure(1).qNum) + ")"; })
	      .attr("x", 3)
	      .attr("dy", ".35em")
	      .text(function(d) { return d.name; })
	      .on("click", function(d) {
	      	d.value.dim(2).qSelect();
	      });

}