// The entry file of your WebAssembly module.

export function mancalaResult(flag: i32, seq: i32[], size: i32): i32 {
  var board = new Board()
  var status: i32
  var isEnd = false

  status = flag
  for(let i = 0; i < size; i ++) {
    // 结束了还在走
    if (isEnd) {
      return 30000 + i
    }

    // 走的人不对
    let posInfo = extractOperation(seq[i])
    if (posInfo.status != status) {
      return 30000 + i
    }

    // 下了空洞
    let res = board.seed(posInfo.status, posInfo.offset)
    if (res == -1) {
      return 30000 + i
    }

    status = res

    isEnd = board.isEnd()
  }

  if (isEnd) {
    return 15000 + 
      board.hole[board.scoreHole(flag)] - board.hole[board.scoreHole(board.opStatus(flag))]
  } 
    
  return 20000 + 
    board.hole[board.scoreHole(flag)]
}

function extractOperation(opr: i32): PosInfo {
  if (opr > 20) {
    return new PosInfo(2, opr - 20)
  } else {
    return new PosInfo(1, opr - 10)
  }
}

export function test(): void {
  var board = new Board()

  let posInfo = board.getPosInfo(0)
  console.log(`${posInfo.status}, ${posInfo.offset}`)
  posInfo = board.getPosInfo(1)
  console.log(`${posInfo.status}, ${posInfo.offset}`)
  posInfo = board.getPosInfo(6)
  console.log(`${posInfo.status}, ${posInfo.offset}`)
  posInfo = board.getPosInfo(9)
  console.log(`${posInfo.status}, ${posInfo.offset}`)
  posInfo = board.getPosInfo(13)
  console.log(`${posInfo.status}, ${posInfo.offset}`)

  console.log(`${board.getPosFromInfo(1, 1)}`)
  console.log(`${board.getPosFromInfo(1, 3)}`)
  console.log(`${board.getPosFromInfo(1, 6)}`)
  console.log(`${board.getPosFromInfo(2, 1)}`)
  console.log(`${board.getPosFromInfo(2, 3)}`)
  console.log(`${board.getPosFromInfo(2, 7)}`)

  for (let pos = 0; pos < 14; pos ++) {
    let posInfo = board.getPosInfo(pos)
    assert(board.getPosFromInfo(posInfo.status, posInfo.offset) == pos)
  }

  console.log(`${board.getOppositeHole(0)}`)
  console.log(`${board.getOppositeHole(1)}`)
  console.log(`${board.getOppositeHole(8)}`)
  
  for (let pos = 0; pos < 14; pos ++) {
    if (pos == 6 || pos == 13) {
      continue;
    }

    assert(board.getOppositeHole(board.getOppositeHole(pos)) == pos)
  }

  assert(board.next(13) == 0)
  for (let pos = 0; pos < 13; pos ++) {
    assert(board.next(pos) == pos + 1)
  }

  for (let pos = 0; pos < 6; pos ++) {
    assert(board.isSelfMovableHole(1, pos) == true)
    assert(board.isSelfMovableHole(2, pos) == false)
  }
  for (let pos = 7; pos < 13; pos ++) {
    assert(board.isSelfMovableHole(1, pos) == false)
    assert(board.isSelfMovableHole(2, pos) == true)
  }
  assert(board.isSelfMovableHole(1, 6) == false)
  assert(board.isSelfMovableHole(2, 6) == false)
  assert(board.isSelfMovableHole(1, 13) == false)
  assert(board.isSelfMovableHole(2, 13) == false)

  assert(board.scoreHole(1) == 6)
  assert(board.scoreHole(2) == 13)

  assert(board.opStatus(1) == 2)
  assert(board.opStatus(2) == 1)


  assert(board.isEnd() == false)
  assert(board.seed(1, 3) == 1)
  assert(board.hole[board.scoreHole(1)] == 1)
  assert(board.isEnd() == false)
  assert(board.seed(1, 5) == 2)
  assert(board.hole[board.scoreHole(1)] == 2)
  assert(board.isEnd() == false)
  assert(board.seed(2, 2) == 2)
  assert(board.hole[board.scoreHole(2)] == 1)
  assert(board.isEnd() == false)
  
  console.log("ok")
  console.log(`${board.hole[board.getPosFromInfo(2, 2)]}`)
  // AS100 not implemented exceptions
  assert(board.seed(2, 2) == -1)
  console.log(`${board.hole[board.getPosFromInfo(2, 2)]}`)
  assert(board.isEnd() == false)
  assert(board.seed(2, 1) == 1)
  assert(board.hole[board.scoreHole(2)] == 1)
  assert(board.isEnd() == false)

  assert(board.seed(1, 1) == 2)
  assert(board.hole[board.scoreHole(1)] == 4)
  assert(board.isEnd() == false)
  console.log(`${board.hole}`)

  board.hole = [0, 0, 0, 0, 0, 2, 20, 2, 0, 0, 0, 0, 0, 0]
  assert(board.seed(1, 6) == 2)
  assert(board.isEnd() == true)


  console.log("ok")
}

