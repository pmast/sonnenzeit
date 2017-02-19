var timeFormat = d3.time.format("%H:%M:%S");
var dateFormat = d3.time.format("%Y-%m-%d");

/**
 * Checki fgiven date is today.
 * @param  {[type]}  d [description]
 * @return {Boolean}   [description]
 */
function isToday(d){
  today = new Date();
  if(today.getFullYear() == d.getFullYear() && today.getDate() == d.getDate() && today.getMonth() == d.getMonth())
    return true;
  return false;
}



function init(){
  var currentLocation = {lng:8.336389, lat:54.651667};

  // amrum
  var currentLocation = {lng:8.336389, lat:54.651667};

  // rio
  // currentLocation = {lat: -22.908333,lng: -43.196389};

  // pitcairn
  // currentLocation = {lat: -24.362180,lng: -128.377562};

  // nuuk
  // currentLocation = {lat: 64.204170,lng: -51.278792};

  // alaska
  // currentLocation = {lat: 68.550344,lng: -66.576181};

  // var currentLocation = {lat: -22.908333, lng: -43.196389};

  var times = getList(currentLocation);

  times = calculateDeltas(times);
  console.log(times);

  var chart = initGraph();
  drawGraph(times, chart);

  var map = initMap(currentLocation);
  map.on("moveend",function(e){
    var c = map.getCenter().wrap();
    updateGraph(c, chart);
  });
  return;
}

/**
 * Init the map.
 * @param  {[type]} center [description]
 * @return {[type]}        [description]
 */
function initMap(center){
  var map = L.map('map', {
    // maxBounds: L.latLngBounds([-90, -180], [90, 180])
  }).setView([center.lat, center.lng], 2);
  L.tileLayer('http://maps.vesseltracker.com/vesseltracker/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18,
    // noWrap: true
  }).addTo(map);
  return map;
}

/**
 * Init the graph.
 * @return {[type]} [description]
 */
function initGraph(){
  d3.select("body").append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

  var chart = d3.select("#chartcontainer").append("svg")
      .attr("class", "graph")
      .attr("width", '100%')
      .attr("height", '100%');

    return chart;
}

/**
 * Set date to start of Year
 * @param {[type]} date [description]
 */
function setToStartOfYear(date){
  date.setMonth(0);
  date.setDate(1);
  date.setHours(12, 0, 0, 0);
  return date;
}

/**
 * Calcualte all times for a given date and location
 * @param  {[type]} date     [description]
 * @param  {[type]} location [description]
 * @return {[type]}          [description]
 */
function getLocationObject(date, location) {
  // calculate the last day's duration
  var sunTimes = SunCalc.getTimes(date, location.lat, location.lng);
  var duration = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();
  var altitude = SunCalc.getPosition(sunTimes.solarNoon, location.lat, location.lng).altitude;

  // TODO: handle when sun never rieses and sets
  return {
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    date: new Date(date),
    duration: duration,
    altitude: altitude
  }
}

/**
 * Calculate the offset of the sunrise relative to the the previous sunrise
 * @param  {[type]} times [description]
 * @return {[type]}       [description]
 */
function calculateDeltas(times){
  var previous = times.previous;
  var delta = 0;
  for (var i = 0; i < times.data.length; i++) {
    var current = times.data[i];
    delta += (current.sunrise - previous.sunrise);
    delta -= 24 * 3600 * 1000; // subtract 24h
    times.data[i].delta = delta;
    previous = current;
  }
  return times;
}

/**
 * Calculate the complete list of of sunsetsunrise objects for a given location
 * @param  {[type]} currentLocation [description]
 * @return {[type]}                 [description]
 */
