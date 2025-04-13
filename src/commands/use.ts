import { Context } from 'koishi'
import { ActiveDickType, Database} from '../database'
import { ItemType } from '../types'
import { getDickName } from '../function'

export function apply(ctx: Context) {
  const db = ctx.impart as Database
  
  ctx.command('dick.use <itemName:string>', '使用物品')
    .action(async ({ session }, itemName) => {
      if (!session.guildId || !session.userId) return
      
      if (!itemName) {
        return `请输入要使用的物品名称`
      }
      
      // 检查用户是否有牛子
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        return `<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`
      }
      
      const dickName = getDickName(dick.length)
      
      // 根据物品名称处理不同的物品类型
      if (itemName === '真理牛子') {
        // 检查物品是否存在于用户仓库
        const hasItem = await db.hasItem(session.userId, session.guildId, ItemType.TRUTH_DICK)
        if (!hasItem) {
          return `<at id="${session.userId}"/>，你的仓库中没有${itemName}！`
        }
        
        // 设置当前使用的牛子类型
        await db.setUserActiveDickType(session.userId, session.guildId, ActiveDickType.TRUTH)
        
        return `<at id="${session.userId}"/>，你已经将当前使用的${dickName}类型切换为【${itemName}】！现在进行的对战将使用${itemName}的特殊效果。`
      } else if (itemName === '普通牛子' || itemName === '默认牛子') {
        // 设置为普通牛子类型
        await db.setUserActiveDickType(session.userId, session.guildId, ActiveDickType.NORMAL)
        
        return `<at id="${session.userId}"/>，你已经将当前使用的${dickName}类型恢复为【默认${dickName}】！`
      } else {
        return `<at id="${session.userId}"/>，未知的物品类型：${itemName}。请确认物品名称正确！`
      }
    })
} 