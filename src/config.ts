import { Context, Schema } from 'koishi'

// 抽卡池类型
export enum DrawPoolType {
  NORMAL = 'normal',    // 普通池
  LIMITED = 'limited',  // 限定池
  EVENT = 'event'      // 活动池
}

// 物品稀有度
export enum ItemRarity {
  COMMON = 'common',    // 普通
  RARE = 'rare',       // 稀有
  EPIC = 'epic',       // 史诗
  LEGENDARY = 'legendary' // 传说
}

export interface Config {
  descriptions: {
    truthDick: string
    dick: string
    ball: string
    successEvents: string[]
    failEvents: string[]
    commandHelp: Record<string, string>
  }
  itemDescriptions: {
    truthDick: string
    dickNormal: string
    dickRare: string
    dickEpic: string
    dickLegendary: string
    dickMythic: string
    ballNormal: string
    ballRare: string
    ballEpic: string
    ballLegendary: string
    ballMythic: string
  }
  rarityNames: {
    normal: string
    rare: string
    epic: string
    legendary: string
    mythic: string
  }
  exerciseEvents: {
    successEvents: string[]
    failEvents: string[]
  }
  commandHelp: {
    generate: string
    info: string
    rename: string
    exercise: string
    fight: string
    rank: string
    collection: string
    inventory: string
    use: string
    obtainTruth: string
    drawrate: string
  }
  energy: {
    cost: number
    recover: number
    interval: number
  }
  rank: {
    displayCount: number
  }
  // 抽卡池配置
  pools: {
    [key in DrawPoolType]: {
      ticketCost: number  // 抽卡消耗
      description: string // 池子描述
    }
  }
  
  // 稀有度概率配置
  rarityWeights: {
    [key in ItemRarity]: number
  }
  
  // 稀有度倍率配置
  rarityMultipliers: {
    [key in ItemRarity]: number
  }
  
  // 稀有度技能数量配置
  raritySkillCounts: {
    [key in ItemRarity]: number
  }
}

