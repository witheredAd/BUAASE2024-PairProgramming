// The entry file of your WebAssembly module.

export function bocchiShutUp(flag: i32, seq: i32[], size: i32): i32 {
  var count: i32[] = [0, 0, 0, 0, 0, 0];
  // var count = new Array<i32>(6);

  var start = flag * 10 + 1;
  var end = start + 6
  for (let i: i32 = 0; i < size; i++) {
    if (seq[i] >= start && seq[i] < end) {
      count[seq[i] - start]++;
    }
  }

  // console.log(`${count}`)

  var imax = -1, max = -1;
  for (let i: i32 = 0; i < 6; i++) {
    if (count[i] == max) {
      imax = -2;
    } else if (count[i] > max) {
      imax = i;
      max = count[i]
    }
    // console.log(`count[${i}] = ${count[i]}, max = ${max}, imax = ${imax}`)
  }

  if (imax == -2) {
    return 10;
  }
  return start+imax;
}
