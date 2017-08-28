

var sensorId = 2
//GET THE DATA
$.ajax({

    type: 'GET',
    // The URL to make the request to.
    url: 'https://noodle-northwestern.herokuapp.com/api/data/' + sensorId,
    contentType: 'text/plain',
    xhrFields: {
        withCredentials: false
    },
    success: function(data) {
        drawChart(data, "#chart3", ["soil", "water", "light"], "Reading");
        drawChart(data, "#chart1", ["temp"], "Temperature (C)");
        drawChart(data, "#chart2", ["humid"], "Humidity (%)");
        drawChart(data, "#chart4", ["light"], "Light (scale)");
        //loading sensor data single sensor display on html
        var temp = (data[(data.length-1)].temp).substr(0, 4);
        $("#temp").html(temp + "°F");
        var humid = (data[(data.length-1)].humid).substr(0, 4);
        $("#humid").html(humid + "%");
        var soil = (data[(data.length-1)].soil).substr(0, 4);
        $("#soil").html((soil * 100) + "%");
        var light = (data[(data.length-1)].light).substr(0, 4);
        if (light < .2) {
          var lightDisplay = ("Dark");
        } else if (light < .3) {
          var lightDisplay = ("Dim");
        } else if (light < .7) {
          var lightDisplay = ("Day");
        } else if(light < 1) {
          var lightDisplay = ("Bright");
        }
        $("#light").html(lightDisplay);
    },

    error: function() {
        console.log("error");
    }
});

var drawChart = function(data, targetDiv, keys, yAxisLabel){


    var margin = {top:35, right: 50, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
    .range([0, width]);

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
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.reading); });

    var svg = d3.select(targetDiv).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //this line chooses which keys we want to have as series in the chart
    color.domain(keys);

    data.forEach(function(d) {
        d.date = Date.parse(d.createdAt);
    });

    var sensors = color.domain().map(function(name) {
    return {
    name: name,
    values: data.map(function(d) {
        return {date: d.date, reading: +d[name]};
    })
    };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
        d3.min(sensors, function(c) { return d3.min(c.values, function(v) { return v.reading; }); }),
        d3.max(sensors, function(c) { return d3.max(c.values, function(v) { return v.reading; }); })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisLabel);

    var sensor = svg.selectAll(".sensor")
        .data(sensors)
        .enter().append("g")
        .attr("class", "sensor");

    sensor.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .attr("data-legend",function(d) { return d.name})
        .style("stroke", function(d) { return color(d.name); });

    sensor.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.reading) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });


    legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend)

    setTimeout(function() {
    legend
        .style("font-size","20px")
        .attr("data-style-padding",10)
        .call(d3.legend)
    },1000)

};
