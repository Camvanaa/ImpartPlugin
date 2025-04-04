import { Context, Logger } from 'koishi'
import { resolve } from 'path'
import { Dick } from '../models/dick'
import * as fs from 'fs/promises'
import * as path from 'path'

interface DickBasicInfo {
  id: number
  guid: string
  belongings: string
  nickName: string
  length: number
  groupNumber: string
  energy: number
}

interface DickEnergy {
  id: number
  dickGuid: string
  energyLastUpdate: number
  energyLastUpdateTime: number
}

interface DickCoffee {
  id: number
  guid: string
  lastDrinkTime: number
}

// 物品类型枚举
export enum ItemType {
  TRUTH_DICK = 'truth_dick',
  // 后续可以添加更多物品类型
}

// 仓库物品接口
interface InventoryItem {
  id: number
  userId: string
  groupId: string
  itemType: ItemType
  quantity: number
}

export class Database {
  private logger: Logger
  private dataDir: string
  private basicInfoPath: string
  private energyPath: string
  private coffeePath: string
  private inventoryPath: string
  
  // 内存中缓存的数据
  private dickBasicInfos: DickBasicInfo[] = []
  private dickEnergies: DickEnergy[] = []
  private dickCoffees: DickCoffee[] = []
  private nextInventoryId: number = 1
  private inventoryItems: InventoryItem[] = []
  
  private nextBasicInfoId = 1
  private nextEnergyId = 1
  private nextCoffeeId = 1
  
  constructor(private ctx: Context) {
    this.logger = ctx.logger('dick-fighter')
    
    // 确保数据目录存在
    this.dataDir = resolve(ctx.baseDir, 'data/dick-fighter')
    this.basicInfoPath = path.join(this.dataDir, 'dick_basic_info.json')
    this.energyPath = path.join(this.dataDir, 'dick_energy.json')
    this.coffeePath = path.join(this.dataDir, 'dick_coffee.json')
    this.inventoryPath = path.join(this.dataDir, 'inventory.json')
    
    // 初始化数据
    this.initializeData()
  }
  
  private async initializeData() {
    try {
      // 确保目录存在
      await fs.mkdir(this.dataDir, { recursive: true })
      
      // 尝试加载基本信息数据
      try {
        const basicInfoData = await fs.readFile(this.basicInfoPath, 'utf-8')
        this.dickBasicInfos = JSON.parse(basicInfoData)
        
        // 找出最大ID
        if (this.dickBasicInfos.length > 0) {
          this.nextBasicInfoId = Math.max(...this.dickBasicInfos.map(d => d.id)) + 1
        }
      } catch (e) {
        // 文件不存在，创建初始数据
        this.dickBasicInfos = []
        await this.saveBasicInfos()
      }
      
      // 尝试加载体力数据
      try {
        const energyData = await fs.readFile(this.energyPath, 'utf-8')
        this.dickEnergies = JSON.parse(energyData)
        
        if (this.dickEnergies.length > 0) {
          this.nextEnergyId = Math.max(...this.dickEnergies.map(d => d.id)) + 1
        }
      } catch (e) {
        // 文件不存在，创建初始数据
        this.dickEnergies = []
        await this.saveEnergies()
      }
      
      // 尝试加载咖啡数据
      try {
        const coffeeData = await fs.readFile(this.coffeePath, 'utf-8')
        this.dickCoffees = JSON.parse(coffeeData)
        
        if (this.dickCoffees.length > 0) {
          this.nextCoffeeId = Math.max(...this.dickCoffees.map(d => d.id)) + 1
        }
      } catch (e) {
        // 文件不存在，创建初始数据
        this.dickCoffees = []
        await this.saveCoffees()
      }
      
      // 尝试加载仓库数据
      try {
        const inventoryData = await fs.readFile(this.inventoryPath, 'utf-8')
        this.inventoryItems = JSON.parse(inventoryData)
        
        if (this.inventoryItems.length > 0) {
          this.nextInventoryId = Math.max(...this.inventoryItems.map(i => i.id)) + 1
        }
      } catch (e) {
        // 文件不存在，创建初始数据
        this.inventoryItems = []
        await this.saveInventory()
      }
    } catch (e) {
      this.logger.error('初始化数据失败:', e)
    }
  }
  
  private async saveBasicInfos() {
    await fs.writeFile(this.basicInfoPath, JSON.stringify(this.dickBasicInfos, null, 2))
  }
  
  private async saveEnergies() {
    await fs.writeFile(this.energyPath, JSON.stringify(this.dickEnergies, null, 2))
  }
  
