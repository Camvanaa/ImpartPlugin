import { Context } from 'koishi'
import { ActiveDickType, Database } from '../database'
import { getDickName } from '../function'
import { TruthDick } from '../models/special-dicks/truth-dick'

export function apply(ctx: Context) {
  const db = ctx.impart as Database
  const config = ctx.config
  
  ctx.command('dick.fight', '进行跨服斗牛')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        return `<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`
      }
      
      // 获取用户当前使用的牛子类型
      const activeDickType = await db.getUserActiveDickType(session.userId, session.guildId)
      
      // 根据不同的牛子类型执行不同的战斗逻辑
      if (activeDickType === ActiveDickType.TRUTH) {
        // 使用真理牛子的特殊战斗效果
        const truthDick = new TruthDick(dick)
        return await truthDick.execute(db)
      } else {
        // 使用普通牛子的战斗逻辑
        const dickName = getDickName(dick.length)
        const result = await dick.fight(db, config.dickData.fightEnergyCost)
        return result
      }
    })
    
  ctx.command('dick.groupfight', '进行群内斗牛')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        return `<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`
      }
      
      // 获取用户当前使用的牛子类型
      const activeDickType = await db.getUserActiveDickType(session.userId, session.guildId)
      
      // 目前只有普通牛子支持群内战斗
      if (activeDickType !== ActiveDickType.NORMAL) {
        const dickName = getDickName(dick.length)
        return `<at id="${session.userId}"/>，特殊类型的${dickName}暂不支持群内战斗，请先切换回普通${dickName}！`
      }
      
      const result = await dick.groupFight(db, config.dickData.fightEnergyCost)
      return result
    })
} 