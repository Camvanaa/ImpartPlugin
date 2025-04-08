import { Context } from 'koishi'
import { Database } from '../database'
import { ItemType, Rarity, Item, ItemAttributes, ItemSkill } from '../types'
import { randomUUID } from 'crypto'

// 抽卡池类型
enum DrawPoolType {
  NORMAL = 'normal',    // 普通池
  LIMITED = 'limited',  // 限定池
  EVENT = 'event'      // 活动池
}

// 抽卡概率配置
const DRAW_RATES = {
  [DrawPoolType.NORMAL]: {
    [Rarity.NORMAL]: 0.7,
    [Rarity.RARE]: 0.2,
    [Rarity.EPIC]: 0.07,
    [Rarity.LEGENDARY]: 0.025,
    [Rarity.MYTHIC]: 0.005
  },
  [DrawPoolType.LIMITED]: {
    [Rarity.NORMAL]: 0.5,
    [Rarity.RARE]: 0.3,
    [Rarity.EPIC]: 0.15,
    [Rarity.LEGENDARY]: 0.04,
    [Rarity.MYTHIC]: 0.01
  },
  [DrawPoolType.EVENT]: {
    [Rarity.NORMAL]: 0.4,
    [Rarity.RARE]: 0.35,
    [Rarity.EPIC]: 0.2,
    [Rarity.LEGENDARY]: 0.04,
    [Rarity.MYTHIC]: 0.01
  }
}

// 单抽所需票数
const SINGLE_DRAW_TICKETS = 1
// 十连抽所需票数
const TEN_DRAW_TICKETS = 10

export function apply(ctx: Context) {
  // 抽卡命令
  ctx.command('dick.draw [count:number] [pool:string]')
    .action(async ({ session }, count = 1, pool = DrawPoolType.NORMAL) => {
      if (!session?.userId) return '请在群聊中使用此命令'
      
      const db = ctx.root.impart as Database
      const userId = session.userId
      const guildId = session.guildId

      // 检查票数是否足够
      const requiredTickets = count === 10 ? TEN_DRAW_TICKETS : SINGLE_DRAW_TICKETS * count
      const userTickets = await db.getUserTickets(userId, guildId)
      if (userTickets < requiredTickets) {
        return `票数不足！需要 ${requiredTickets} 张票，当前拥有 ${userTickets} 张票`
      }

      // 扣除票数
      await db.updateUserTickets(userId, guildId, -requiredTickets)

      // 执行抽卡
      const results = await drawItems(count, pool as DrawPoolType)
      
      // 保存抽到的物品
      for (const item of results) {
        await db.addItemToUser(userId, guildId, item)
      }

      // 生成结果消息
      let message = `抽卡结果：\n`
      for (const item of results) {
        message += `${getItemName(item.type)} (${getRarityName(item.rarity)})\n`
        message += `属性：力量 ${item.attributes.strength} 敏捷 ${item.attributes.agility} 智力 ${item.attributes.intelligence} 幸运 ${item.attributes.luck}\n`
        if (item.skills.length > 0) {
          message += `技能：\n`
          for (const skill of item.skills) {
            message += `${skill.name}: ${skill.description}\n`
          }
        }
        message += `\n`
      }

      return message
    })

  // 查看抽卡概率命令
  ctx.command('dick.drawrate [pool:string]')
    .action(({ session }, pool = DrawPoolType.NORMAL) => {
      const rates = DRAW_RATES[pool as DrawPoolType]
      let message = `${getPoolName(pool as DrawPoolType)}概率：\n`
      for (const [rarity, rate] of Object.entries(rates)) {
        message += `${getRarityName(Number(rarity) as Rarity)}: ${(rate * 100).toFixed(2)}%\n`
      }
      return message
    })
}

// 获取抽卡池名称
function getPoolName(pool: DrawPoolType): string {
  switch (pool) {
    case DrawPoolType.NORMAL:
      return '普通池'
    case DrawPoolType.LIMITED:
      return '限定池'
    case DrawPoolType.EVENT:
      return '活动池'
    default:
      return '未知池'
  }
}

