/**
 * returns the seconds of a day for a given timestamp
 * @param {*} date the local date
 * @return {[type]}   UTC time of the day in seconds
 */

function getUtcTimeOfDayInSec(date) {
    return date.getUTCHours() * 3600 +
      date.getUTCMinutes() * 60 +
      date.getUTCSeconds() +
      date.getUTCMilliseconds() / 1000;
  }  

function diffInDays(date1, date2) {
    var t1 = new Date(date1);
    var t2 = new Date(date2);
    t1.setMilliseconds(0);
    t1.setSeconds(0);
    t1.setMinutes(0);
    t1.setHours(0);
    t2.setMilliseconds(0);
    t2.setSeconds(0);
    t2.setMinutes(0);
    t2.setHours(0);
    return (t1 - t2) / 1000 / 3600 / 24;
}

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