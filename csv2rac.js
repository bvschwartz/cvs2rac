/* jshint strict: true, node: true, multistr: true, expr: true, asi: true */
"use strict";

// CONFIG
var outputDir = "Races"
var saveStrokes = false
var sameDir = true

// IMPORTS
var fs = require("fs")
var mkdirp = require("mkdirp")
var _ = require("lodash")
var Converter = require("csvtojson").Converter
var converter = new Converter({})

// GLOBALS
var csvData = fs.readFileSync("HeatSheet.csv", "utf8")

converter.fromString(csvData, function(err,result) {
    // get rid of empty lines, keep lines with an "Event"
    result = _.filter(result, "Event")
    //console.log(JSON.stringify(result, null, 4))
    // give each line an "event name"
    result.forEach(function(line) {
        line.heatName = "Heat" + line.Heat
        if (line.Event.match(/FamRow/))
            line.distance = 500
        else if (line.Event.match(/\b500m\b/))
            line.distance = 500
        else if (line.Event.match(/\b1k\b/))
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
    console.log("bad line: lane=" + line.Lane + " " + JSON.stringify(line))
    if (line.Lane > 40) {
        return "31-40"
    }
}

// generate the lines of an RAC file
function createRace(race) {
    //console.log(race)
    var lanesName = lanesNameFromLine(race[0])
    var raceName = "Heat" + race[0].Heat + "_" + lanesName
    var m = lanesName.match(/(.*)-(.*)/)
    var firstLane = parseInt(m[1], 10)
    var lastLane = parseInt(m[2], 10)
    console.log("creating race: " + raceName + ", distance=" + race[0].distance)
    var raceLines = [
        "RACE",
        "108",
        "0",
        "XXX",  // race name
        "XXX",  // race distance in meters (or time in seconds)
        "0",    // 0 = meters, 1 = seconds
        "0",
        "XXX",  // 1=save stroke data
        "500",  // split interval in meters
        "120",  // split interval in seconds
        "10",   // number of ergs
    ]
    raceLines[3] = raceName
    raceLines[4] = race[0].distance
    raceLines[7] = saveStrokes ? "1" : "0"
    var i = firstLane
    if (race.length > 10) {
        console.log("too many rowers: " + race.length)
    }
    _.forOwn(race, function(line) {
        var lane = line.Lane
        var name
        // add any "missing" lanes
        for (var x = i; x < lane; x++) {
            name = "Lane " + x
            pushRace(name, x)
        }
        name = line["Rower Name"] || (line.Last_Name + "," + line.First_Name)
        pushRace(name, lane)
        i = lane + 1
    })
    //console.log(raceLines)
    // add regular lane
    for (var x = i; x <= lastLane; x++) {
        var name = "Lane " + x
        pushRace(name, x)
    }
    // the trailing 0
    raceLines.push("0")

    function pushRace(name, lane) {
        raceLines.push(name)    // name
        raceLines.push("0")     // 0
        raceLines.push("")      // blank
        raceLines.push("USA")   // country
        raceLines.push("")      // birthdate MMDDYYYY
        console.log("  %s created lane %s: %s", raceName, lane, name)
    }

    return raceLines
}

// generate the lines of an RAC file
function writeRaceFile(raceLines) {
    var raceName = raceLines[3]     // e.g. Heat12_11-20.rac
    console.log(raceName)
    var lanesName = raceName.match(/_(.*)$/)[1]
    var dirPath = outputDir
    if (!sameDir) {
        dirPath += "/" + lanesName
    }
    mkdirp.sync(dirPath)
    var path = dirPath + "/" + raceName + ".rac"
    console.log("writing %s", path)
    fs.writeFileSync(path, raceLines.join("\r\n"), "utf8")
}

function error(msg) {
    throw new Error(msg)
}

function dumpEvents(events) {
    console.log(JSON.stringify(events, null, 4))
}