// 获取稀有度名称
function getRarityName(rarity: Rarity): string {
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

// 获取物品名称
function getItemName(type: ItemType): string {
  switch (type) {
    case ItemType.DICK_NORMAL:
      return '普通牛子'
    case ItemType.DICK_RARE:
      return '稀有牛子'
    case ItemType.DICK_EPIC:
      return '史诗牛子'
    case ItemType.DICK_LEGENDARY:
      return '传说牛子'
    case ItemType.DICK_MYTHIC:
      return '神话牛子'
    case ItemType.TRUTH_DICK:
      return '真理牛子'
    case ItemType.BALL_NORMAL:
      return '普通蛋蛋'
    case ItemType.BALL_RARE:
      return '稀有蛋蛋'
    case ItemType.BALL_EPIC:
      return '史诗蛋蛋'
    case ItemType.BALL_LEGENDARY:
      return '传说蛋蛋'
    case ItemType.BALL_MYTHIC:
      return '神话蛋蛋'
    default:
      return '未知物品'
  }
}

// 抽卡主函数
async function drawItems(count: number, pool: DrawPoolType): Promise<Item[]> {
  const results: Item[] = []
  for (let i = 0; i < count; i++) {
    const rarity = selectRarity(pool)
    const type = selectItemType(rarity)
    const attributes = generateAttributes(rarity)
    const skills = generateSkills(rarity)
    const description = generateDescription(type, rarity, attributes, skills)
    
    results.push({
      id: randomUUID(),
      type,
      rarity,
      attributes,
      skills,
      description
    })
  }
  return results
}

// 根据概率选择稀有度
function selectRarity(pool: DrawPoolType): Rarity {
  const rates = DRAW_RATES[pool]
  const rand = Math.random()
  let sum = 0
  
  for (const [rarity, rate] of Object.entries(rates)) {
    sum += rate
    if (rand <= sum) {
      return Number(rarity) as Rarity
    }
  }
  
  return Rarity.NORMAL
}

// 根据稀有度选择物品类型
function selectItemType(rarity: Rarity): ItemType {
  const isDick = Math.random() < 0.5
  switch (rarity) {
    case Rarity.NORMAL:
      return isDick ? ItemType.DICK_NORMAL : ItemType.BALL_NORMAL
    case Rarity.RARE:
      return isDick ? ItemType.DICK_RARE : ItemType.BALL_RARE
    case Rarity.EPIC:
      return isDick ? ItemType.DICK_EPIC : ItemType.BALL_EPIC
    case Rarity.LEGENDARY:
      return isDick ? ItemType.DICK_LEGENDARY : ItemType.BALL_LEGENDARY
    case Rarity.MYTHIC:
      return isDick ? ItemType.DICK_MYTHIC : ItemType.BALL_MYTHIC
    default:
      return ItemType.DICK_NORMAL
  }
}

// 生成属性值
function generateAttributes(rarity: Rarity): ItemAttributes {
  const baseValue = rarity * 10
  const variance = 5
  
  return {
    strength: baseValue + Math.floor(Math.random() * variance * 2) - variance,
    agility: baseValue + Math.floor(Math.random() * variance * 2) - variance,
    intelligence: baseValue + Math.floor(Math.random() * variance * 2) - variance,
    luck: baseValue + Math.floor(Math.random() * variance * 2) - variance
  }
}

// 生成技能
function generateSkills(rarity: Rarity): ItemSkill[] {
  const skills: ItemSkill[] = []
  const skillCount = Math.min(rarity, 3)
  
  for (let i = 0; i < skillCount; i++) {
    skills.push({
      name: `技能${i + 1}`,
      description: `这是一个${getRarityName(rarity)}技能`,
      power: rarity * 20,
      cooldown: 5 - i
    })
  }
  
  return skills
}

// 生成描述
function generateDescription(type: ItemType, rarity: Rarity, attributes: ItemAttributes, skills: ItemSkill[]): string {
  const itemName = getItemName(type)
  const rarityName = getRarityName(rarity)
  
  let desc = `这是一件${rarityName}品质的${itemName}。\n`
  desc += `属性：力量 ${attributes.strength} 敏捷 ${attributes.agility} 智力 ${attributes.intelligence} 幸运 ${attributes.luck}\n`
  
  if (skills.length > 0) {
    desc += `技能：\n`
    for (const skill of skills) {
      desc += `${skill.name}: ${skill.description}\n`
    }
  }
  
  return desc
} 