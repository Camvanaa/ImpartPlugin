// 工具函数集合

/**
 * 根据长度决定显示名称
 * @param length 牛子/小穴长度
 * @returns 当长度<0时返回"小穴"，否则返回"牛子"
 */
export function getDickName(length: number): string {
  return length < 0 ? "小穴" : "牛子";
}

/**
 * 获取指定范围内的随机浮点数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机浮点数
 */
export function getRandomDouble(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

/**
 * 格式化牛子/小穴信息消息
 * @param userId 用户ID
 * @param dickName 牛子/小穴名称
 * @param nickname 昵称
 * @param length 长度
 * @param energy 体力值
 * @returns 格式化后的消息
 */
export function formatDickInfoMessage(userId: string, dickName: string, nickname: string, length: number, energy: number): string {
  return `<at id="${userId}"/>，你的${dickName}"${nickname}"，目前长度为${length.toFixed(1)}cm，当前体力状况：[${energy}/240]`;
}
