import { Database } from '../database'
import { FightCalculator } from './fightCalculator'

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
  async fight(db: Database): Promise<string> {
    const perCost = 40 // 从配置中获取
    
    if (this.energy < perCost) {
      return `<at id="${this.belongings}"/> ,你都没有体力了，斗个√8毛！\n目前，你的牛子体力值为${this.energy}/${Dick.MAX_ENERGY}。`
    }
    
    // 扣除体力
    this.energy -= perCost
    await db.updateDickEnergy(this.energy, this.guid)
    
    // 随机匹配对手
    const enemyDick = await db.getRandomDick(this.guid)
    
    if (!enemyDick) {
      return `<at id="${this.belongings}"/>，服务器内没有其他牛子！快邀请一只牛子吧！`
    }
    
    // 计算战斗结果
    const result = FightCalculator.calculate(this.length, enemyDick.length, this.length - enemyDick.length)
    
    const currentLength = this.length
    this.length += result.challengerChange
    
    const enemyCurrentLength = enemyDick.length
    enemyDick.length += result.defenderChange
    
    // 保存结果
    await db.updateDickLength(this.length, this.guid)
    await db.updateDickLength(enemyDick.length, enemyDick.guid)
    
    // 生成战斗消息
    const stringMessage1 = `<at id="${this.belongings}"/> ,你的牛子[${this.nickName}]向${enemyDick.belongings}的牛子[${enemyDick.nickName}]发起了跨服斗牛！本次斗牛消耗了${perCost}点体力，据牛科院物理研究所推测，你的牛子[${this.nickName}]胜率为${result.winRatePct.toFixed(1)}%。`
    
    const stringMessage2 = result.isWin
      ? `可喜可贺的是，你的牛子"${this.nickName}"在斗牛当中获得了胜利！`
      : `不幸的是，你的牛子"${this.nickName}"在斗牛当中遗憾地失败！`
    
    const stringMessage3 = `斗牛结束后，你的牛子[${this.nickName}]的长度由${currentLength.toFixed(1)}cm变化为${this.length.toFixed(1)}cm，变化了${result.challengerChange.toFixed(1)}cm；` +
      `对方牛子[${enemyDick.nickName}]的长度由${enemyCurrentLength.toFixed(1)}cm变化为${enemyDick.length.toFixed(1)}cm，变化了${result.defenderChange.toFixed(1)}cm。`
    
    const stringMessage4 = `\n目前，你的牛子体力值为${this.energy}/${Dick.MAX_ENERGY}。`
    
    return stringMessage1 + stringMessage2 + stringMessage3 + stringMessage4
  }
} 