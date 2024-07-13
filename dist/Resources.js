"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpirationTime = exports.Country = exports.Leaderboard = exports.Gamestatus = exports.loserPoints = exports.winnerPoints = exports.teamLoserPoints = exports.teamWinnerPoints = exports.shipDestroyedPoints = exports.hitPoints = exports.Team2Name = exports.Team1Name = void 0;
exports.calculateLevel = calculateLevel;
exports.Team1Name = "Wasser-Wrestler";
exports.Team2Name = "See-Soldaten";
exports.hitPoints = 5;
exports.shipDestroyedPoints = 15;
exports.teamWinnerPoints = 150;
exports.teamLoserPoints = 50;
exports.winnerPoints = 100;
exports.loserPoints = 30;
var Gamestatus;
(function (Gamestatus) {
    Gamestatus["Active"] = "active";
    Gamestatus["Waiting"] = "waiting";
    Gamestatus["Full"] = "full";
    Gamestatus["Finished"] = "finished";
    Gamestatus["Test"] = "test";
})(Gamestatus || (exports.Gamestatus = Gamestatus = {}));
var Leaderboard;
(function (Leaderboard) {
    Leaderboard["Global"] = "global";
    Leaderboard["Local"] = "local";
})(Leaderboard || (exports.Leaderboard = Leaderboard = {}));
var Country;
(function (Country) {
    Country["DE"] = "DE";
})(Country || (exports.Country = Country = {}));
// Only used to set a expiration time
var ExpirationTime;
(function (ExpirationTime) {
    ExpirationTime[ExpirationTime["TwentyFourHours"] = 86400000] = "TwentyFourHours";
})(ExpirationTime || (exports.ExpirationTime = ExpirationTime = {}));
let difference = 150;
let levelThresholds = [0, 100];
for (let i = 2; i < 100; i++) {
    levelThresholds.push(levelThresholds[i - 1] + difference);
    difference += 100;
}
// Point-Lvl-System
function calculateLevel(points) {
    // Find lvl of user
    for (let i = 1; i < levelThresholds.length; i++) {
        if (points < levelThresholds[i]) {
            return i;
        }
    }
    // If user has reached lvl 100, the array length is returned
    return levelThresholds.length;
}
// equivalent to
//  0,         // Level 1
//  100,       // Level 2
//  250,       // Level 3
//  500,       // Level 4
//  850,       // Level 5
//  1300,      // Level 6
//  1850,      // Level 7
//  2500,      // Level 8
//  3250,      // Level 9
//  4100,     // Level 10
//  5050,     // Level 11
//  6100,     // Level 12
//  7250,     // Level 13
//  8500,     // Level 14
//  9850,     // Level 15
//  11300,    // Level 16
//  12850,    // Level 17
//  14500,    // Level 18
//  16250,    // Level 19
//  18100,    // Level 20
//  20050,    // Level 21
//  22100,    // Level 22
//  24250,    // Level 23
//  26500,    // Level 24
//  28850,    // Level 25
//  31300,    // Level 26
//  33850,    // Level 27
//  36500,    // Level 28
//  39250,    // Level 29
//  42100,    // Level 30
//  45050,    // Level 31
//  48100,    // Level 32
//  51250,    // Level 33
//  54500,    // Level 34
//  57850,    // Level 35
//  61300,    // Level 36
//  64850,    // Level 37
//  68500,    // Level 38
//  72250,    // Level 39
//  76100,    // Level 40
//  80050,    // Level 41
//  84100,    // Level 42
//  88250,    // Level 43
//  92500,    // Level 44
//  96850,    // Level 45
//  101300,   // Level 46
//  105850,   // Level 47
//  110500,   // Level 48
//  115250,   // Level 49
//  120100,   // Level 50
//  125050,   // Level 51
//  130100,   // Level 52
//  135250,   // Level 53
//  140500,   // Level 54
//  145850,   // Level 55
//  151300,   // Level 56
//  156850,   // Level 57
//  162500,   // Level 58
//  168250,   // Level 59
//  174100,   // Level 60
//  180050,   // Level 61
//  186100,   // Level 62
//  192250,   // Level 63
//  198500,   // Level 64
//  204850,   // Level 65
//  211300,   // Level 66
//  217850,   // Level 67
//  224500,   // Level 68
//  231250,   // Level 69
//  238100,   // Level 70
//  245050,   // Level 71
//  252100,   // Level 72
//  259250,   // Level 73
//  266500,   // Level 74
//  273850,   // Level 75
//  281300,   // Level 76
//  288850,   // Level 77
//  296500,   // Level 78
//  304250,   // Level 79
//  312100,   // Level 80
//  320050,   // Level 81
//  328100,   // Level 82
//  336250,   // Level 83
//  344500,   // Level 84
//  352850,   // Level 85
//  361300,   // Level 86
//  369850,   // Level 87
//  378500,   // Level 88
//  387250,   // Level 89
//  396100,   // Level 90
//  405050,   // Level 91
//  414100,   // Level 92
//  423250,   // Level 93
//  432500,   // Level 94
//  441850,   // Level 95
//  451300,   // Level 96
//  460850,   // Level 97
//  470500,   // Level 98
//  480250,   // Level 99
//  490100,  // Level 100
//# sourceMappingURL=Resources.js.map