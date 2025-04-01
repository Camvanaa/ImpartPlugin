import { Context, Schema } from 'koishi'
import { Database } from './database'
import { Dick } from './models/dick'
import { FightCalculator } from './models/fightCalculator'
import { randomUUID } from 'crypto'
import { TruthDick } from './models/special-dicks/truth-dick'

// 插件导出定义
export const name = 'impart'
export const usage = '牛子插件'

// 声明为服务
declare module 'koishi' {
  interface Context {
    impart: Database
  }
}

// 配置接口
export interface Config {
  mainSettings: {
    interval: number
  }
  dickData: {
    fightEnergyCost: number
    exerciseEnergyCost: number
  }
  rank: {
    groupRankTopCount: number
    globalRankTopCount: number
  }
  management: {
    administrator: number
  }
}

// 默认配置
export const Config: Schema<Config> = Schema.object({
  mainSettings: Schema.object({
    interval: Schema.number().default(5000).description('操作间隔时间(毫秒)'),
  }),
  dickData: Schema.object({
    fightEnergyCost: Schema.number().default(40).description('斗牛消耗体力'),
    exerciseEnergyCost: Schema.number().default(10).description('锻炼消耗体力'),
  }),
  rank: Schema.object({
    groupRankTopCount: Schema.number().default(3).description('群排行显示数量'),
    globalRankTopCount: Schema.number().default(3).description('全服排行显示数量'),
  }),
  management: Schema.object({
    administrator: Schema.number().default(393098870).description('管理员QQ'),
  }),
})

// 工具函数
function getRandomDouble(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min
}

