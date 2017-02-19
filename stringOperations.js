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
