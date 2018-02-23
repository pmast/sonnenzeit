var timeFormat = d3.time.format("%H:%M:%S");
var dateFormat = d3.time.format("%Y-%m-%d");





function init(){


  var currentLocation = {lng:8.336389, lat:54.651667};
  
  // hamburg
  var currentLocation = {lng: 9.995285, lat: 53.554765};

  // amrum
  // var currentLocation = {lng: 8.336389, lat: 54.651667};

  // rio
  // currentLocation = {lat: -22.908333,lng: -43.196389};

  // pitcairn
  // currentLocation = {lat: -24.362180,lng: -128.377562};

  // nuuk
  // currentLocation = {lat: 64.204170,lng: -51.278792};

  // alaska
  // currentLocation = {lat: 68.550344,lng: -66.576181};

  // var currentLocation = {lat: -22.908333, lng: -43.196389};

// console.log(SunCalc.getTimes(new Date('2018-01-01 12:00'), currentLocation.lat, currentLocation.lng)); 
// console.log(SunCalc.getPosition(new Date('2018-01-01 12:00'), currentLocation.lat, currentLocation.lng)); 

// console.log(SunCalc.getTimes(new Date('2018-08-01 12:00'), currentLocation.lat, currentLocation.lng)); 
// console.log(SunCalc.getPosition(new Date('2018-08-01 12:00'), currentLocation.lat, currentLocation.lng)); 

  // get list of the sun-time for the complete year
  var times = getList(currentLocation);

  var chart = initGraph();
  drawGraph(times, chart);

  var map = initMap(currentLocation);
  map.on("moveend",function(e){
    var c = map.getCenter().wrap();
    updateGraph(c, chart);
  });
  return;
}

function updateGraph(center, chart) {
  var times = getList(center);
  drawGraph(times, chart);
}

/**
 * Init the map.
 * @param  {[type]} center [description]
 * @return {[type]}        [description]
 */
function initMap(center){
  var map = L.map('map', {
    // maxBounds: L.latLngBounds([-90, -180], [90, 180])
  }).setView([center.lat, center.lng], 5);
  L.tileLayer('http://maps.vesseltracker.com/vesseltracker/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18,
    // noWrap: true
  }).addTo(map);
  return map;
}

/**
 * Return the date at the start of the yearSet date to start of Year
 * @param {[type]} date [description]
 */
function getFirstDayOfYear(date){
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
function getList(location){
  var data = [];
  var now = new Date();
  var firstDayOfYear = getFirstDayOfYear(now);
  var year = now.getFullYear();

  // calculate the previous day's data
  var prevDate = new Date(firstDayOfYear);
  prevDate.setDate(prevDate.getDate() - 1);  
  var previousTimes = getLocationObject(prevDate, location);

  var currentDate = new Date(firstDayOfYear);
  while (currentDate.getFullYear() == year){
    var currentTimes = getLocationObject(currentDate, location);
    data.push(currentTimes);
    currentDate.setDate(currentDate.getDate()+1);
  }
  var nextTimes = getLocationObject(currentDate, location);

  return {
    previous: previousTimes,
    next: nextTimes,
    data: data
  };
}