  private async saveCoffees() {
    await fs.writeFile(this.coffeePath, JSON.stringify(this.dickCoffees, null, 2))
  }
  
  private async saveInventory() {
    await fs.writeFile(this.inventoryPath, JSON.stringify(this.inventoryItems, null, 2))
  }
  
  // 获取牛子信息
  async getDickWithIds(userId: string, groupId: string): Promise<Dick | null> {
    const result = this.dickBasicInfos.find(d => 
      d.belongings === userId && d.groupNumber === groupId
    )
    
    if (!result) return null
    
    const dick = new Dick()
    dick.belongings = result.belongings
    dick.nickName = result.nickName
    dick.length = result.length
    dick.guid = result.guid
    dick.groupNumber = groupId
    
    // 获取体力信息
    dick.energy = await this.checkDickEnergyWithGuid(dick.guid)
    
    return dick
  }
  
  // 检查牛子体力
  async checkDickEnergyWithGuid(guid: string): Promise<number> {
    const result = this.dickEnergies.find(d => d.dickGuid === guid)
    
    if (!result) {
      // 创建新的体力记录
      const newEnergy: DickEnergy = {
        id: this.nextEnergyId++,
        dickGuid: guid,
        energyLastUpdate: 240,
        energyLastUpdateTime: Math.floor(Date.now() / 1000)
      }
      this.dickEnergies.push(newEnergy)
      await this.saveEnergies()
      return 240
    }
    
    const energyLastUpdate = result.energyLastUpdate
    const energyLastUpdateTime = result.energyLastUpdateTime
    
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDifference = currentTime - energyLastUpdateTime
    
    // 每6分钟恢复1点体力
    const energyNow = Math.min(240, energyLastUpdate + Math.floor(timeDifference / (6 * 60)))
    return energyNow
  }
  
  // 生成新牛子
  async generateNewDick(userId: string, groupId: string, dick: Dick): Promise<boolean> {
    try {
      // 创建基本信息
      const newBasicInfo: DickBasicInfo = {
        id: this.nextBasicInfoId++,
        guid: dick.guid,
        belongings: userId,
        nickName: dick.nickName,
        length: dick.length,
        groupNumber: groupId,
        energy: 240  // 添加初始体力值
      }
      this.dickBasicInfos.push(newBasicInfo)
      await this.saveBasicInfos()
      
      // 创建体力记录
      const newEnergy: DickEnergy = {
        id: this.nextEnergyId++,
        dickGuid: dick.guid,
        energyLastUpdate: 240,
        energyLastUpdateTime: Math.floor(Date.now() / 1000)
      }
      this.dickEnergies.push(newEnergy)
      await this.saveEnergies()
      
      return true
    } catch (e) {
      this.logger.error('生成牛子失败:', e)
      return false
    }
  }
  
  // 更新牛子名称
  async updateDickNickName(userId: string, groupId: string, newNickName: string): Promise<boolean> {
    try {
      const dick = this.dickBasicInfos.find(d => 
        d.belongings === userId && d.groupNumber === groupId
      )
      
      if (dick) {
        dick.nickName = newNickName
        await this.saveBasicInfos()
        return true
      }
      return false
    } catch (e) {
      this.logger.error('更新牛子名称失败:', e)
      return false
    }
  }
  
  // 更新牛子体力
  async updateDickEnergy(energy: number, guid: string): Promise<boolean> {
    try {
      const dickEnergy = this.dickEnergies.find(d => d.dickGuid === guid)
      
      if (dickEnergy) {
        dickEnergy.energyLastUpdate = energy
        dickEnergy.energyLastUpdateTime = Math.floor(Date.now() / 1000)
        await this.saveEnergies()
        return true
      }
      return false
    } catch (e) {
      this.logger.error('更新牛子体力失败:', e)
      return false
    }
  }
  
  // 更新牛子长度
  async updateDickLength(length: number, guid: string): Promise<boolean> {
    try {
      const dick = this.dickBasicInfos.find(d => d.guid === guid)
      
      if (dick) {
        dick.length = length
        await this.saveBasicInfos()
        return true
      }
      return false
    } catch (e) {
      this.logger.error('更新牛子长度失败:', e)
      return false
    }
  }
  
