import { SpecialDick } from './base'
import { Dick } from '../dick'
import { Database } from '../../database'

function getRandomDouble(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min
}

export class TruthDick extends SpecialDick {
  name = '真理牛子'
  energyCost = 60
  
  private readonly successRateList = [0.6, 0.8, 1.0]
  private readonly pctForCalculate = 0.7
  
  constructor(dick: Dick) {
    super(dick)
  }
  
  async execute(db: Database): Promise<string> {
    // 检查体力
    const energyCheck = await this.checkEnergy()
    if (energyCheck) return energyCheck
    
    // 扣除体力
    this.dick.energy -= this.energyCost
    await db.updateDickEnergy(this.dick.energy, this.dick.guid)
    
    // 计算成功率
    const successRate = this.successRateList[Math.floor(Math.random() * this.successRateList.length)]
    const success = Math.random() < successRate
    
    if (!success) {
      return this.getFailureMessage(successRate)
    }
    
    // 获取目标牛子
    const enemyDick = await this.getTargetDick(db)
    if (!enemyDick) {
      return `<at id="${this.dick.belongings}"/>，服务器内没有其他牛子！无法使用${this.name}！`
    }
    
    // 执行攻击
    const result = await this.performAttack(db, enemyDick, successRate)
    return result
  }
  
  private async getTargetDick(db: Database): Promise<Dick | null> {
    const randomNumber = Math.random()
    
    if (randomNumber < 1/3) {
      return await db.getRandomDick(this.dick.guid)
    } else if (randomNumber < 1/2) {
      const topDicks = await db.getFirstNDicksByOrder(1)
      return topDicks[0]
    } else {
      const bottomDicks = await db.getFirstNDicksByOrder(1, 1)
      return bottomDicks[0]
    }
  }
  
  private async performAttack(db: Database, enemyDick: Dick, successRate: number): Promise<string> {
    const enemyOldLength = enemyDick.length
    const restPct = 1 - this.pctForCalculate
    
    // 计算新长度
    const newLength = enemyOldLength > 0
      ? Math.log(enemyOldLength * this.pctForCalculate + 1) + restPct * enemyOldLength
      : -Math.log(Math.abs(enemyOldLength * this.pctForCalculate) + 1) + restPct * enemyOldLength
    
    const lengthDifference = newLength - enemyOldLength
    enemyDick.length = newLength
    await db.updateDickLength(enemyDick.length, enemyDick.guid)
    
    // 掠夺长度
    const winnerGet = -lengthDifference * getRandomDouble(0.1, 0.2)
    this.dick.length += winnerGet
    await db.updateDickLength(this.dick.length, this.dick.guid)
    
    return this.getSuccessMessage(successRate, enemyDick, enemyOldLength, newLength, lengthDifference, winnerGet)
  }
  
  private getSuccessMessage(
    successRate: number,
    enemyDick: Dick,
    enemyOldLength: number,
    newLength: number,
    lengthDifference: number,
    winnerGet: number
  ): string {
    return `<at id="${this.dick.belongings}"/>，你花费${this.energyCost}体力，尝试使用试用牛子"${this.name}"对全服的随机牛子发动追加攻击！
根据星际牛子公司测算，本次追加攻击发动的概率为${successRate * 100}%。天有不测风云，牛有旦夕祸福。${enemyDick.belongings}的牛子[${enemyDick.nickName}]受到了你的攻击!该牛子的长度从${enemyOldLength.toFixed(2)}cm变化为${newLength.toFixed(2)}cm，长度变化为${lengthDifference.toFixed(2)}cm。
在追加攻击发动的同时，你的牛子[${this.dick.nickName}]掠夺了${winnerGet.toFixed(2)}cm的长度，当前长度为${this.dick.length.toFixed(2)}cm。`
  }
  
  private getFailureMessage(successRate: number): string {
    return `<at id="${this.dick.belongings}"/>，你花费${this.energyCost}体力，尝试使用试用牛子"${this.name}"对全服的随机牛子发动追加攻击！
根据星际牛子公司测算，本次追加攻击发动的概率为${successRate * 100}%。天有不测风云，牛有旦夕祸福。然而，你的牛子的追加攻击并没有生效，全服没有任何牛子发生了变化，仅仅是你损失了一些体力而已。`
  }
} 