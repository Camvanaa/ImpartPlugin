/**
 * 物品类型枚举
 */
export enum ItemType {
  // 牛子类型
  DICK_NORMAL = 'dick_normal',
  DICK_RARE = 'dick_rare',
  DICK_EPIC = 'dick_epic',
  DICK_LEGENDARY = 'dick_legendary',
  DICK_MYTHIC = 'dick_mythic',
  TRUTH_DICK = 'truth_dick',

  // 蛋蛋类型
  BALL_NORMAL = 'ball_normal',
  BALL_RARE = 'ball_rare',
  BALL_EPIC = 'ball_epic',
  BALL_LEGENDARY = 'ball_legendary',
  BALL_MYTHIC = 'ball_mythic'
}

/**
 * 物品稀有度枚举
 */
export enum Rarity {
  NORMAL = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
  MYTHIC = 5
}

/**
 * 物品属性类型
 */
export interface ItemAttributes {
  strength: number;      // 力量
  agility: number;       // 敏捷
  intelligence: number;  // 智力
  luck: number;         // 幸运
}

/**
 * 物品技能类型
 */
export interface ItemSkill {
  name: string;         // 技能名称
  description: string;  // 技能描述
  power: number;        // 技能威力
  cooldown: number;     // 冷却时间
}

/**
 * 物品类型
 */
export interface Item {
  id: string;           // 物品ID
  type: ItemType;       // 物品类型
  rarity: Rarity;       // 稀有度
  attributes: ItemAttributes;  // 属性
  skills: ItemSkill[];  // 技能列表
  description: string;  // 描述
} 