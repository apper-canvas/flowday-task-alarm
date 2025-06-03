import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns'
import ApperIcon from './ApperIcon'
import taskService from '../services/api/taskService'

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const allTasks = await taskService.getAll()
      setTasks(allTasks || [])
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    
    try {
      const updatedTask = await taskService.update(taskId, {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      })

      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), date)
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  }

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
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <ApperIcon name="CheckSquare" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    FlowDay Calendar
                  </h1>
                  <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">
                    {format(currentDate, 'MMMM yyyy')}
                  </p>
                </div>
              </Link>
            </motion.div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/"
                className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors group"
                title="Back to Tasks"
              >
                <ApperIcon name="ArrowLeft" className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
              </Link>

              <Link
                to="/analytics"
                className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors group"
                title="View Analytics"
              >
                <ApperIcon name="BarChart3" className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Calendar Controls */}
        <div className="mb-6">
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 border border-surface-200 dark:border-surface-700 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  Today
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                >
                  <ApperIcon name="ChevronLeft" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                >
                  <ApperIcon name="ChevronRight" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-soft overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-surface-200 dark:border-surface-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 sm:p-4 text-center">
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-surface-200 dark:divide-surface-700">
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)
              
              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`min-h-[120px] p-2 sm:p-3 border-b border-surface-200 dark:border-surface-700 ${
                    !isCurrentMonth ? 'bg-surface-50 dark:bg-surface-900/50' : ''
                  } ${isTodayDate ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      !isCurrentMonth 
                        ? 'text-surface-400 dark:text-surface-600' 
                        : isTodayDate
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-surface-900 dark:text-white'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {isTodayDate && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-1.5 rounded text-xs cursor-pointer transition-all ${
                          task.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 line-through opacity-75'
                            : 'bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600'
                        }`}
                        title={`${task.title}${task.description ? ` - ${task.description}` : ''}`}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}></div>
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-surface-500 dark:text-surface-400 p-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-surface-200 dark:border-surface-700 shadow-soft">
            <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-3">Priority Legend</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-surface-600 dark:text-surface-400">High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-surface-600 dark:text-surface-400">Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-surface-600 dark:text-surface-400">Low Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-surface-600 dark:text-surface-400">Click tasks to toggle completion</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarView