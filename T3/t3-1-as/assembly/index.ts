export function mancalaBoard(flag: i32, seq: i32[], size: i32): i32[] {
  var board = new Board()
  
  var status: i32
  var isEnd = false
  var board_re: i32[]
  var flag_: i32

  status = seq[0] / 10
  flag_ = 0
  for(let i = 0; i < size; i ++) {
    // 结束了还在走
    if (isEnd) {
      flag_ = 1
      break
    }

    // 走的人不对
    let posInfo = extractOperation(seq[i])
    if (posInfo.status != status) {
      flag_ = 1
      break
    }

    // 下了空洞
    let res = board.seed(posInfo.status, posInfo.offset)
    if (res == -1) {
      flag_ = 1
      break
    }

    status = res

    isEnd = board.isEnd()
  }

  if(flag_ == 1){
    if(flag == 1){
      return addEle(board.hole, 200 + 2 * board.hole[board.scoreHole(1)] - 48)
    }
    return addEle(board.hole, 200 - 2 * board.hole[board.scoreHole(2)] + 48)
  }

  if (isEnd) {
    return addEle(board.hole,200 + 
      board.hole[board.scoreHole(1)] - board.hole[board.scoreHole(2)])
  }   
  return addEle(board.hole,status)
}

function addEle(hole: i32[], add: i32): i32[]{
  var result: i32[]
  result = hole.map((e:i32) =>e)
  result.push(add)
  return result
}

function extractOperation(opr: i32): PosInfo {
  if (opr > 20) {
    return new PosInfo(2, opr - 20)
  } else {
    return new PosInfo(1, opr - 10)
  }
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
