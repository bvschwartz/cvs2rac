/* jshint strict: true, node: true, multistr: true, expr: true, asi: true */
"use strict";

var fs = require("fs")
var _ = require("lodash")
var Converter = require("csvtojson").Converter
var converter = new Converter({})

var csvData = fs.readFileSync("PIRC2016_HeatSheet.csv", "UTF8")
converter.fromString(csvData, function(err,result) {
    // get rid of empty lines
    result = _.filter(result, "Event")
    // give each line an "event name"
    result.forEach(function(line) {
        line.eventName = line['Ev#'] + "-" + line.Event
        line.heatName = "Heat" + line.Heat
        if (line.Event.match(/FamRow/))
            line.distance = 500
        else if (line.Event.match(/1k$/))
            line.distance = 1000
        else 
            line.distance = 2000
    })
    result = _.sortBy(result, [ "heatName", "Lane" ])
    // group by heat
    var events = _.groupBy(result, "heatName")
    //events.forEach(function(event) {
    //    console.log("event: %s: %s rowsers", event)
    //})
    /*
    Object.keys(events).forEach(function(name) {
        var event = events[name]
        console.log("heat: %s: %s rowers", name, event.length)
    })
    */
    console.log(JSON.stringify(events, null, 4))

    // each heat gets divided by lanes groups: 1-10, 11-20, 21-30, 31-40
})

