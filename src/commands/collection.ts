import { Context } from 'koishi'
import { ItemType, Rarity } from '../types'
import { config } from '../config'
import { createDescriptionManager } from '../description'

// 自动生成物品图鉴信息
const ITEM_COLLECTION = Object.values(ItemType).reduce((acc, type) => {
  // 将枚举值转换为配置键名和显示名称
  const getItemInfo = (type: string) => {
    // 特殊牛子的处理
    if (type === 'TRUTH_DICK') {
      return {
        configKey: 'truthDick',
        displayName: '真理牛子'
      }
    }
    if (type === 'YOMI_DICK') {
      return {
        configKey: 'yomiDick',
        displayName: '黄泉牛子'
      }
    }
    
    // 普通物品的处理
    const [category, rarity] = type.toLowerCase().split('_')
    if (!rarity) return null // 防止无效的类型

    return {
      configKey: `${category}${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
      displayName: `${rarity}${category === 'dick' ? '牛子' : '蛋蛋'}`
    }
  }

  const itemInfo = getItemInfo(type)
  if (!itemInfo) return acc // 跳过无效的类型
  
  acc[type] = {
    name: itemInfo.displayName,
    description: config.itemDescriptions[itemInfo.configKey]
  }
  return acc
}, {} as Record<ItemType, { name: string, description: string }>)

export function apply(ctx: Context) {
  const descManager = createDescriptionManager(ctx)

  ctx.command('dick.collection [type:string]')
    .action(async ({ session }, type) => {
      if (!session?.guildId || !session?.userId) {
        return '请在群聊中使用此命令'
      }

      let message = '游戏物品图鉴：\n'

      // 所有可能的稀有度
      const rarities = [
        Rarity.NORMAL,
        Rarity.RARE,
        Rarity.EPIC,
        Rarity.LEGENDARY,
        Rarity.MYTHIC
      ]

      if (type) {
        // 按类型筛选
        if (type === 'dick') {
          message = '牛子类物品图鉴：\n'
          // 获取所有牛子类型的物品
          const dickItems = Object.entries(ITEM_COLLECTION)
            .filter(([key]) => key.toLowerCase().includes('dick'))
          
          for (const [itemType, info] of dickItems) {
            message += `\n${info.name}：${info.description}\n`
          }
        } else if (type === 'ball') {
          message = '蛋蛋类物品图鉴：\n'
          // 获取所有蛋蛋类型的物品
          const ballItems = Object.entries(ITEM_COLLECTION)
            .filter(([key]) => key.toLowerCase().includes('ball'))
          
          for (const [itemType, info] of ballItems) {
            message += `\n${info.name}：${info.description}\n`
          }
        } else {
          return '未知的物品类型。可用类型：dick（牛子）, ball（蛋蛋）'
        }
      } else {
        // 显示所有物品
        message += '\n【牛子系列】\n'
        const dickItems = Object.entries(ITEM_COLLECTION)
          .filter(([key]) => key.toLowerCase().includes('dick'))
        
        for (const [itemType, info] of dickItems) {
          message += `\n${info.name}：${info.description}\n`
        }

        message += '\n【蛋蛋系列】\n'
        const ballItems = Object.entries(ITEM_COLLECTION)
          .filter(([key]) => key.toLowerCase().includes('ball'))
        
        for (const [itemType, info] of ballItems) {
          message += `\n${info.name}：${info.description}\n`
        }
      }

      message += '\n使用 dick.collection <类型> 可以查看特定类型的物品。'
      return message
    })

  ctx.command('dick.collection.stats')
    .action(async ({ session }) => {
      if (!session?.guildId || !session?.userId) {
        return '请在群聊中使用此命令'
      }

      if (!ctx.impart) {
        return 'impart插件未加载，请联系管理员'
      }

      const inventory = await ctx.impart.getInventory(session.userId, session.guildId)

      if (!inventory || inventory.length === 0) {
        return '你还没有收集到任何物品'
      }

      // 统计收集进度
      const collectedItems = new Set(inventory.map(item => item.itemType))
      const totalItems = Object.keys(ITEM_COLLECTION).length
      const collectedCount = collectedItems.size

      let message = '收集统计：\n'
      message += `\n总进度：${collectedCount}/${totalItems} (${Math.round(collectedCount/totalItems*100)}%)\n`
      message += '\n已收集的物品：\n'

      for (const itemType of collectedItems) {
        const itemInfo = ITEM_COLLECTION[itemType as ItemType]
        message += `- ${itemInfo.name}\n`
      }

      return message
    })
}
