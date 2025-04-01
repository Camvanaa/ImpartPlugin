import { Dick } from '../dick'
import { Database } from '../../database'

export abstract class SpecialDick {
  abstract name: string
  abstract energyCost: number
  
  constructor(protected dick: Dick) {}
  
  abstract execute(db: Database): Promise<string>
  
  protected async checkEnergy(): Promise<string | null> {
    if (this.dick.energy < this.energyCost) {
      return `<at id="${this.dick.belongings}"/>，你的牛子"${this.dick.nickName}"，体力值不足，无法使用${this.name}！当前体力值为${this.dick.energy}/240`
    }
    return null
  }
} 