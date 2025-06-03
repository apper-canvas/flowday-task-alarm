import dailyStatsData from '../mockData/dailyStats.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let dailyStats = [...dailyStatsData]

const dailyStatsService = {
  async getAll() {
    await delay(300)
    return [...dailyStats]
  },

  async getById(date) {
    await delay(200)
    const stats = dailyStats.find(s => s.date === date)
    return stats ? { ...stats } : null
  },

  async create(statsData) {
    await delay(350)
    const newStats = {
      ...statsData,
      id: Date.now()
    }
    dailyStats.push(newStats)
    return { ...newStats }
  },

  async update(date, statsData) {
    await delay(300)
    const index = dailyStats.findIndex(s => s.date === date)
    if (index === -1) throw new Error('Stats not found')
    
    dailyStats[index] = { ...dailyStats[index], ...statsData }
    return { ...dailyStats[index] }
  },

  async delete(date) {
    await delay(250)
    const index = dailyStats.findIndex(s => s.date === date)
    if (index === -1) throw new Error('Stats not found')
    
    dailyStats.splice(index, 1)
    return true
  }
}

export default dailyStatsService