class PosInfo {
  constructor(public status: i32, public offset: i32){}
}

class Board {
  hole: i32[]
  constructor(){
    this.hole = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]
  }
  // 返回下一次应该轮到谁
  seed(status: i32, pos1: i32): i32 {
    var pos = this.getPosFromInfo(status, pos1)
    var num = this.hole[pos];
    if(num <= 0){
      return -1
    }

    this.hole[pos] = 0

    for(var i = this.next(pos);;i = this.next(i)){
      if(i == this.scoreHole(this.opStatus(status))){
        continue
      }
      this.hole[i]++
      num--
      if(num <= 0){
        break
      }
    }

    switch(this.result(i, status)) {
      case 1:
        return status
      case 2:
        let scoreHolePos = this.scoreHole(status)
        this.hole[scoreHolePos] += this.hole[i] + this.hole[this.getOppositeHole(i)]
        this.hole[i] = this.hole[this.getOppositeHole(i)] = 0
        return this.opStatus(status)
      case 3:
        return this.opStatus(status)
    }
    return -1
  }
  getPosFromInfo(status: i32, offset: i32): i32{
    if(status == 1){
      return offset - 1
    }else{
      return offset + 7 - 1
    }
  }
  result(end: i32, status: i32): i32{       
    //return 1 : again; 2 : 
    if(end == this.scoreHole(status)){
      return 1
    }
    if(this.hole[end] == 1 && 
      this.isSelfMovableHole(status, end) && 
      this.hole[this.getOppositeHole(end)] > 0
    ) {
      return 2
    }
    return 3
  }
  getOppositeHole(pos: i32): i32 {
    var posInfo = this.getPosInfo(pos)
    return this.getPosFromInfo(
      this.opStatus(posInfo.status),
      7 - posInfo.offset
    )
  }
  next(i: i32): i32{
    return (i+1)%this.hole.length
  }
  scoreHole(status: i32): i32{
    return status * 7 - 1
  }
  // 返回 [status, offset]
  getPosInfo(pos: i32): PosInfo {
    if (pos >= 0 && pos < 7) {
      return new PosInfo(1, pos + 1)
    } else {
      return new PosInfo(2, pos - 7 + 1)
    }
  }
  isSelfMovableHole(status: i32, pos : i32): boolean{
    let posInfo = this.getPosInfo(pos)
    return posInfo.status == status && posInfo.offset != 7
  }
  opStatus(status: i32): i32{
    if(status == 1){
      return 2
    }else{
      return 1
    }
  }

  isEnd(): boolean {
    for (let status = 1; status <= 2; status ++) {
      var offset : i32
      for(offset = 1; offset <= 6; offset ++) {
        if (this.hole[this.getPosFromInfo(status, offset)] > 0) {
          break
        }
      }
      if (offset == 7)
        return true
    }

    return false
  }
}
