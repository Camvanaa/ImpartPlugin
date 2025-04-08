import { Context } from 'koishi'
import { Database } from '../database'
import { ItemType } from '../types'

export function apply(ctx: Context) {
  const db = ctx.impart as Database
  
  ctx.command('dick.inventory', '查看牛子物品仓库')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      // 获取用户仓库物品
      const inventoryItems = await db.getInventory(session.userId, session.guildId)
      
      if (inventoryItems.length === 0) {
        return `<at id="${session.userId}"/>，你的仓库目前空空如也，快去获取一些吧！`
      }
      
      // 构建物品列表展示
      let message = `<at id="${session.userId}"/>，你的仓库物品列表：\n`
      
      for (const item of inventoryItems) {
        if (item.quantity <= 0) continue
        
        let itemName = '未知物品'
        if (item.itemType === ItemType.TRUTH_DICK) {
          itemName = '真理牛子'
        }
        
        message += `- ${itemName} × ${item.quantity}\n`
      }
      
      message += '\n使用方法：dick.use <物品名称>'
      
      return message
    })
} 