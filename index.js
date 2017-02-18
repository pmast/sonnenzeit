// var chart;
var tzOffset;
var timeFormat = d3.time.format("%H:%M:%S");
var dateFormat = d3.time.format("%Y-%m-%d");
var now = new Date();

function isToday(d){
  today = new Date();
  if(today.getFullYear() == d.getFullYear() && today.getDate() == d.getDate() && today.getMonth() == d.getMonth())
    return true;
  return false;
}

function init(){

  var p = {lng:8.336389, lat:54.651667};
  var d = new Date();


  // amrum
  var p = {lng:8.336389, lat:54.651667};

  // rio
  // p = {lat: -22.908333,lng: -43.196389};

  // pitcairn
  // p = {lat: -24.362180,lng: -128.377562};

  // nuuk
  // p = {lat: 64.204170,lng: -51.278792};

  // alaska
  // p = {lat: 68.550344,lng: -66.576181};

  // var p = {lat: -22.908333, lng: -43.196389};

  var chart = initGraph();
  updateGraph(p, chart);

  var map = initMap(p);
  map.on("moveend",function(e){
    var c = map.getCenter().wrap();
    updateGraph(c, chart);
  });
  return;
}

function initMap(p){
  var map = L.map('map', {
    // maxBounds: L.latLngBounds([-90, -180], [90, 180])
  }).setView([p.lat, p.lng], 2);
  L.tileLayer('http://maps.vesseltracker.com/vesseltracker/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18,
    // noWrap: true
  }).addTo(map);
  return map;
}

function initGraph(){
  d3.select("body").append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

  var chart = d3.select("#chartcontainer").append("svg")
      .attr("class", "graph")
      .attr("width", '100%')
      .attr("height", '100%');

    // chart =
    return chart;
}

function getList(p){

  var d = new Date();
  d.setMonth(0);
  d.setDate(0);
  d.setHours(12, 0, 0, 0);

  var year = d.getFullYear()+1;
  var data = [];
  var o;
  var today = null;
  var old_a = SunCalc.getTimes(d, p.lat, p.lng);
  var delta = 0;
  var prevDuration = old_a.sunset.getTime() - old_a.sunrise.getTime();

  d.setDate(d.getDate()+1);

  while (d.getFullYear() == year){

    a = SunCalc.getTimes(d, p.lat, p.lng);
    sr = a.sunrise;
    ss = a.sunset;
    altitude = SunCalc.getPosition(a.solarNoon, p.lat, p.lng).altitude;
    duration = ss.getTime() - sr.getTime();

    if (!isNaN(sr.getTime()) && !isNaN(old_a.sunrise)){
      delta = delta + ((sr.getTime() - old_a.sunrise.getTime())-24*3600*1000);
    } else {
      // console.log(NaN);
    }

    if (isNaN(sr.getTime()) && altitude > 0){
      duration = 24*3600*1000;
    }

    if (isNaN(sr.getTime()) && altitude < 0){
      duration = 0;
    }

    old_a = a;

    if (o != null){
      o.nextDuration = duration;
      data.push(o);
      if (isToday(o.date))
        today = data.length - 1;
    }

    o = {sunrise: sr,
      sunset: ss,
      date: new Date(d),
      duration: duration,
      prevDuration: prevDuration,
      delta: delta,
      altitude: altitude
    };
    prevDuration = duration;
    d.setDate(d.getDate()+1);
  }
  a = SunCalc.getTimes(d, p.lat, p.lng);
  o.nextDuration = a.sunset.getTime() - a.sunrise.getTime();
  data.push(o);
  return {
    today: today,
    data: data
  };
}

function getColor(d, i, highlight){
  highlight = highlight == null ? false : highlight;
  if (dateFormat(d.date) == dateFormat(now))
    return "red";
  if (highlight)
    return "orange";
  return "gold"
}

function getDurationString(ms){

  var tmp = ms/1000/60/60;

  var h = Math.floor(Math.abs(tmp));
  var min = Math.floor((Math.abs(tmp) - h)*60);
  var sec = Math.floor((Math.abs(tmp) - h - min/60)*3600);

  return ((tmp < 0) ? "-" : "") + d3.format("02d")(h) + ":" + d3.format("02d")(min) + ":" + d3.format("02d")(sec);
}

function getDurationString2(ms){
  if (ms==0)
    return "the same length";
  var tmp = ms/1000/60/60;

  var h = Math.floor(Math.abs(tmp));
  var hText = "";
  if (h === 1)
    hText = d3.format("d")(h) + " hour";
  if (h > 1)
    hText = d3.format("d")(h) + " hours";

  var min = Math.floor((Math.abs(tmp) - h)*60);
  var minText = "";
  if (min === 1)
    minText = " " + d3.format("d")(min) + " minute";
  if (min > 1)
    minText = " " + d3.format("d")(min) + " minutes";

  var sec = Math.floor((Math.abs(tmp) - h - min/60)*3600);
  var secText = "";
  if (sec === 1)
    secText = " " + d3.format("d")(sec) + " second";
  if (sec > 1)
    secText = " " + d3.format("d")(sec) + " seconds";

  return hText +
    minText +
    secText;
}

function updateText(d, previous, next){
  var previousLabel = "The previous day";
  var nextLabel = "The next day";
  var day = "this day";
  var verb1 = " was ";
  var verb2 = " is ";

  if (isToday(d.date)){
    day = "today";
    nextLabel = "Tomorrow";
    previousLabel = "Yesterday";
  }

  if (previous) {
    var dayLabel = "this day";
    var erliearRise = d.sunrise - previous.sunrise - 24 * 60 * 60 * 1000;
    sunriseText = "The sun rose " + getDurationString2(Math.abs(erliearRise)) + " " + ((erliearRise > 0) ? "earlier":"later") + " than " + day;
    var erliearSet = d.sunset - previous.sunset - 24 * 60 * 60 * 1000;
    sunsetText = "The sun set " + getDurationString2(Math.abs(erliearSet)) + " " + ((erliearSet > 0) ? "earlier":"later") + " than " + day;
  }

  if (d.duration - d.prevDuration == 0){
    verb1 = " had ";
  }
  if (d.duration - d.nextDuration == 0){
    verb2 = " has ";
  }

        d3.select("#texts")
          .html("<b>" + dateFormat(d.date) + "</b><br>"
      + "Length of " + day + ": " + getDurationString(d.duration) + "<br>"
      + previousLabel + verb1 + getDurationString2(d.duration - d.prevDuration)  + ((d.duration - d.prevDurationp > 0) ? " shorter" : " longer") + " than " + day + ".<br>"
      + sunriseText + "<br>"
      + sunsetText + "<br>"
      + nextLabel + verb2 + getDurationString2(d.duration - d.nextDuration) + ((d.duration - d.nextDuration > 0) ? " shorter" : " longer") + " than " + day + ".<br>"
      );

}

var highlight;

function updateGraph(p, chart){
  var data = getList(p);
  var today = data.today;
  data = data.data;

  if (highlight) {
    i = highlight.i;
  } else {
    i = today;
  }
  var previous = i > 0 ? data[i-1] : null;
  var next = i < data.length ? data[i+1] : null;
  updateText(data[i], previous, next);


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
