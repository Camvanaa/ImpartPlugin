import { Database } from '../database'
import { FightCalculator } from './fightCalculator'
import { getDickName } from '../function'

export class Dick {
  private static readonly MAX_ENERGY = 240
  private _energy: number = 0
  
  belongings: string = ''
  nickName: string = ''
  length: number = 0
  guid: string = ''
  groupNumber: string = ''
  
  get energy(): number {
    return Math.max(0, Math.min(this._energy, Dick.MAX_ENERGY))
  }
  
  set energy(value: number) {
    this._energy = Math.max(0, Math.min(value, Dick.MAX_ENERGY))
  }
  
  // 战斗功能
  async fight(db: Database, fightEnergyCost: number): Promise<string> {
    if (this.energy < fightEnergyCost) {
      const dickName = getDickName(this.length)
      return `<at id="${this.belongings}"/>，你的${dickName}"${this.nickName}"，体力值不足，无法进行跨服对战！当前体力值为${this.energy}/240`
    }
    
    // 扣除体力
    this.energy -= fightEnergyCost
    await db.updateDickEnergy(this.energy, this.guid)
    
    // 随机获取其他人的牛子
    const randomDick = await db.getRandomDick(this.guid)
    
    if (!randomDick) {
      const dickName = getDickName(this.length)
      return `<at id="${this.belongings}"/>，服务器内没有其他${dickName}！无法进行跨服对战！`
    }
    
    // 获取对手牛子的称呼
    const enemyDickName = getDickName(randomDick.length)
    
    // 计算长度差值
    const differenceValue = this.length - randomDick.length
    
    // 计算战斗结果
    const result = FightCalculator.calculate(this.length, randomDick.length, differenceValue)
    
    const isWin = result.isWin
    const challengerChange = result.challengerChange
    const defenderChange = result.defenderChange
    const winRatePct = result.winRatePct
    
    // 更新长度
    this.length += challengerChange
    randomDick.length += defenderChange
    
    // 获取更新后的称呼（因为长度可能改变）
    const updatedDickName = getDickName(this.length)
    const updatedEnemyDickName = getDickName(randomDick.length)
    
    // 保存数据
    await db.updateDickLength(this.length, this.guid)
    await db.updateDickLength(randomDick.length, randomDick.guid)
    
    // 构建返回信息
    let message = `<at id="${this.belongings}"/>\n你的${updatedDickName}[${this.nickName}]发起了一场跨服对战，对战的对象是${randomDick.belongings}的${updatedEnemyDickName}[${randomDick.nickName}]。\n你战胜的概率为${winRatePct.toFixed(1)}%。\n`
    
    if (isWin) {
      if (challengerChange > 0) {
        message += `你赢了！你的${updatedDickName}增长了${challengerChange.toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}缩短了${Math.abs(defenderChange).toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      } else {
        message += `你赢了！但由于某些原因你的${updatedDickName}缩短了${Math.abs(challengerChange).toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}缩短了${Math.abs(defenderChange).toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      }
    } else {
      if (challengerChange < 0) {
        message += `你输了！你的${updatedDickName}缩短了${Math.abs(challengerChange).toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}增长了${defenderChange.toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      } else {
        message += `你输了！但由于某些原因你的${updatedDickName}增长了${challengerChange.toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}增长了${defenderChange.toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      }
    }
    
    message += `你的当前体力为${this.energy}/240。`
    
    return message
  }

  async groupFight(db: Database, fightEnergyCost: number): Promise<string> {
    // 群内斗牛需要更多体力
    const energyCost = fightEnergyCost * 1.5; 
    
    if (this.energy < energyCost) {
      const dickName = getDickName(this.length)
      return `<at id="${this.belongings}"/>，你的${dickName}"${this.nickName}"，体力值不足，无法进行群内对战！当前体力值为${this.energy}/240`
    }
    
    // 扣除体力
    this.energy -= energyCost
    await db.updateDickEnergy(this.energy, this.guid)
    
    // 随机获取同群内其他人的牛子
    const groupDicks = await db.getDicksInGroup(this.groupNumber)
    const opponentDicks = groupDicks.filter(d => d.belongings !== this.belongings)
    
    if (opponentDicks.length === 0) {
      const dickName = getDickName(this.length)
      return `<at id="${this.belongings}"/>，当前群内没有其他${dickName}！无法进行群内对战！`
    }
    
    // 随机选择一个对手
    const randomDick = opponentDicks[Math.floor(Math.random() * opponentDicks.length)]
    
    // 获取对手牛子的称呼
    const enemyDickName = getDickName(randomDick.length)
    
    // 计算长度差值
    const differenceValue = this.length - randomDick.length
    
    // 计算战斗结果
    const result = FightCalculator.calculate(this.length, randomDick.length, differenceValue)
    
    const isWin = result.isWin
    const challengerChange = result.challengerChange
    const defenderChange = result.defenderChange
    const winRatePct = result.winRatePct
    
    // 更新长度
    this.length += challengerChange
    randomDick.length += defenderChange
    
    // 获取更新后的称呼（因为长度可能改变）
    const updatedDickName = getDickName(this.length)
    const updatedEnemyDickName = getDickName(randomDick.length)
    
    // 保存数据
    await db.updateDickLength(this.length, this.guid)
    await db.updateDickLength(randomDick.length, randomDick.guid)
    
    // 构建返回信息
    let message = `<at id="${this.belongings}"/>\n你的${updatedDickName}[${this.nickName}]发起了一场群内对战，对战的对象是${randomDick.belongings}的${updatedEnemyDickName}[${randomDick.nickName}]。\n你战胜的概率为${winRatePct.toFixed(1)}%。\n`
    
    if (isWin) {
      if (challengerChange > 0) {
        message += `你赢了！你的${updatedDickName}增长了${challengerChange.toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}缩短了${Math.abs(defenderChange).toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      } else {
        message += `你赢了！但由于某些原因你的${updatedDickName}缩短了${Math.abs(challengerChange).toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}缩短了${Math.abs(defenderChange).toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      }
    } else {
      if (challengerChange < 0) {
        message += `你输了！你的${updatedDickName}缩短了${Math.abs(challengerChange).toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}增长了${defenderChange.toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      } else {
        message += `你输了！但由于某些原因你的${updatedDickName}增长了${challengerChange.toFixed(1)}cm，现在为${this.length.toFixed(1)}cm。\n对方的${updatedEnemyDickName}增长了${defenderChange.toFixed(1)}cm，现在为${randomDick.length.toFixed(1)}cm。\n`
      }
    }
    
    message += `你的当前体力为${this.energy}/240。`
    
    return message
  }
} 