// 插件主体
export function apply(ctx: Context, config: Config) {
  // 创建数据库实例
  const db = new Database(ctx)
  ctx.impart = db
  
  // 设置体力恢复定时任务 (6分钟恢复1点)
  const energyRecoveryInterval = 6 * 60 * 1000 // 6分钟，单位毫秒
  setInterval(async () => {
    try {
      // 恢复所有牛子的体力
      const dicks = await db.getAllDicks()
      for (const dick of dicks) {
        // 如果体力未满，恢复1点
        if (dick.energy < 240) {
          dick.energy = Math.min(240, dick.energy + 1)
          await db.updateDickEnergy(dick.energy, dick.guid)
        }
      }
      ctx.logger.info('所有牛子体力恢复1点')
    } catch (e) {
      ctx.logger.error('体力恢复过程中发生错误:', e)
    }
  }, energyRecoveryInterval)
  
  // 直接注册命令，不使用依赖注入
  ctx.command('dick.help', '牛子系统')
    .action(async ({ session }) => {
      const helpMessage = `牛子系统指令列表：
1. dick.help：展示帮助菜单
2. dick.exercise <次数>：消耗体力锻炼牛子，可能增加或者减少长度
3. dick.fight：消耗体力进行跨服牛子PK，可能增加或者减少长度
4. dick.groupfight：消耗更多体力进行群内斗牛
5. dick.rename <新名字>：修改牛子的名字
6. dick.info：查询自己的牛子信息
7. dick.rank [group|global]：查看群内/全服牛子榜单
8. dick.coffee：饮用咖啡回复体力，每20小时可以饮用一次
9. dick.truth：使用真理牛子进行追加攻击，花费大量体力对随机牛子发动追加攻击，一旦成功，对方牛子将会被取对数，自己也会获得一部分收益
10. dick.generate：生成一个牛子
11. dick.status：查看系统状态

牛子系统正在升级，敬请期待！`
      
      await session.send(helpMessage)
    })
  
  ctx.command('dick.info', '查看牛子信息')
  .action(async ({ session }) => {
        if (!session.guildId || !session.userId) return
        const dick = await db.getDickWithIds(session.userId, session.guildId)
        if (!dick) {
          await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
          return
        }
        
        const ranks = await db.getLengthRanks(dick.guid, session.guildId)
        const message = `基本信息：
<at id="${session.userId}"/>，你的牛子"${dick.nickName}"，目前长度为${dick.length.toFixed(1)}cm，当前体力状况：[${dick.energy}/240]
排名信息：
牛子群内排名：[${ranks.groupRank}/${ranks.groupTotal}]名；牛子全服排名：[${ranks.globalRank}/${ranks.globalTotal}]名`
        
        await session.send(message)
      })
    
    ctx.command('dick.generate', '生成一个牛子')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      try {
        // 检查是否已有牛子
        const existingDick = await db.getDickWithIds(session.userId, session.guildId)
        if (existingDick) {
          await session.send(`<at id="${session.userId}"/>，你已经有了一只牛子，请不要贪心！`)
          return
        }
        
        // 生成新牛子
        const newGuid = randomUUID()
        const newDick = new Dick()
        newDick.belongings = session.userId
        newDick.nickName = "软弱牛子"
        newDick.length = getRandomDouble(5, 15)
        newDick.guid = newGuid
        newDick.groupNumber = session.guildId
        
        const success = await db.generateNewDick(session.userId, session.guildId, newDick)
        
        if (!success) {
          throw new Error('生成牛子失败')
        }
        
        await session.send(`<at id="${session.userId}"/>，你的牛子[${newDick.guid}]已经成功生成，初始长度为${newDick.length.toFixed(3)}cm。\n初始生成的牛子默认拥有240点体力，请及时使用，防止体力溢出！你可以使用"dick.rename <新名字>"指令来更改牛子的姓名。`)
      } catch (e) {
        ctx.logger.error('生成牛子时发生错误:', e)
        await session.send(`<at id="${session.userId}"/>，生成牛子时发生错误，请稍后再试！`)
      }
    })
    
    ctx.command('dick.fight', '进行跨服斗牛')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      const result = await dick.fight(db)
      await session.send(result)
    })
    
    ctx.command('dick.exercise [times:number]', '锻炼牛子')
    .action(async ({ session }, times = 1) => {
      if (!session.guildId || !session.userId) return
      
      const exerciseTimes = Math.min(Math.max(1, times), 10) // 限制在1-10次之间
      const energyCost = ctx.config.dickData.exerciseEnergyCost * exerciseTimes
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      if (dick.energy < energyCost) {
        await session.send(`<at id="${session.userId}"/>，你的牛子"${dick.nickName}"，体力值不足，无法锻炼！当前体力值为${dick.energy}/240`)
        return
      }
      
      // 扣除体力
      dick.energy -= energyCost
      await db.updateDickEnergy(dick.energy, dick.guid)
      
      // 锻炼效果
      const startLength = dick.length
      let totalLengthDifference = 0
      
      for (let i = 0; i < exerciseTimes; i++) {
        // 每次锻炼的效果
        const isPositive = Math.random() > 0.5
        const perDifference = isPositive
          ? getRandomDouble(10, 20)
          : -getRandomDouble(5, 15)
        
        dick.length += perDifference
        totalLengthDifference += perDifference
      }
      
      await db.updateDickLength(dick.length, dick.guid)
      
      // 锻炼结果消息
      const winString = [
        "你的锻炼卓有成效，可惜并没有什么奇妙的事件发生，锻炼使你的牛子",
        
        "在锻炼过程中，姬子偶然经过，她用星核能量为你的牛子注入了一丝活力，使得你的牛子",
        "刚锻炼完，三月七突然现身，她用冰系能力为你的牛子做了急速降温处理，这让你的牛子",
        "锻炼后，丹恒用她的占星术为你的牛子解读了命运线，这让你的牛子似乎对未来有了感应，",
        "在锻炼的过程当中，银狼发现了你的牛子，她使用黑客技术为你的牛子进行了以太编码，这使得你的牛子",

        "锻炼时，钟离恰好路过，他用岩元素为你的牛子提供了一层保护，这让你的牛子",
        "锻炼完毕后，胡桃对你的牛子做了一番生死之间的体验，这让你的牛子在生死边缘获得了升华，",
        "锻炼时，雷电将军以雷霆之力点化了你的牛子，电流的刺激让你的牛子",
        "在锻炼完毕以后，你遇到了琴。她为你的牛子演奏了一首美妙的曲子，曲音如泉水般流淌，你的牛子在音乐的震动中有所感悟，",
        "在锻炼完毕以后，诺艾尔出现在你面前。她拿出她的石锤，为你的牛子进行了一次特制的石锤按摩，你的牛子在按摩过程中",
        "在锻炼之前，莫娜发现了你的牛子，她运用占星术为你的牛子祈祷，这使得你的牛子",

        "锻炼过程中，月城柳用她的扫描能力分析了你的牛子构造，并给出了优化建议，这让你的牛子",
        "锻炼后，耀佳音用她的歌声对你的牛子进行了调理，清凉的能量让你的牛子",

        "锻炼之际，符华路过，她用太虚剑气为你的牛子做了经络疏通，这让你的牛子",
        "锻炼期间，幽兰黛尔用她的量子能力为你的牛子创造了一个特殊空间，这让你的牛子"
      ]
      
      const loseString = [
        "过度锻炼使你的牛子受到损伤",
        "在锻炼过程当中，你的牛子被一只蚊子叮了一口，这使得你的牛子",

        "锻炼时，景元路过，他的神君利刃不小心划过你的牛子，这让你的牛子",
        "在锻炼过程中，阮梅好奇地对你的牛子做了一些科学实验，但实验失败让你的牛子",
        "锻炼时，刃误以为你的牛子是敌人的武器，一剑下去使你的牛子",
        "在锻炼过程当中，带着镰刀路过的希儿不小心损伤了你的牛子。疼痛使你的牛子瞬间",
        
        "锻炼中，荒泷一斗把你的牛子当作了训练用具，用力过猛导致你的牛子",
        "锻炼时，优菈的千年寒冰剑不小心擦过你的牛子，这使你的牛子瞬间",
        "锻炼期间，八重神子用她的狐狸电流戏弄了你的牛子，过量的电流使你的牛子",
        "在锻炼当中，你遇到了莫娜。她误以为你的牛子是一种妖怪，用魔法攻击了它，这使得你的牛子",
        "在石锤按摩的过程中，诺艾尔不小心用石锤换成了铁锤。这使得你的牛子",

        "锻炼时，11号认为你的牛子是某种敌对目标，她的强力攻击让你的牛子",

        "锻炼时，布洛妮娅的机甲意外触碰到你的牛子，强大的压力使你的牛子",
        "在锻炼中，丽塔的鞭子不小心甩到了你的牛子，这使你的牛子瞬间"
      ]
      
      let outputMessage
      if (totalLengthDifference > 0) {
        const winMessagePart1 = winString[Math.floor(Math.random() * winString.length)]
        outputMessage = `<at id="${session.userId}"/>，你的牛子"${dick.nickName}"消耗${energyCost}体力值完成了${exerciseTimes}次锻炼！${winMessagePart1}增长了${Math.abs(totalLengthDifference).toFixed(3)}cm，你的牛子目前长度为${dick.length.toFixed(2)}cm，体力值为${dick.energy}/240。`
      } else {
        const loseMessagePart1 = loseString[Math.floor(Math.random() * loseString.length)]
        outputMessage = `<at id="${session.userId}"/>，你的牛子"${dick.nickName}"消耗${energyCost}体力值完成了${exerciseTimes}次锻炼！${loseMessagePart1}缩短了${Math.abs(totalLengthDifference).toFixed(3)}cm，你的牛子目前长度为${dick.length.toFixed(2)}cm，体力值为${dick.energy}/240。`
      }
      
      await session.send(outputMessage)
    })
    
    ctx.command('dick.rename <name:string>', '修改牛子名称')
    .action(async ({ session }, name) => {
      if (!session.guildId || !session.userId) return
      
      if (!name) {
        await session.send('请提供新的牛子名称')
        return
      }
      
      if (name.length > 10) {
        await session.send('牛子名称太长了，请控制在10个字符以内')
        return
      }
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      const oldName = dick.nickName
      dick.nickName = name
      const success = await db.updateDickNickName(session.userId, session.guildId, name)
      
      if (success) {
        await session.send(`<at id="${session.userId}"/>，你的牛子名字已经从"${oldName}"修改为"${name}"！`)
      } else {
        await session.send(`<at id="${session.userId}"/>，你的牛子名字修改失败！请稍后再试！`)
      }
    })
    
    ctx.command('dick.rank [type:string]', '查看牛子排行榜')
    .action(async ({ session, options }, type = 'group') => {
      if (!session.guildId) return
      
      const isGlobal = type.toLowerCase() === 'global'
      const n = isGlobal ? ctx.config.rank.globalRankTopCount : ctx.config.rank.groupRankTopCount
      
      // 获取牛子总数
      const count = await db.getCountOfTotalDicks(isGlobal ? undefined : session.guildId)
      
      if (count <= 0) {
        await session.send(isGlobal ? "数据库中没有足够的牛子，无法生成排名！" : "当前群内没有足够的牛子，无法生成排名！")
        return
      }
      
      const dickCount = Math.min(count, n)
      
      // 获取最长牛子排名
      const topDicks = await db.getFirstNDicksByOrder(dickCount, 0, isGlobal ? undefined : session.guildId)
      let outputMessage = `当前排名如下：\n${isGlobal ? '全服' : '群'}最长牛子榜\n排名|昵称|长度\n`
      
      for (let i = 0; i < topDicks.length; i++) {
        const dick = topDicks[i]
        outputMessage += `${i + 1}. 牛子昵称：${dick.nickName}，长度：${dick.length.toFixed(1)}cm，主人QQ:${dick.belongings}\n`
      }
      
      // 获取最短牛子排名
      const bottomDicks = await db.getFirstNDicksByOrder(dickCount, 1, isGlobal ? undefined : session.guildId)
      outputMessage += `\n${isGlobal ? '全服' : '群'}最短牛子榜\n排名|昵称|长度\n`
      
      for (let i = 0; i < bottomDicks.length; i++) {
        const dick = bottomDicks[i]
        outputMessage += `${i + 1}. 牛子昵称：${dick.nickName}，长度：${dick.length.toFixed(1)}cm，主人QQ:${dick.belongings}\n`
      }
      
      await session.send(outputMessage)
    })
    
    ctx.command('dick.coffee', '饮用牛子咖啡')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const energyAdd = 60
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      
      if (!dick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      const [recordExisted, lastDrinkTimeFromDataBase] = await db.checkCoffeeInformation(dick.guid)
      
      if (!recordExisted) {
        // 数据库中没有对应记录，创建初始记录
        await db.createNewCoffeeLine(dick.guid)
        dick.energy += energyAdd
        await db.updateDickEnergy(dick.energy, dick.guid)
        
        await session.send(`<at id="${session.userId}"/>，你的牛子[${dick.nickName}]饮用了一杯牛子咖啡，现在精神饱满，体力回复了${energyAdd}点。当前体力为${dick.energy}/240。`)
        return
      }
      
      // 检查是否可以再次饮用咖啡
      const currentTime = Math.floor(Date.now() / 1000)
      const lastDrinkTime = lastDrinkTimeFromDataBase
      const cooldownTime = 20 * 60 * 60 // 20小时冷却
      const nextAvailableTime = lastDrinkTime + cooldownTime
      
      if (currentTime >= nextAvailableTime) {
        // 可以喝咖啡
        await db.drinkCoffee(dick.guid)
        dick.energy += energyAdd
        await db.updateDickEnergy(dick.energy, dick.guid)
        
        await session.send(`<at id="${session.userId}"/>，你的牛子[${dick.nickName}]饮用了一杯牛子咖啡，现在精神饱满，体力回复了${energyAdd}点。当前体力为${dick.energy}/240。`)
      } else {
        // 冷却中
        const restOfTime = new Date((nextAvailableTime - currentTime) * 1000)
        const hours = restOfTime.getUTCHours()
        const minutes = restOfTime.getUTCMinutes()
        
        await session.send(`<at id="${session.userId}"/>，你的牛子[${dick.nickName}]今天已经饮用过一杯咖啡了，请${hours}小时${minutes}分钟后再来！`)
      }
    })
    
    ctx.command('dick.truth', '使用真理牛子')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const dick = await db.getDickWithIds(session.userId, session.guildId)
      if (!dick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      const truthDick = new TruthDick(dick)
      const result = await truthDick.execute(db)
      await session.send(result)
    })
    
    ctx.command('dick.status', '查看系统状态')
    .action(async ({ session }) => {
      if (!session.guildId) return
      
      const startTime = new Date().getTime() - process.uptime() * 1000
      const uptime = new Date().getTime() - startTime
      
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
      const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((uptime % (1000 * 60)) / 1000)
      
      const outputMessage = `牛子系统正在运行！\n已运行时间：${days}天${hours}小时${minutes}分钟${seconds}秒`
      await session.send(outputMessage)
    })
    
    // 管理员命令，使用Koishi的权限系统
    ctx.command('dick.admin.compensate', '维护补偿', { authority: 4 })
      .option('all', '-a 是否全服补偿')
      .usage('需要4级权限才能执行')
      .action(async ({ session, options }) => {
        if (!session.guildId || !session.userId) return
        
        const energyCompensate = 240
        let success = false
        
        if (options.all) {
          // 全服补偿，可以增加针对所有群的补偿逻辑
          await session.send('全服补偿功能即将开发，敬请期待！')
          return
        } else {
          // 当前群补偿
          success = await db.compensation(session.guildId, energyCompensate)
        }
        
        if (success) {
          await session.send(`管理员已经为当前群玩家补偿${energyCompensate}点体力！`)
        } else {
          await session.send('补偿失败，请稍后再试！')
        }
      })

    // 添加更多管理命令，例如：
    ctx.command('dick.admin.reset <userId:string>', '重置指定用户的牛子', { authority: 4 })
      .usage('需要4级权限才能执行')
      .action(async ({ session }, userId) => {
        if (!session.guildId || !session.userId) return
        
        if (!userId) {
          await session.send('请指定需要重置的用户ID')
          return
        }
        
        // 此处需要添加重置用户牛子的逻辑
        await session.send(`用户 ${userId} 的牛子重置功能即将开发，敬请期待！`)
      })

    ctx.command('dick.groupfight', '在群内进行斗牛')
    .action(async ({ session }) => {
      if (!session.guildId || !session.userId) return
      
      const energyCost = config.dickData.fightEnergyCost * 1.5 // 群内斗牛消耗更多体力
      
      // 获取用户的牛子
      const userDick = await db.getDickWithIds(session.userId, session.guildId)
      if (!userDick) {
        await session.send(`<at id="${session.userId}"/>，你还没有牛子，请先使用 dick.generate 生成一个！`)
        return
      }
      
      // 检查体力是否足够
      if (userDick.energy < energyCost) {
        await session.send(`<at id="${session.userId}"/>，你的牛子"${userDick.nickName}"体力不足，无法进行群内斗牛！当前体力：${userDick.energy}/240，需要体力：${energyCost}`)
        return
      }
      
      // 获取群内其他牛子
      const groupDicks = await db.getDicksInGroup(session.guildId)
      const opponentDicks = groupDicks.filter(d => d.belongings !== session.userId)
      
      if (opponentDicks.length === 0) {
        await session.send(`<at id="${session.userId}"/>，当前群内没有其他牛子，无法进行群内斗牛！`)
        return
      }
      
      // 随机选择一个对手
      const opponentDick = opponentDicks[Math.floor(Math.random() * opponentDicks.length)]
      
      // 计算战斗结果，沿用现有计算方法
      const differenceValue = userDick.length - opponentDick.length
      const result = FightCalculator.calculate(userDick.length, opponentDick.length, differenceValue)
      
      // 扣除体力
      userDick.energy -= energyCost
      await db.updateDickEnergy(userDick.energy, userDick.guid)
      
      // 更新双方牛子长度
      userDick.length += result.challengerChange
      opponentDick.length += result.defenderChange
      await db.updateDickLength(userDick.length, userDick.guid)
      await db.updateDickLength(opponentDick.length, opponentDick.guid)
      
      // 返回战斗结果
      const resultMessage = result.isWin
        ? `<at id="${session.userId}"/>，你的牛子"${userDick.nickName}"在群内斗牛中战胜了"${opponentDick.nickName}"！\n你的牛子增长了${result.challengerChange.toFixed(2)}cm，现在长度为${userDick.length.toFixed(2)}cm，体力值为${userDick.energy}/240。\n对方的牛子缩短了${Math.abs(result.defenderChange).toFixed(2)}cm，现在长度为${opponentDick.length.toFixed(2)}cm。`
        : `<at id="${session.userId}"/>，你的牛子"${userDick.nickName}"在群内斗牛中败给了"${opponentDick.nickName}"！\n你的牛子缩短了${Math.abs(result.challengerChange).toFixed(2)}cm，现在长度为${userDick.length.toFixed(2)}cm，体力值为${userDick.energy}/240。\n对方的牛子增长了${result.defenderChange.toFixed(2)}cm，现在长度为${opponentDick.length.toFixed(2)}cm。`
      
      await session.send(resultMessage)
    })
}
