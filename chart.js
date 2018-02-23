var highlight = null;
var selected = null;

var BAR_COLOR = "gold";
var HIGHLIGHT_COLOR = "black";
var SELECTED_COLOR = "gray";
var TODAY_COLOR = "red";


/**
 * Init the graph.
 * @return {[type]} [description]
 */
function initGraph(){
    var chart = d3.select("#chartcontainer").append("svg")
        .attr("class", "graph")
        .attr("width", '100%')
        .attr("height", '100%');
  
    var drawArea = chart.append("g");
    drawArea.attr("id", "drawArea");
    
    return drawArea;
}

function drawGraph(list, drawArea){
    data = list.data;

    // data.forEach(function(d){
    //     console.log(correctTimes(d));
    // });
  
    var width = drawArea.node().parentNode.parentNode.scrollWidth;
    var height = drawArea.node().parentNode.parentNode.scrollHeight - 20;

    var bar_width = width/data.length;


    var earliestStart = d3.min(data, function(d) {
      return correctTimes(d).sunrise;
    });
    var latestEnd = d3.max(data, function(d) {
      return correctTimes(d).sunset;
    });

    var y = d3.scale.linear()
      .domain([earliestStart, latestEnd])
      .range([0, height]);

    var x = d3.scale.linear()
      .domain([0, data.length])
      .range([0, width]);
  
    var bar = drawArea.selectAll("rect")
      .data(data);
  
    bar.enter().append("rect")
        .attr("height", function(d) {
            return y(correctTimes(d).sunset) - y(correctTimes(d).sunrise);
        })
        .attr("y", function(d){
            return y(correctTimes(d).sunrise);
        })
        .attr("x", function(d, i) {
            return x(i) - .5;
        })
      .attr("width", bar_width + .5)
      .attr("fill", function(d) {
        if (isToday(d.sunrise)) {
            return TODAY_COLOR;
        }
        return BAR_COLOR;
      }
      );
  
    bar.transition()
        .attr("height", function(d) {
            return y(correctTimes(d).sunset) - y(correctTimes(d).sunrise);
        })
      .attr("y", function(d){
        return y(correctTimes(d).sunrise);
      })
      .attr("x", function(d, i) {
        return x(i) - .5;
      })
      .attr("width", bar_width + .5)
      .duration(1000);
  
    bar.on("mouseover", function(d, i){
      d3.select(this).attr("fill", HIGHLIGHT_COLOR);
      highlight = i;    
      updateTexts(i);
    });
  
    bar.on("mouseout", function(d,i){
      if (i === selected) {
        d3.select(this).attr("fill", SELECTED_COLOR);
      } else {
        if (isToday(d.sunrise)) {
            d3.select(this).attr("fill", TODAY_COLOR);
            return;
        }
        d3.select(this).attr("fill", BAR_COLOR);
      }
    });
  
    // on right click
    // handle selection
    bar.on("click", function(d, i){
      d3.event.preventDefault();
  
      // unselect current
      if (selected === i) {
        d3.select(this).attr("fill", HIGHLIGHT_COLOR);
        selected = null;
        return;
      }
      // unselect other
      if (selected !== i) {
        d3.select(this.parentNode.childNodes[selected]).attr("fill", BAR_COLOR);
      }
  
      // apply selection
      d3.select(this).attr("fill", SELECTED_COLOR);    
      selected = i;
      updateTexts(i);
    });
  
    // use escape key to clear selection
    d3.select("body").on("keydown", function() {
      if (d3.event.key === "Escape") {
        if (selected) {
          var resetColor = BAR_COLOR;
          if (isToday(data[selected].sunrise)) {
            resetColor = TODAY_COLOR;
          }
          if (selected === highlight) {
            resetColor = HIGHLIGHT_COLOR
          }
          d3.select(d3.select("#drawArea")[0][0].childNodes[selected]).attr("fill", resetColor);
          selected = null;
          updateTexts(highlight);
        }
      }
    });

    function updateTexts(i) {
        if (selected) {
            updateText2(data[i], data[selected]);
          } else {
            updateText2(data[i], data[i-1]);
          }    
    }

    function correctTimes(d) {
        // console.log(d);
        var sunsetTime = getUtcTimeOfDayInSec(d.sunset);
        if (d.sunset.toString() === "Invalid Date" && d.altitude > 0) {
            sunsetTime = 24 * 3600;
        }
        var sunriseTime = getUtcTimeOfDayInSec(d.sunrise);
        if (d.sunrise.toString() === "Invalid Date" && d.altitude > 0) {
            sunriseTime = 0;
        }
        return {
            sunset: sunsetTime,
            sunrise: sunriseTime
        }
    }
}
  