function getList(currentLocation){

  var currentDate = setToStartOfYear(new Date());

  var year = currentDate.getFullYear();
  var data = [];
  var o;
  var today = null;
  var delta = 0;

  // calculate the last day's duration
  var prevDate = new Date(currentDate);
  prevDate.setDate(prevDate.getDate() - 1);
  var previousTimes = getLocationObject(prevDate, currentLocation);
  console.log(getLocationObject(prevDate, currentLocation));

  while (currentDate.getFullYear() == year){
    var currentTimes = getLocationObject(currentDate, currentLocation);
    data.push(currentTimes);
    currentDate.setDate(currentDate.getDate()+1);
    //
    // var sunTimes = SunCalc.getTimes(currentDate, currentLocation.lat, currentLocation.lng);
    // var sunrise = sunTimes.sunrise;
    // var sunset = sunTimes.sunset;
    // var altitude = SunCalc.getPosition(sunTimes.solarNoon, currentLocation.lat, currentLocation.lng).altitude;
    // var duration = sunset.getTime() - sunrise.getTime();
    //
    // if (!isNaN(sunrise.getTime()) && !isNaN(prevSunTimes.sunrise)){
    //   delta = delta + ((sunrise.getTime() - prevSunTimes.sunrise.getTime())-24*3600*1000);
    // } else {
    //   // console.log(NaN);
    // }
    //
    // if (isNaN(sunrise.getTime()) && altitude > 0){
    //   duration = 24*3600*1000;
    // }
    //
    // if (isNaN(sunrise.getTime()) && altitude < 0){
    //   duration = 0;
    // }
    //
    // prevSunTimes = sunTimes;
    //
    // if (o != null){
    //   o.nextDuration = duration;
    //   data.push(o);
    //   if (isToday(o.date))
    //     today = data.length - 1;
    // }
    //
    // o = {sunrise: sunrise,
    //   sunset: sunset,
    //   date: new Date(currentDate),
    //   duration: duration,
    //   prevDuration: prevDuration,
    //   delta: delta,
    //   altitude: altitude
    // };
    //
    // prevDuration = duration;
    // currentDate.setDate(currentDate.getDate()+1);
  }
  var nextTimes = getLocationObject(currentDate, currentLocation);

  // a = SunCalc.getTimes(currentDate, currentLocation.lat, currentLocation.lng);
  // o.nextDuration = a.sunset.getTime() - a.sunrise.getTime();
  // data.push(o);
  return {
    previous: previousTimes,
    next: nextTimes,
    data: data
  };
}

function getColor(d, i, highlight){
  highlight = highlight == null ? false : highlight;
  if (isToday(d.date))
    return "red";
  if (highlight)
    return "orange";
  return "gold"
}

var highlight;

function drawGraph(list, chart){
  data = list.data;

  // if (highlight) {
  //   i = highlight.i;
  // } else {
  //   i = today;
  // }
  // var previous = i > 0 ? data[i-1] : null;
  // var next = i < data.length ? data[i+1] : null;
  // updateText(data[i], previous, next);


  var max = d3.max(data, function(d) {
    return d.delta + d.duration;
  });
  var min = d3.min(data, function(d) {
    return d.delta;
  });

  width = chart.node().parentNode.scrollWidth;
  height = chart.node().parentNode.scrollHeight - 20;


  bar_width = width/data.length;

  t = 24*1000*3600 - (max - min);

  y = d3.scale.linear().domain([min-t/2, max+t/2]).range([0, height]);
  x = d3.scale.linear().domain([0, data.length]).range([0, width]);

  var bar = chart.selectAll("rect")
    .data(data);

  var old_index;

  bar.enter().append("rect")
    .attr("y", function(d){
      // if (isNaN(d.sunrise.getTime()) && d.altitude > 0)
      // 	return 0;
      // if (isNaN(d.sunrise.getTime()) && d.altitude < 0)
      // 	return height/2;
      return y(d.delta);
    })
    .attr("x", function(d, i) {
      return x(i) - .5;
    })
    .attr("width", bar_width + .5)
    .attr("height", function(d, i){
      if (isNaN(d.sunset.getTime()) && d.altitude < 0){
        return 0;
      }
      if (isNaN(d.sunset.getTime()) && d.altitude > 0)
        return height;
      return y(d.delta + d.duration) - y(d.delta);
    })
    .attr("fill", function(d, i){
      return getColor(d, i);
    });

  bar.transition()
    .attr("height", function(d){

      if (isNaN(d.sunset.getTime()) && d.altitude < 0){
        return 0;
      }
      if (isNaN(d.sunset.getTime()) && d.altitude > 0){
        return height;
      }
      return y(d.delta + d.duration) - y(d.delta);
    })
    .attr("y", function(d){
      if (isNaN(d.sunrise.getTime()) && d.altitude < 0){
        return parseInt(d3.select(this).attr("y")) + parseInt(d3.select(this).attr("height"))/2;
      }
      return y(d.delta);
    })
    .attr("x", function(d, i) {
      return x(i) - .5;
    })
    .duration(1000);
  bar.on("mouseover", function(d,i){
    d3.select(this).attr("fill", '#2b2b2b');

      if (highlight != null){
        d3.select(highlight.element).attr("fill", getColor(highlight.d, highlight.i));
      }

      highlight = {
        element: this,
        d:d,
        i:i
      };
      old_index = i;

      var previous = i > 0 ? data[i-1] : null;
      var next = i < data.length ? data[i+1] : null;

      updateText(d, previous, next);
  });
  bar.on("mouseout", function(d,i){
    d3.select(this).attr("fill", getColor(d, i, true));
  });

}
