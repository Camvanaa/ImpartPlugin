import { Context } from 'koishi'
import { ItemType } from '../database/index'
import { Config } from '../config'

export class DescriptionManager {
  private ctx: Context
  private config: Config
  
  constructor(ctx: Context) {
    this.ctx = ctx
    this.config = ctx.config
  }
  
  /**
   * 获取物品介绍
   * @param itemType 物品类型
   * @returns 物品介绍文本
   */
  getItemDescription(itemType: string): string {
    // 处理特殊物品类型
    if (itemType === ItemType.TRUTH_DICK) {
      return this.config.itemDescriptions.truthDick
    }
    
    // 处理普通物品类型
    if (itemType.startsWith('dick_')) {
      const rarity = itemType.split('_')[1]
      switch (rarity) {
        case 'normal': return this.config.itemDescriptions.dickNormal
        case 'rare': return this.config.itemDescriptions.dickRare
        case 'epic': return this.config.itemDescriptions.dickEpic
        case 'legendary': return this.config.itemDescriptions.dickLegendary
        case 'mythic': return this.config.itemDescriptions.dickMythic
        default: return '未知物品'
      }
    }
    
    if (itemType.startsWith('ball_')) {
      const rarity = itemType.split('_')[1]
      switch (rarity) {
        case 'normal': return this.config.itemDescriptions.ballNormal
        case 'rare': return this.config.itemDescriptions.ballRare
        case 'epic': return this.config.itemDescriptions.ballEpic
        case 'legendary': return this.config.itemDescriptions.ballLegendary
        case 'mythic': return this.config.itemDescriptions.ballMythic
        default: return '未知物品'
      }
    }
    
    return '未知物品'
  }
  
  /**
   * 获取稀有度名称
   * @param rarity 稀有度值或名称
   * @returns 稀有度显示名称
   */
  getRarityName(rarity: number | string): string {
    if (typeof rarity === 'number') {
      switch (rarity) {
        case 1: return this.config.rarityNames.normal
        case 2: return this.config.rarityNames.rare
        case 3: return this.config.rarityNames.epic
        case 4: return this.config.rarityNames.legendary
        case 5: return this.config.rarityNames.mythic
        default: return '未知'
      }
    } else {
      switch (rarity) {
        case 'normal': return this.config.rarityNames.normal
        case 'rare': return this.config.rarityNames.rare
        case 'epic': return this.config.rarityNames.epic
        case 'legendary': return this.config.rarityNames.legendary
        case 'mythic': return this.config.rarityNames.mythic
        default: return '未知'
      }
    }
  }
  
  /**
   * 获取物品名称
   * @param itemType 物品类型
   * @returns 物品显示名称
   */
  getItemName(itemType: string): string {
    // 特殊物品
    if (itemType === ItemType.TRUTH_DICK) {
      return '真理牛子'
    }
    
    // 普通物品
    if (itemType.startsWith('dick_')) {
      const rarity = itemType.split('_')[1]
      return `${this.getRarityName(rarity)}牛子`
    }
    
    if (itemType.startsWith('ball_')) {
      const rarity = itemType.split('_')[1]
      return `${this.getRarityName(rarity)}蛋蛋`
    }
    
    return '未知物品'
  }
  
  /**
   * 获取随机锻炼成功事件描述
   * @returns 随机锻炼成功事件描述
   */
  getRandomSuccessEvent(): string {
    const events = this.config.exerciseEvents.successEvents
    return events[Math.floor(Math.random() * events.length)]
  }
  
  /**
   * 获取随机锻炼失败事件描述
   * @returns 随机锻炼失败事件描述
   */
  getRandomFailEvent(): string {
    const events = this.config.exerciseEvents.failEvents
    return events[Math.floor(Math.random() * events.length)]
  }
  
  /**
   * 获取命令帮助信息
   * @param command 命令名称
   * @returns 命令帮助信息
   */
  getCommandHelp(command: string): string {
    switch (command) {
      case 'generate': return this.config.commandHelp.generate
      case 'info': return this.config.commandHelp.info
      case 'rename': return this.config.commandHelp.rename
      case 'exercise': return this.config.commandHelp.exercise
      case 'fight': return this.config.commandHelp.fight
      case 'rank': return this.config.commandHelp.rank
      case 'collection': return this.config.commandHelp.collection
      case 'inventory': return this.config.commandHelp.inventory
      case 'use': return this.config.commandHelp.use
      case 'obtainTruth': return this.config.commandHelp.obtainTruth
      case 'drawrate': return this.config.commandHelp.drawrate
      default: return '没有该命令的帮助信息'
    }
  }
}

// 创建工厂函数，方便使用
export function createDescriptionManager(ctx: Context): DescriptionManager {
  return new DescriptionManager(ctx)
} 