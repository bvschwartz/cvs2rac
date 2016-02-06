Converts a Concept2 CRASH-B heat sheet and generates .rac files

Built in requirements:
* 40 ERGs total in 4 groups of 10
* The 500 meter event is named "FamRow"
* The 1000 meter event names end in "-1k"
* The heats and lanes have already been set up
* Column names are: Ev#,Event,Team,First_Name,Last_Name,Age,Sex,Lwt,2k Time,Heat,Time,Lane,Crash-B
* Unused lanes are labeled "LANE n"

.rac file format

= Header
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
LINE 10: <number of racers, e.g. "10">

= For each lane
LINE 0: <name>
LINE 1: 0
LINE 2: <blank>
LINE 3: <country, e.g. "USA">
LINE 4: <birth date "03041997">

= Footer
LINE: 0
