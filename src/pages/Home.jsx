import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'
import { format, isToday } from 'date-fns'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, categoriesResult] = await Promise.all([
          taskService.getAll(),
          categoryService.getAll()
        ])
        
        const todayTasks = tasksResult?.filter(task => 
          task?.dueDate && isToday(new Date(task.dueDate))
        ) || []
        
        setTasks(todayTasks)
        setCategories(categoriesResult || [])
        
        const completed = todayTasks.filter(task => task?.status === 'completed').length
        setStats({
          total: todayTasks.length,
          completed,
          pending: todayTasks.length - completed
        })
      } catch (err) {
        setError(err?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <ApperIcon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-800/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  FlowDay
                </h1>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">
                  {format(new Date(), 'EEEE, MMMM d')}
                </p>
              </div>
            </motion.div>

<div className="flex items-center space-x-2 sm:space-x-4">
              {/* Stats Cards - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 rounded-lg">
                  <ApperIcon name="Calendar" className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">{stats.completed}</span>
                </div>
              </div>

              <Link
                to="/analytics"
                className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors group"
                title="View Analytics"
              >
                <ApperIcon name="BarChart3" className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
              </Link>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-surface-600 dark:text-surface-400" 
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Progress Overview - Mobile Visible */}
        <div className="mb-6 lg:hidden">
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Today's Progress</h2>
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {stats.completed}/{stats.total} tasks
              </span>
            </div>
            <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Task Management Interface */}
        <MainFeature 
          tasks={tasks} 
          setTasks={setTasks} 
          categories={categories || []}
          stats={stats}
          setStats={setStats}
        />
      </main>
    </div>
  )
}

export default Home