export const Config: Schema<Config> = Schema.object({
  descriptions: Schema.object({
    truthDick: Schema.string().default('真理牛子是一种特殊的牛子，拥有强大的力量。'),
    dick: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    ball: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。'),
    successEvents: Schema.array(Schema.string()).default([
      '锻炼成功，牛子变长了！',
      '经过不懈努力，牛子变得更大了！',
      '今天的锻炼效果不错，牛子有所增长。'
    ]),
    failEvents: Schema.array(Schema.string()).default([
      '锻炼失败，牛子没有变化。',
      '今天的锻炼没有效果，下次再试试吧。',
      '运气不好，牛子没有变长。'
    ]),
    commandHelp: Schema.object({
      'dick.info': Schema.string().default('查看你的牛子信息'),
      'dick.generate': Schema.string().default('生成一个新的牛子'),
      'dick.exercise': Schema.string().default('锻炼你的牛子'),
      'dick.rename': Schema.string().default('重命名你的牛子'),
      'dick.rank': Schema.string().default('查看牛子排行榜'),
      'dick.count': Schema.string().default('查看牛子数量统计'),
      'dick.reset': Schema.string().default('重置你的牛子'),
      'dick.draw': Schema.string().default('抽取物品'),
      'dick.drawrate': Schema.string().default('查看抽取概率'),
      'dick.inventory': Schema.string().default('查看物品栏'),
      'dick.use': Schema.string().default('使用物品')
    })
  }),
  itemDescriptions: Schema.object({
    truthDick: Schema.string().default('真理牛子是一种特殊的牛子，拥有强大的力量。'),
    dickNormal: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    dickRare: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    dickEpic: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    dickLegendary: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    dickMythic: Schema.string().default('普通的牛子，可以通过锻炼变强。'),
    ballNormal: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。'),
    ballRare: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。'),
    ballEpic: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。'),
    ballLegendary: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。'),
    ballMythic: Schema.string().default('普通的蛋蛋，可以通过锻炼变强。')
  }),
  rarityNames: Schema.object({
    normal: Schema.string().default('普通'),
    rare: Schema.string().default('稀有'),
    epic: Schema.string().default('史诗'),
    legendary: Schema.string().default('传说'),
    mythic: Schema.string().default('神话')
  }),
  exerciseEvents: Schema.object({
    successEvents: Schema.array(Schema.string()).default([
      '锻炼成功，牛子变长了！',
      '经过不懈努力，牛子变得更大了！',
      '今天的锻炼效果不错，牛子有所增长。'
    ]),
    failEvents: Schema.array(Schema.string()).default([
      '锻炼失败，牛子没有变化。',
      '今天的锻炼没有效果，下次再试试吧。',
      '运气不好，牛子没有变长。'
    ])
  }),
  commandHelp: Schema.object({
    generate: Schema.string().default('生成一个新的牛子'),
    info: Schema.string().default('查看你的牛子信息'),
    rename: Schema.string().default('重命名你的牛子'),
    exercise: Schema.string().default('锻炼你的牛子'),
    fight: Schema.string().default('战斗'),
    rank: Schema.string().default('查看牛子排行榜'),
    collection: Schema.string().default('查看牛子收藏'),
    inventory: Schema.string().default('查看物品栏'),
    use: Schema.string().default('使用物品'),
    obtainTruth: Schema.string().default('获取真理牛子'),
    drawrate: Schema.string().default('查看抽取概率')
  }),
  energy: Schema.object({
    cost: Schema.number().default(10).description('每次锻炼消耗的能量'),
    recover: Schema.number().default(1).description('每次恢复的能量'),
    interval: Schema.number().default(360).description('能量恢复间隔（秒）')
  }),
  rank: Schema.object({
    displayCount: Schema.number().default(10).description('排行榜显示数量')
  }),
  pools: Schema.object({
    [DrawPoolType.NORMAL]: Schema.object({
      ticketCost: Schema.number().default(100).description('普通池抽卡消耗'),
      description: Schema.string().default('普通的抽卡池').description('普通池描述')
    }),
    [DrawPoolType.LIMITED]: Schema.object({
      ticketCost: Schema.number().default(200).description('限定池抽卡消耗'),
      description: Schema.string().default('限定的抽卡池').description('限定池描述')
    }),
    [DrawPoolType.EVENT]: Schema.object({
      ticketCost: Schema.number().default(300).description('活动池抽卡消耗'),
      description: Schema.string().default('活动的抽卡池').description('活动池描述')
    })
  }).description('抽卡池配置'),
  
  rarityWeights: Schema.object({
    [ItemRarity.COMMON]: Schema.number().default(70).description('普通稀有度权重'),
    [ItemRarity.RARE]: Schema.number().default(20).description('稀有稀有度权重'),
    [ItemRarity.EPIC]: Schema.number().default(8).description('史诗稀有度权重'),
    [ItemRarity.LEGENDARY]: Schema.number().default(2).description('传说稀有度权重')
  }).description('稀有度概率配置'),
  
  rarityMultipliers: Schema.object({
    [ItemRarity.COMMON]: Schema.number().default(1).description('普通稀有度属性倍率'),
    [ItemRarity.RARE]: Schema.number().default(1.5).description('稀有稀有度属性倍率'),
    [ItemRarity.EPIC]: Schema.number().default(2).description('史诗稀有度属性倍率'),
    [ItemRarity.LEGENDARY]: Schema.number().default(3).description('传说稀有度属性倍率')
  }).description('稀有度属性倍率配置'),
  
  raritySkillCounts: Schema.object({
    [ItemRarity.COMMON]: Schema.number().default(0).description('普通稀有度技能数量'),
    [ItemRarity.RARE]: Schema.number().default(1).description('稀有稀有度技能数量'),
    [ItemRarity.EPIC]: Schema.number().default(2).description('史诗稀有度技能数量'),
    [ItemRarity.LEGENDARY]: Schema.number().default(3).description('传说稀有度技能数量')
  }).description('稀有度技能数量配置')
})

