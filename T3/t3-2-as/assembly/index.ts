function assess(board: Board, flag: i32): f32 {
  const cloned_board = board.clone()
  if (cloned_board.isEnd()) {
    cloned_board.clear()
  }
  const me_score = cloned_board.hole[cloned_board.scoreHole(flag)]
  const you_score = cloned_board.hole[cloned_board.scoreHole(cloned_board.opStatus(flag))]

  if (cloned_board.isEnd()) {
    if (me_score > you_score) {
      return 1
    } else if (me_score == you_score) {
      return 0
    } else {
      return -1
    }
  }

  return 0.01 * f32(me_score - you_score)
}

// flag 是要赢的一方，now_play 是本轮要下子的一方
function minimax(board: Board, flag: i32, now_play: i32, alpha: f32, beta: f32, depth: i32): f32 {
  if (depth == 0 || board.isEnd()) {
    return assess(board, flag)
  }

  const legal_actions = board.getHoleNotEmpty(now_play)
  if (now_play == flag) {
    for (let i = 0; i < legal_actions.length; i++) {
      const cloned_board = board.clone()
  
      const next_play = cloned_board.seed(now_play, legal_actions[i])

      alpha = max(
        alpha, minimax(cloned_board, flag, next_play, alpha, beta, depth - 1)
      )

      if (alpha >= beta) {
        break
      }
    }
    return alpha
  } else {
    for (let i = 0; i < legal_actions.length; i++) {
      const cloned_board = board.clone()
  
      const next_play = cloned_board.seed(now_play, legal_actions[i])

      beta = min(
        beta, minimax(cloned_board, flag, next_play, alpha, beta, depth - 1)
      )

      if (alpha >= beta) {
        break
      }
    }
    return beta
  }
}

class AwardInfo {
  constructor(public offset: i32, public award: f32){}
}

export function mancalaOperator(flag: i32, status: i32[]): i32 {
  const board = new Board()
  board.hole = status


  const legal_actions = board.getHoleNotEmpty(flag)
  
  let award_infos: AwardInfo[] = []
  for (let i = 0; i < legal_actions.length; i ++) {
    const cloned_board = board.clone()
    cloned_board.seed(flag, legal_actions[i])
    new AwardInfo (
      legal_actions[i],
      minimax(cloned_board, flag, flag, -100, 100, 2)
    )
  }
  award_infos = award_infos.sort((a, b) => i32((a.award - b.award) * 100))

  const max_awards:AwardInfo[] = []
  for (let i = 0; i < legal_actions.length; i++) {
    if (Math.abs(award_infos[i].award - award_infos[0].award) < 1e-9) {
      max_awards.push(award_infos[i])
    }
  }

  const choice = i32(Math.random() * max_awards.length)
  return flag * 10 + max_awards[choice].offset
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
  clear(): void{
    var sum1: i32
    var sum2: i32

    sum1 = sum2 = 0
    for(let i:i32 = 1;i <= 6;i++){
      sum1 += this.hole[this.getPosFromInfo(1, i)]
      this.hole[this.getPosFromInfo(1, i)] = 0
      sum2 += this.hole[this.getPosFromInfo(2, i)]
      this.hole[this.getPosFromInfo(2, i)] = 0
    }
    this.hole[this.scoreHole(1)] += sum1
    this.hole[this.scoreHole(2)] += sum2
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

  // 返回 status 玩家面前的所有不为空的棋洞编号（1-6）
  getHoleNotEmpty(status: i32): i32[] {
    const res: i32[] = []
    for (let i = 1; i <= 6; i ++){
      const pos = this.getPosFromInfo(status, i)
      if (this.hole[pos] > 0) {
        res.push(i)
      }
    }

    return res
  }

  clone(): Board {
    const new_board = new Board()
    new_board.hole = this.hole.map<i32>(e=>e)
    return new_board
  }
}
