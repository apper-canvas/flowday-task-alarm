import categoriesData from '../mockData/categories.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let categories = [...categoriesData]

const categoryService = {
  async getAll() {
    await delay(250)
    return [...categories]
  },

  async getById(id) {
    await delay(200)
    const category = categories.find(c => c.id === id)
    return category ? { ...category } : null
  },

  async create(categoryData) {
    await delay(300)
    const newCategory = {
      ...categoryData,
      id: Date.now()
    }
    categories.push(newCategory)
    return { ...newCategory }
  },

  async update(id, categoryData) {
    await delay(250)
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')
    
    categories[index] = { ...categories[index], ...categoryData }
    return { ...categories[index] }
  },

  async delete(id) {
    await delay(200)
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')
    
    categories.splice(index, 1)
    return true
  }
}

export default categoryService