"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = exports.Leaderboard = exports.Gamestatus = void 0;
exports.calculateLevel = calculateLevel;
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
// Point-Lvl-System
function calculateLevel(points) {
    return __awaiter(this, void 0, void 0, function* () {
        const levelThresholds = [
            0, // Level 1
            100, // Level 2
            250, // Level 3
            500, // Level 4
            850, // Level 5
            1300, // Level 6
            1850, // Level 7
            2500, // Level 8
            3250, // Level 9
            4100, // Level 10
            5050, // Level 11
            10000, // Level 12
            11050, // Level 13
            12200, // Level 14
            13450, // Level 15
            14800, // Level 16
            16250, // Level 17
            17800, // Level 18
            19450, // Level 19
            21200, // Level 20
            23050, // Level 21
            25000, // Level 22
            27050, // Level 23
            29200, // Level 24
            31450, // Level 25
            33800, // Level 26
            36250, // Level 27
            38800, // Level 28
            41450, // Level 29
            44200, // Level 30
            47050, // Level 31
            49000, // Level 32
            51050, // Level 33
            53200, // Level 34
            55450, // Level 35
            57800, // Level 36
            60250, // Level 37
            62800, // Level 38
            65450, // Level 39
            68200, // Level 40
            71050, // Level 41
            74000, // Level 42
            77050, // Level 43
            80200, // Level 44
            83450, // Level 45
            86800, // Level 46
            90250, // Level 47
            93800, // Level 48
            97450, // Level 49
            101200, // Level 50
            105050, // Level 51
            109000, // Level 52
            113050, // Level 53
            117200, // Level 54
            121450, // Level 55
            125800, // Level 56
            130250, // Level 57
            134800, // Level 58
            139450, // Level 59
            144200, // Level 60
            149050, // Level 61
            154000, // Level 62
            159050, // Level 63
            164200, // Level 64
            169450, // Level 65
            174800, // Level 66
            180250, // Level 67
            185800, // Level 68
            191450, // Level 69
            197200, // Level 70
            203050, // Level 71
            209000, // Level 72
            215050, // Level 73
            221200, // Level 74
            227450, // Level 75
            233800, // Level 76
            240250, // Level 77
            246800, // Level 78
            253450, // Level 79
            260200, // Level 80
            267050, // Level 81
            274000, // Level 82
            281050, // Level 83
            288200, // Level 84
            295450, // Level 85
            302800, // Level 86
            310250, // Level 87
            317800, // Level 88
            325450, // Level 89
            333200, // Level 90
            341050, // Level 91
            349000, // Level 92
            357050, // Level 93
            365200, // Level 94
            373450, // Level 95
            381800, // Level 96
            390250, // Level 97
            398800, // Level 98
            407450, // Level 99
            416200 // Level 100
        ];
        // Find lvl of user
        for (let i = 1; i < levelThresholds.length; i++) {
            if (points < levelThresholds[i]) {
                return i;
            }
        }
        // If user has reached lvl 100, the array length is returned
        return levelThresholds.length;
    });
}
//# sourceMappingURL=Resources.js.map