  // 获取随机牛子
  async getRandomDick(excludeGuid: string): Promise<Dick | null> {
    // 过滤掉自己的牛子
    const filteredDicks = this.dickBasicInfos.filter(d => d.guid !== excludeGuid)
    
    if (filteredDicks.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * filteredDicks.length)
    const randomDick = filteredDicks[randomIndex]
    
    const dick = new Dick()
    dick.belongings = randomDick.belongings
    dick.nickName = randomDick.nickName
    dick.length = randomDick.length
    dick.guid = randomDick.guid
    dick.groupNumber = randomDick.groupNumber
    
    // 获取体力信息
    dick.energy = await this.checkDickEnergyWithGuid(dick.guid)
    
    return dick
  }
  
  // 获取排名信息
  async getLengthRanks(guid: string, groupId: string): Promise<{
    globalRank: number;
    globalTotal: number;
    groupRank: number;
    groupTotal: number;
  }> {
    // 获取指定GUID的牛子长度
    const dickInfo = this.dickBasicInfos.find(d => d.guid === guid)
    if (!dickInfo) throw new Error('牛子不存在')
    
    const length = dickInfo.length
    
    // 获取全局排名
    const allDicks = this.dickBasicInfos
    const globalTotal = allDicks.length
    const globalRank = allDicks.filter(d => d.length > length).length + 1
    
    // 获取群内排名
    const groupDicks = this.dickBasicInfos.filter(d => d.groupNumber === groupId)
    const groupTotal = groupDicks.length
    const groupRank = groupDicks.filter(d => d.length > length).length + 1
    
    return {
      globalRank,
      globalTotal,
      groupRank,
      groupTotal
    }
  }
  
  // 获取前N个牛子排名
  async getFirstNDicksByOrder(n: number, order: number = 0, groupId?: string): Promise<Dick[]> {
    let dicks = [...this.dickBasicInfos]
    
    if (groupId) {
      // 获取群内排名
      dicks = dicks.filter(d => d.groupNumber === groupId)
    }
    
    // 按长度排序
    dicks.sort((a, b) => order === 0 ? b.length - a.length : a.length - b.length)
    
    // 取前N个
    const topDicks = dicks.slice(0, n)
    
    return Promise.all(topDicks.map(async d => {
      const dick = new Dick()
      dick.belongings = d.belongings
      dick.nickName = d.nickName
      dick.length = d.length
      dick.guid = d.guid
      dick.groupNumber = d.groupNumber
      dick.energy = await this.checkDickEnergyWithGuid(d.guid)
      return dick
    }))
  }
  
  // 咖啡相关功能
  async checkCoffeeInformation(guid: string): Promise<[boolean, number]> {
    const result = this.dickCoffees.find(d => d.guid === guid)
    
    if (!result) return [false, -1]
    
    return [true, result.lastDrinkTime]
  }
  
  async createNewCoffeeLine(guid: string): Promise<boolean> {
    try {
      const newCoffee: DickCoffee = {
        id: this.nextCoffeeId++,
        guid,
        lastDrinkTime: Math.floor(Date.now() / 1000)
      }
      this.dickCoffees.push(newCoffee)
      await this.saveCoffees()
      return true
    } catch (e) {
      this.logger.error('创建咖啡记录失败:', e)
      return false
    }
  }
  
  async drinkCoffee(guid: string): Promise<boolean> {
    try {
      const coffeeRecord = this.dickCoffees.find(d => d.guid === guid)
      
      if (coffeeRecord) {
        coffeeRecord.lastDrinkTime = Math.floor(Date.now() / 1000)
        await this.saveCoffees()
        return true
      }
      return false
    } catch (e) {
      this.logger.error('更新咖啡记录失败:', e)
      return false
    }
  }
  
  // 补偿功能
  async compensation(groupId: string, energyCompensate: number = 240): Promise<boolean> {
    try {
      // 获取群内所有牛子
      const dicks = this.dickBasicInfos.filter(d => d.groupNumber === groupId)
      
      // 为每个牛子补偿体力
      for (const dick of dicks) {
        const energyInfo = this.dickEnergies.find(e => e.dickGuid === dick.guid)
        if (energyInfo) {
          const newEnergy = Math.min(240, energyInfo.energyLastUpdate + energyCompensate)
          energyInfo.energyLastUpdate = newEnergy
        }
      }
      
      await this.saveEnergies()
      return true
    } catch (e) {
      this.logger.error('补偿体力失败:', e)
      return false
    }
  }
  
  async getCountOfTotalDicks(groupId?: string): Promise<number> {
    if (groupId) {
      return this.dickBasicInfos.filter(d => d.groupNumber === groupId).length
    }
    return this.dickBasicInfos.length
  }

