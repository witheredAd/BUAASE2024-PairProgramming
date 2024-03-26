import assert from "assert";
import { bocchiShutUp } from "../build/debug.js";

assert.strictEqual(bocchiShutUp(1, [11, 15, 15, 21, 21, 16, 12], 7), 15);
console.log("ok");
