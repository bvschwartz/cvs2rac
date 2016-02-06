/* jshint strict: true, node: true, multistr: true, expr: true, asi: true */
"use strict";

// CONFIG
var outputDir = "Races"

// IMPORTS
var fs = require("fs")
var mkdirp = require("mkdirp")
var _ = require("lodash")
var Converter = require("csvtojson").Converter
var converter = new Converter({})

// GLOBALS
var csvData = fs.readFileSync("PIRC2016_HeatSheet.csv", "UTF8")

converter.fromString(csvData, function(err,result) {
    // get rid of empty lines, keep lines with an "Event"
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
    events = _.mapValues(events, function(heat) {
        return _.groupBy(heat, function(line) {
            return lanesNameFromLine(line)
        })
    })
    //events.forEach(function(event) {
    //    console.log("event: %s: %s rowsers", event)
    //})
    /*
    Object.keys(events).forEach(function(name) {
        var event = events[name]
        console.log("heat: %s: %s rowers", name, event.length)
    })
    */
    //dumpEvents(events)
    //var raceLines = createRace(events['Heat1']['1-10'])
    //writeRaceFile(raceLines)

    // each heat gets divided by lanes groups: 1-10, 11-20, 21-30, 31-40
    _.forOwn(events, function(heat) {
        _.forOwn(heat, function(heatLanes) {
            var raceLines = createRace(heatLanes)
            writeRaceFile(raceLines)
        })
    })
})

function lanesNameFromLine(line) {
    if (line.Lane <= 10) return "1-10"
    if (line.Lane <= 20) return "11-20"
    if (line.Lane <= 30) return "21-30"
    if (line.Lane <= 40) return "31-40"
    error("bad line: " + JSON.stringify(line))
}

// generate the lines of an RAC file
function createRace(race) {
    //console.log(race)
    var lanesName = lanesNameFromLine(race[0])
    var raceName = "Heat" + race[0].Heat + "_" + lanesName
    var m = lanesName.match(/(.*)-(.*)/)
    var firstLane = parseInt(m[1], 10)
    var lastLane = parseInt(m[2], 10)
    console.log("creating race: " + raceName)
    var raceLines = [
        "RACE",
        "108",
        "0",
        "<race name>",
        "<race distance>",
        "0",
        "0",
        "1",
        "500",
        "120",
        "10",
    ]
    raceLines[3] = raceName
    raceLines[4] = race[0].distance
    var i = firstLane
    _.forOwn(race, function(line) {
        var lane = line.Lane
        var name
        for (var x = i; x < lane; x++) {
            name = "Lane " + x
            pushRace(name, x)
        }
        name = line.Last_Name + "," + line.First_Name
        pushRace(name, lane)
        i = lane + 1
    })
    raceLines.push("0")
    //console.log(raceLines)
    for (var x = i; x < lastLane; x++) {
        var name = "Lane " + x
        pushRace(name, x)
    }

    function pushRace(name, lane) {
        raceLines.push(name)
        raceLines.push("0")
        raceLines.push("")
        raceLines.push("")
        raceLines.push("")
        console.log("  %s created lane %s: %s", raceName, lane, name)
    }

    return raceLines
}

// generate the lines of an RAC file
function writeRaceFile(raceLines) {
    var raceName = raceLines[3]     // e.g. Heat12_11-20.rac
    console.log(raceName)
    var lanesName = raceName.match(/_(.*)$/)[1]
    var dirPath = outputDir + "/" + lanesName
    mkdirp.sync(dirPath)
    var path = dirPath + "/" + raceName + ".rac"
    console.log("writing %s", path)
    fs.writeFileSync(path, raceLines.join("\r\n"))
}

function error(msg) {
    throw new Error(msg)
}

function dumpEvents(events) {
    console.log(JSON.stringify(events, null, 4))
}