export const config: Config = {
  descriptions: {
    truthDick: '真理牛子是一种特殊的牛子，拥有强大的力量。',
    dick: '普通的牛子，可以通过锻炼变强。',
    ball: '普通的蛋蛋，可以通过锻炼变强。',
    successEvents: [
      '锻炼成功，牛子变长了！',
      '经过不懈努力，牛子变得更大了！',
      '今天的锻炼效果不错，牛子有所增长。'
    ],
    failEvents: [
      '锻炼失败，牛子没有变化。',
      '今天的锻炼没有效果，下次再试试吧。',
      '运气不好，牛子没有变长。'
    ],
    commandHelp: {
      'dick.info': '查看你的牛子信息',
      'dick.generate': '生成一个新的牛子',
      'dick.exercise': '锻炼你的牛子',
      'dick.rename': '重命名你的牛子',
      'dick.rank': '查看牛子排行榜',
      'dick.count': '查看牛子数量统计',
      'dick.reset': '重置你的牛子',
      'dick.draw': '抽取物品',
      'dick.drawrate': '查看抽取概率',
      'dick.inventory': '查看物品栏',
      'dick.use': '使用物品'
    }
  },
  itemDescriptions: {
    truthDick: '真理牛子是一种特殊的牛子，拥有强大的力量。',
    dickNormal: '普通的牛子，可以通过锻炼变强。',
    dickRare: '普通的牛子，可以通过锻炼变强。',
    dickEpic: '普通的牛子，可以通过锻炼变强。',
    dickLegendary: '普通的牛子，可以通过锻炼变强。',
    dickMythic: '普通的牛子，可以通过锻炼变强。',
    ballNormal: '普通的蛋蛋，可以通过锻炼变强。',
    ballRare: '普通的蛋蛋，可以通过锻炼变强。',
    ballEpic: '普通的蛋蛋，可以通过锻炼变强。',
    ballLegendary: '普通的蛋蛋，可以通过锻炼变强。',
    ballMythic: '普通的蛋蛋，可以通过锻炼变强。'
  },
  rarityNames: {
    normal: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
    mythic: '神话'
  },
  exerciseEvents: {
    successEvents: [
      '锻炼成功，牛子变长了！',
      '经过不懈努力，牛子变得更大了！',
      '今天的锻炼效果不错，牛子有所增长。'
    ],
    failEvents: [
      '锻炼失败，牛子没有变化。',
      '今天的锻炼没有效果，下次再试试吧。',
      '运气不好，牛子没有变长。'
    ]
  },
  commandHelp: {
    generate: '生成一个新的牛子',
    info: '查看你的牛子信息',
    rename: '重命名你的牛子',
    exercise: '锻炼你的牛子',
    fight: '战斗',
    rank: '查看牛子排行榜',
    collection: '查看牛子收藏',
    inventory: '查看物品栏',
    use: '使用物品',
    obtainTruth: '获取真理牛子',
    drawrate: '查看抽取概率'
  },
  energy: {
    cost: 10,
    recover: 1,
    interval: 360
  },
  rank: {
    displayCount: 10
  },
  pools: {
    [DrawPoolType.NORMAL]: {
      ticketCost: 100,
      description: '普通的抽卡池'
    },
    [DrawPoolType.LIMITED]: {
      ticketCost: 200,
      description: '限定的抽卡池'
    },
    [DrawPoolType.EVENT]: {
      ticketCost: 300,
      description: '活动的抽卡池'
    }
  },
  rarityWeights: {
    [ItemRarity.COMMON]: 70,
    [ItemRarity.RARE]: 20,
    [ItemRarity.EPIC]: 8,
    [ItemRarity.LEGENDARY]: 2
  },
  rarityMultipliers: {
    [ItemRarity.COMMON]: 1,
    [ItemRarity.RARE]: 1.5,
    [ItemRarity.EPIC]: 2,
    [ItemRarity.LEGENDARY]: 3
  },
  raritySkillCounts: {
    [ItemRarity.COMMON]: 0,
    [ItemRarity.RARE]: 1,
    [ItemRarity.EPIC]: 2,
    [ItemRarity.LEGENDARY]: 3
  }
} 