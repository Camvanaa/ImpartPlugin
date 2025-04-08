import { Context } from 'koishi'
import { createDescriptionManager } from '../utils/descriptions'

export function apply(ctx: Context) {
  const descManager = createDescriptionManager(ctx)

  ctx.command('dick.help [command:string]')
    .action(async ({ session }, command) => {
      if (!session?.guildId) {
        return '请在群聊中使用此命令'
      }

      if (command) {
        // 显示特定命令的帮助信息
        const help = descManager.getCommandHelp(command)
        return help || '没有找到该命令的帮助信息'
      }

      // 显示所有命令的帮助信息
      const commands = [
        'generate', 'info', 'rename', 'exercise', 'fight',
        'rank', 'collection', 'inventory', 'use', 'obtainTruth',
        'drawrate'
      ]

      let message = '可用命令列表：\n'
      for (const cmd of commands) {
        const help = descManager.getCommandHelp(cmd)
        message += `\n${cmd}: ${help}`
      }

      return message
    })
} 