Converts a Concept2 CRASH-B heat sheet and generates .rac files
===============================================================

We used this program with the  spreadsheet generated from regatta
central to build out all the .rac files needed for the PIRC on
2/9/2016.

The .rac files can be opened directly into the Concept2 Venue Race
Application.

This program does not set up lane assignments. You need to set up
all the heats and lanes in a spreadsheet. This program will then
generate all the .rac files needed to run the race

You'll need a Unix box (Mac or Linux) running Node to use it.
Ask your friendly neighborhood techie.

Install and Run
---------------

    npm install
    node csv2rac

Notes
-----
* Heat sheet is in CSV format
* Required column names: `Event`, `First_Name`, `Last_Name`, `Heat`, `Lane`
* Heat sheet named `HeatSheet.csv`
* 10 ergs/lanes per heat numbered 1-10
* The 500 meter event is named `FamRow`
* The 1000 meter event names end in `-1k`
* All other events are 2000m
* Unused lanes will labeled `LANE n`
* Results put in `Races` directory

.rac file format
================

DOS-style \r\n line terminators

### Header
    LINE 0: RACE
    LINE 1: 108
    LINE 2: 0
    LINE 3: <race name, eg. "Heat9_1-10">
    LINE 4: <race distance or time in seconds, e.g. "2000", or "300">
    LINE 5: 0 <0=distance, 1=time>
    LINE 6: 0
    LINE 7: 1 <1=save stroke data>
    LINE 8: <split interval, e.g. "500">
    LINE 9: <split time, e.g. "120">
    LINE 10: <number of ergs, e.g. "10">

### For each lane
    LINE 0: <name>
    LINE 1: 0
    LINE 2: <blank>
    LINE 3: <country, e.g. "USA">
    LINE 4: <birth date "03041997">

### Footer
    LINE: 0

