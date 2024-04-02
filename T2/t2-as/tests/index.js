import assert from "assert";
import { mancalaResult } from "../build/debug.js";
var seq = [13, 16, 26, 12, 16, 11, 22, 25, 13, 16, 15, 21, 16, 14, 25, 22, 16, 15, 24, 16, 14, 23, 15, 21, 16, 14, 24, 12, 26, 13, 16, 15, 16, 14, 16, 15, 25, 16, 11, 26]
var score1 = 36
var score2 = 12
assert(mancalaResult(1, seq, seq.length), 15024)
console.log("ok");
