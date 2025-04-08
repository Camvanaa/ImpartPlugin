import { Schema } from 'koishi'
import { Item } from '../types'

export interface ImpartUser {
  userId: string
  guildId: string
  tickets: number
  inventory: Item[]
  collection: Item[]
}

export interface ImpartGuild {
  guildId: string
  currentScene: string
}

export const impartUserSchema = Schema.object({
  userId: Schema.string(),
  guildId: Schema.string(),
  tickets: Schema.number().default(0),
  inventory: Schema.array(Schema.any()).default([]),
  collection: Schema.array(Schema.any()).default([])
})

export const impartGuildSchema = Schema.object({
  guildId: Schema.string(),
  currentScene: Schema.string().default('')
}) 