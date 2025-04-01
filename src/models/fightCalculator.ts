export class FightCalculator {
  static calculate(
    challengerLength: number,
    defenderLength: number,
    differenceValue: number
  ): {
    isWin: boolean;
    challengerChange: number;
    defenderChange: number;
    winRatePct: number;
  } {
    const differenceValueRate = this.newMapping(differenceValue)
    
    // 增加随机因素
    const randomRate = Math.random() * 0.2
    
    const winRate = randomRate + 80 / 100 / 2 * (differenceValueRate + 1)
    const winRatePct = winRate * 100
    
    const isWin = Math.random() < winRate // 判定胜负
    
    const absDifferenceValue = Math.abs(differenceValue)
    
    const numberList = [
      absDifferenceValue * this.getRandomDouble(0.1, 0.3) + this.getRandomDouble(10, 20),
      2 * (Math.abs(challengerLength) * 0.9 + this.getRandomDouble(10, 15)),
      2 * (Math.abs(defenderLength) * 0.95 + this.getRandomDouble(5, 20))
    ]
    
    // 核心算法部分
    if (isWin) {
      const defenderChangeWhenLose = -Math.min(...numberList)
      const challengerChangeWhenWin = Math.abs(defenderChangeWhenLose) * this.getRandomDouble(0.2, 0.3)
      return { isWin, challengerChange: challengerChangeWhenWin, defenderChange: defenderChangeWhenLose, winRatePct }
    }
    
    const challengerChangeWhenLose = -Math.min(...numberList)
    const defenderChangeWhenWin = Math.abs(challengerChangeWhenLose) * this.getRandomDouble(0.2, 0.3)
    
    // 限制长度变化，防止以小博大
    const result = { isWin, challengerChange: challengerChangeWhenLose, defenderChange: defenderChangeWhenWin, winRatePct }
    result.challengerChange = this.calculateSmallerValue(result.challengerChange, challengerLength)
    result.defenderChange = this.calculateSmallerValue(result.defenderChange, defenderLength)
    
    return result
  }
  
  private static newMapping(value: number): number {
    // 映射函数，将差值映射到[-1,1]区间
    return Math.tanh(value / 10)
  }
  
  private static getRandomDouble(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min
  }
  
  private static calculateSmallerValue(value: number, length: number): number {
    if (value > 0) return Math.min(Math.abs(value), Math.abs(length));
    return -Math.min(Math.abs(value), Math.abs(length));
  }
} 