  // 在Database类中添加方法
  async getAllDicks(): Promise<Dick[]> {
    // 转换基本信息为完整Dick对象
    return Promise.all(this.dickBasicInfos.map(async d => {
      const dick = new Dick()
      dick.belongings = d.belongings
      dick.nickName = d.nickName
      dick.length = d.length
      dick.guid = d.guid
      dick.groupNumber = d.groupNumber
      
      // 获取最新能量信息
      dick.energy = await this.checkDickEnergyWithGuid(d.guid)
      
      return dick
    }))
  }

  // 在Database类中添加
  async getDicksInGroup(groupId: string): Promise<Dick[]> {
    // 获取指定群内的所有牛子
    const groupDickInfos = this.dickBasicInfos.filter(d => d.groupNumber === groupId)
    
    // 转换为Dick对象
    return Promise.all(groupDickInfos.map(async d => {
      const dick = new Dick()
      dick.belongings = d.belongings
      dick.nickName = d.nickName
      dick.length = d.length
      dick.guid = d.guid
      dick.groupNumber = d.groupNumber
      
      // 获取能量信息
      dick.energy = await this.checkDickEnergyWithGuid(d.guid)
      
      return dick
    }))
  }

  // 在Database类中添加
  async resetDick(userId: string, groupId: string): Promise<boolean> {
    try {
      // 查找该用户在指定群的牛子
      const dickIndex = this.dickBasicInfos.findIndex(d => 
        d.belongings === userId && d.groupNumber === groupId
      );
      
      if (dickIndex === -1) {
        return false; // 没有找到要重置的牛子
      }
      
      // 记录牛子guid，用于删除能量记录
      const dickGuid = this.dickBasicInfos[dickIndex].guid;
      
      // 从dickBasicInfos数组中移除
      this.dickBasicInfos.splice(dickIndex, 1);
      
      // 同时需要清理对应的能量记录和咖啡记录
      this.removeEnergyRecord(dickGuid);
      this.removeCoffeeRecord(dickGuid);
      
      // 保存更新后的数据
      await this.saveBasicInfos();
      
      return true;
    } catch (error) {
      console.error('Reset dick error:', error);
      return false;
    }
  }

  // 删除能量记录
  private removeEnergyRecord(dickGuid: string): void {
    const index = this.dickEnergies.findIndex(e => e.dickGuid === dickGuid);
    if (index !== -1) {
      this.dickEnergies.splice(index, 1);
      this.saveEnergies(); // 使用正确的方法名
    }
  }

  // 删除咖啡记录
  private removeCoffeeRecord(dickGuid: string): void {
    const index = this.dickCoffees.findIndex(c => c.guid === dickGuid);
    if (index !== -1) {
      this.dickCoffees.splice(index, 1);
      this.saveCoffees(); // 使用正确的方法名
    }
  }

  // 检查用户是否拥有指定物品
  async hasItem(userId: string, groupId: string, itemType: ItemType): Promise<boolean> {
    const item = this.inventoryItems.find(i => 
      i.userId === userId && 
      i.groupId === groupId && 
      i.itemType === itemType
    )
    return item?.quantity > 0
  }
  
  // 添加物品到用户仓库
  async addItem(userId: string, groupId: string, itemType: ItemType, quantity: number = 1): Promise<boolean> {
    try {
      let item = this.inventoryItems.find(i => 
        i.userId === userId && 
        i.groupId === groupId && 
        i.itemType === itemType
      )
      
      if (item) {
        item.quantity += quantity
      } else {
        item = {
          id: this.nextInventoryId++,
          userId,
          groupId,
          itemType,
          quantity
        }
        this.inventoryItems.push(item)
      }
      
      await this.saveInventory()
      return true
    } catch (e) {
      this.logger.error('添加物品失败:', e)
      return false
    }
  }
  
  // 从用户仓库移除物品
  async removeItem(userId: string, groupId: string, itemType: ItemType, quantity: number = 1): Promise<boolean> {
    try {
      const item = this.inventoryItems.find(i => 
        i.userId === userId && 
        i.groupId === groupId && 
        i.itemType === itemType
      )
      
      if (!item || item.quantity < quantity) {
        return false
      }
      
      item.quantity -= quantity
      await this.saveInventory()
      return true
    } catch (e) {
      this.logger.error('移除物品失败:', e)
      return false
    }
  }
  
  // 获取用户仓库物品列表
  async getInventory(userId: string, groupId: string): Promise<InventoryItem[]> {
    return this.inventoryItems.filter(i => i.userId === userId && i.groupId === groupId)
  }
} 