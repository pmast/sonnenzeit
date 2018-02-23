function getDurationString(ms){

  var tmp = ms/1000/60/60;

  var h = Math.floor(Math.abs(tmp));
  var min = Math.floor((Math.abs(tmp) - h)*60);
  var sec = Math.floor((Math.abs(tmp) - h - min/60)*3600);

  return ((tmp < 0) ? "-" : "") + d3.format("02d")(h) + ":" + d3.format("02d")(min) + ":" + d3.format("02d")(sec);
}

function getDurationString2(sec){
  if (sec==0)
    return "the same length";
  var tmp = sec / 3600;

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


function getSunriseText(currentTime, selectedTime) {
  var difSunRise = getUtcTimeOfDayInSec(currentTime.sunrise) - getUtcTimeOfDayInSec(selectedTime.sunrise);
  var sunRiseText = "The sun rises " + getDurationString2(difSunRise);

  if (difSunRise < 0) {
    sunRiseText += " earlier";
  } else {
    sunRiseText += " later";
  }
  return sunRiseText;
}

function getSunSetText(currentTime, selectedTime) {
  var difSunset = getUtcTimeOfDayInSec(currentTime.sunset) - getUtcTimeOfDayInSec(selectedTime.sunset);
  var sunSetText = "The sun sets " + getDurationString2(difSunset);

  if (difSunset < 0) {
    sunSetText += " earlier";
  } else {
    sunSetText += " later";
  }
  return sunSetText;
}

function getDurationText(currentTime, selectedTime) {
  var currentDuration = (currentTime.sunset.getTime() - currentTime.sunrise.getTime()) / 1000;
  var selectedDuration = (selectedTime.sunset.getTime() - selectedTime.sunrise.getTime()) / 1000;
  var difDuration = currentDuration - selectedDuration;
  var sunRiseText = "This day is " + getDurationString2(difDuration);

  if (difDuration < 0) {
    sunRiseText += " shorter";
  } else {
    sunRiseText += " longer";
  }
  return sunRiseText;
}

function updateText2(currentTime, selectedTime) {
  var compareToText = dateFormat(selectedTime.sunset);
  if (diffInDays(currentTime.sunrise, selectedTime.sunrise) === 1) {
    compareToText = "the day before";
  }
  if (isToday(selectedTime.sunrise)) {
    compareToText = "today";
  }

  var todaytext = dateFormat(currentTime.sunrise);
  if (isToday(currentTime.sunrise)) {
    todaytext = "today";
  }

  d3.select("#texts").html("<b>" + todaytext + "</b> compared to <b>" + compareToText + "</b>:<br>"
    + getSunriseText(currentTime, selectedTime) + "<br>"
    + getSunSetText(currentTime, selectedTime) + "<br>"
    + getDurationText(currentTime, selectedTime) + "<br>"
    
  );
}