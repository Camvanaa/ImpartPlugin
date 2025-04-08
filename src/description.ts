import { Context } from 'koishi'
import { ItemType, Rarity } from './types'
import { config } from './config'

export class DescriptionManager {
  constructor(private ctx: Context) {}

  /**
   * 获取物品描述
   */
  getItemDescription(itemType: ItemType): string {
    switch (itemType) {
      case ItemType.TRUTH_DICK:
        return config.descriptions.truthDick
      case ItemType.DICK_NORMAL:
      case ItemType.DICK_RARE:
      case ItemType.DICK_EPIC:
      case ItemType.DICK_LEGENDARY:
      case ItemType.DICK_MYTHIC:
        return config.descriptions.dick
      case ItemType.BALL_NORMAL:
      case ItemType.BALL_RARE:
      case ItemType.BALL_EPIC:
      case ItemType.BALL_LEGENDARY:
      case ItemType.BALL_MYTHIC:
        return config.descriptions.ball
      default:
        return '未知物品'
    }
  }

  /**
   * 获取稀有度名称
   */
  getRarityName(rarity: Rarity): string {
    switch (rarity) {
      case Rarity.NORMAL:
        return '普通'
      case Rarity.RARE:
        return '稀有'
      case Rarity.EPIC:
        return '史诗'
      case Rarity.LEGENDARY:
        return '传说'
      case Rarity.MYTHIC:
        return '神话'
      default:
        return '未知'
    }
  }

  /**
   * 获取物品名称
   */
  getItemName(itemType: ItemType, rarity: Rarity): string {
    const rarityName = this.getRarityName(rarity)
    if (itemType === ItemType.TRUTH_DICK) {
      return '真理牛子'
    }
    if (itemType.startsWith('dick_')) {
      return `${rarityName}牛子`
    }
    if (itemType.startsWith('ball_')) {
      return `${rarityName}蛋蛋`
    }
    return '未知物品'
  }

  /**
   * 获取随机成功事件
   */
  getRandomSuccessEvent(): string {
    const events = config.descriptions.successEvents
    return events[Math.floor(Math.random() * events.length)]
  }

  /**
   * 获取随机失败事件
   */
  getRandomFailEvent(): string {
    const events = config.descriptions.failEvents
    return events[Math.floor(Math.random() * events.length)]
  }

  /**
   * 获取命令帮助信息
   */
  getCommandHelp(command: string): string {
    return config.descriptions.commandHelp[command] || '暂无帮助信息'
  }
}

/**
 * 创建描述管理器实例
 */
export function createDescriptionManager(ctx: Context): DescriptionManager {
  return new DescriptionManager(ctx)
} 