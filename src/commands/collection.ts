import { Context } from 'koishi'
import { Database, ItemType } from '../database'
import { ItemRarity } from '../config'

// 收藏物品接口
interface CollectionItem {
  type: ItemType
  rarity: ItemRarity
  attributes: {
    strength: number
    agility: number
    intelligence: number
    luck: number
  }
  skills: {
    name: string
    description: string
    effect: string
  }[]
}

export function apply(ctx: Context) {
  const db = ctx.root.impart as Database

  ctx.command('dick.collection [type:string]')
    .action(async ({ session }, type) => {
      if (!session?.guildId || !session?.userId) {
        return '请在群聊中使用此命令'
      }

      const inventory = await db.getInventory(session.userId, session.guildId)

      if (!inventory || inventory.length === 0) {
        return '你的收藏是空的'
      }

      // 按类型筛选
      let filteredInventory = inventory
      if (type) {
        if (type === 'dick') {
          filteredInventory = inventory.filter(item => item.itemType === ItemType.TRUTH_DICK)
        }
      }

      if (filteredInventory.length === 0) {
        return `你没有收集到${type || '任何'}类型的物品`
      }

      let message = '你的收藏：\n'
      for (const item of filteredInventory) {
        const name = getItemName(item.itemType)
        message += `\n${name} x${item.quantity}\n`
      }

      return message
    })

  ctx.command('dick.collection.stats')
    .action(async ({ session }) => {
      if (!session?.guildId || !session?.userId) {
        return '请在群聊中使用此命令'
      }

      const inventory = await db.getInventory(session.userId, session.guildId)

      if (!inventory || inventory.length === 0) {
        return '你的收藏是空的'
      }

      // 统计各类型的数量
      const stats = {
        dick: {
          total: 0
        }
      }

      for (const item of inventory) {
        if (item.itemType === ItemType.TRUTH_DICK) {
          stats.dick.total += item.quantity
        }
      }

      let message = '收藏统计：\n'
      message += `\n牛子：共${stats.dick.total}个`

      return message
    })
}

// 获取物品名称
function getItemName(itemType: ItemType): string {
  const itemNames = {
    [ItemType.TRUTH_DICK]: '真理牛子'
  }
  return itemNames[itemType] || '未知物品'
} 