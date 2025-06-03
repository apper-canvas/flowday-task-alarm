import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import { 
  format, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isToday,
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns'
import ApperIcon from './ApperIcon'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'

const AnalyticsDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewType, setViewType] = useState('daily') // 'daily' | 'weekly'
  const [dateRange, setDateRange] = useState(7) // days to look back
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, categoriesResult] = await Promise.all([
          taskService.getAll(),
          categoryService.getAll()
        ])
        
        setTasks(tasksResult || [])
        setCategories(categoriesResult || [])
      } catch (err) {
        setError(err?.message || 'Failed to load analytics data')
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Calculate daily completion rates
  const getDailyStats = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), dateRange - 1),
      end: new Date()
    })

    return days.map(day => {
      const dayTasks = tasks.filter(task => {
        if (!task?.dueDate) return false
        const taskDate = parseISO(task.dueDate)
        return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      })

      const completed = dayTasks.filter(task => task?.status === 'completed').length
      const total = dayTasks.length
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      return {
        date: format(day, 'yyyy-MM-dd'),
        displayDate: format(day, 'MMM dd'),
        completed,
        total,
        completionRate: Math.round(completionRate)
      }
    })
  }

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const weeks = []
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7))
      const weekEnd = endOfWeek(weekStart)
      
      const weekTasks = tasks.filter(task => {
        if (!task?.dueDate) return false
        const taskDate = parseISO(task.dueDate)
        return taskDate >= weekStart && taskDate <= weekEnd
      })

      const completed = weekTasks.filter(task => task?.status === 'completed').length
      const total = weekTasks.length
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      weeks.unshift({
        week: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
        completed,
        total,
        completionRate: Math.round(completionRate)
      })
    }
    return weeks
  }

  // Calculate category distribution
  const getCategoryStats = () => {
    const categoryMap = {}
    
    tasks.forEach(task => {
      if (!task?.category) return
      if (!categoryMap[task.category]) {
        categoryMap[task.category] = { total: 0, completed: 0 }
      }
      categoryMap[task.category].total++
      if (task.status === 'completed') {
        categoryMap[task.category].completed++
      }
    })

    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      ...stats,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }))
  }

  // Calculate priority distribution
  const getPriorityStats = () => {
    const priorityMap = { high: 0, medium: 0, low: 0 }
    
    tasks.forEach(task => {
      if (task?.priority && priorityMap.hasOwnProperty(task.priority)) {
        priorityMap[task.priority]++
      }
    })

    return Object.entries(priorityMap).map(([priority, count]) => ({
      priority,
      count,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    }))
  }

  const dailyStats = getDailyStats()
  const weeklyStats = getWeeklyStats()
  const categoryStats = getCategoryStats()
  const priorityStats = getPriorityStats()

  // Overall statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task?.status === 'completed').length
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Today's statistics
  const todayTasks = tasks.filter(task => 
    task?.dueDate && isToday(parseISO(task.dueDate))
  )
  const todayCompleted = todayTasks.filter(task => task?.status === 'completed').length
  const todayCompletionRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0

  // Chart configurations
  const lineChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: {
      mode: darkMode ? 'dark' : 'light'
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#6366f1'],
    xaxis: {
      categories: dailyStats.map(d => d.displayDate),
      labels: {
        style: { colors: darkMode ? '#94a3b8' : '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: darkMode ? '#94a3b8' : '#64748b' }
      },
      min: 0,
      max: 100
    },
    grid: {
      borderColor: darkMode ? '#334155' : '#e2e8f0'
    },
    tooltip: {
      theme: darkMode ? 'dark' : 'light'
    }
  }

  const barChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: {
      mode: darkMode ? 'dark' : 'light'
    },
    colors: ['#10b981'],
    xaxis: {
      categories: weeklyStats.map(w => w.week),
      labels: {
        style: { colors: darkMode ? '#94a3b8' : '#64748b' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: darkMode ? '#94a3b8' : '#64748b' }
      },
      min: 0,
      max: 100
    },
    grid: {
      borderColor: darkMode ? '#334155' : '#e2e8f0'
    },
    tooltip: {
      theme: darkMode ? 'dark' : 'light'
    }
  }

  const donutChartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    theme: {
      mode: darkMode ? 'dark' : 'light'
    },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    labels: ['High', 'Medium', 'Low'],
    legend: {
      labels: {
        colors: darkMode ? '#94a3b8' : '#64748b'
      }
    },
    tooltip: {
      theme: darkMode ? 'dark' : 'light'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
        <div className="text-center p-8">
          <ApperIcon name="AlertTriangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
            <span>Back to Tasks</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-800/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Link
                to="/"
                className="flex items-center space-x-2 text-surface-600 dark:text-surface-400 hover:text-primary-600 transition-colors"
              >
                <ApperIcon name="ArrowLeft" className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Tasks</span>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="BarChart3" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">
                  Task completion insights
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-3 py-1.5 text-sm bg-surface-100 dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <ApperIcon name="Calendar" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Overall Rate</p>
                <p className="text-3xl font-bold text-primary-600">{overallCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Today</p>
                <p className="text-3xl font-bold text-secondary-600">{todayCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                <ApperIcon name="Target" className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Completion Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Daily Completion Rate</h3>
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-primary-600" />
            </div>
            
            <Chart
              options={lineChartOptions}
              series={[{
                name: 'Completion Rate',
                data: dailyStats.map(d => d.completionRate)
              }]}
              type="line"
              height={300}
            />
          </motion.div>

          {/* Weekly Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Weekly Progress</h3>
              <ApperIcon name="BarChart3" className="w-5 h-5 text-green-600" />
            </div>
            
            <Chart
              options={barChartOptions}
              series={[{
                name: 'Completion Rate',
                data: weeklyStats.map(w => w.completionRate)
              }]}
              type="bar"
              height={300}
            />
          </motion.div>
        </div>

        {/* Category & Priority Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Category Performance</h3>
              <ApperIcon name="Tag" className="w-5 h-5 text-amber-600" />
            </div>
            
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {category.completionRate}%
                    </p>
                    <p className="text-xs text-surface-500">
                      {category.completed}/{category.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Priority Distribution</h3>
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-600" />
            </div>
            
            <Chart
              options={donutChartOptions}
              series={priorityStats.map(p => p.count)}
              type="donut"
              height={300}
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Back to Task Management</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

export default AnalyticsDashboard