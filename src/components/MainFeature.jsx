import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday } from 'date-fns'
import ApperIcon from './ApperIcon'
import taskService from '../services/api/taskService'

const MainFeature = ({ tasks, setTasks, categories, stats, setStats }) => {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
  })
  const [filter, setFilter] = useState('all')
  const [draggedTask, setDraggedTask] = useState(null)

  const priorityColors = {
    high: 'border-red-400 bg-red-50 dark:bg-red-900/20',
    medium: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    low: 'border-green-400 bg-green-50 dark:bg-green-900/20'
  }

  const priorityIcons = {
    high: 'AlertTriangle',
    medium: 'Clock',
    low: 'CheckCircle'
}

  const getReminderColor = (task) => {
    if (!task?.reminder || task.reminder === 'none') return ''
    
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate.getTime() - now.getTime()
    
    // Convert reminder time to milliseconds
    const reminderMs = {
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '30min': 30 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
      '2hours': 2 * 60 * 60 * 1000,
      '1day': 24 * 60 * 60 * 1000
    }
    
    const reminderTime = reminderMs[task.reminder] || 0
    
    if (timeDiff <= reminderTime) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/30'
    } else if (timeDiff <= reminderTime * 2) {
      return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'
    }
    
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  }

  const getReminderLabel = (reminder) => {
    const labels = {
      '5min': '5 minutes before',
      '15min': '15 minutes before',
      '30min': '30 minutes before',
      '1hour': '1 hour before',
      '2hours': '2 hours before',
      '1day': '1 day before'
    }
    
    return labels[reminder] || reminder
  }

  const filteredTasks = tasks?.filter(task => {
    if (filter === 'completed') return task?.status === 'completed'
    if (filter === 'pending') return task?.status === 'pending'
    return true
  }) || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      const newTask = await taskService.create({
        ...formData,
        status: 'pending',
        dueDate: new Date(formData.dueDate).toISOString(),
        createdAt: new Date().toISOString()
      })

      if (isToday(new Date(newTask.dueDate))) {
        setTasks(prev => [...(prev || []), newTask])
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1
        }))
      }

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        dueDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm')
      })
      setShowTaskForm(false)
      toast.success('Task created successfully!')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const toggleTaskStatus = async (taskId) => {
    const task = tasks?.find(t => t?.id === taskId)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    
    try {
      const updatedTask = await taskService.update(taskId, {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      })

      setTasks(prev => prev?.map(t => t?.id === taskId ? updatedTask : t) || [])
      
      setStats(prev => ({
        ...prev,
        completed: prev.completed + (newStatus === 'completed' ? 1 : -1),
        pending: prev.pending + (newStatus === 'completed' ? -1 : 1)
      }))

      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    const task = tasks?.find(t => t?.id === taskId)
    if (!task) return

    try {
      await taskService.delete(taskId)
      setTasks(prev => prev?.filter(t => t?.id !== taskId) || [])
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [task.status]: prev[task.status] - 1
      }))

      toast.success('Task deleted!')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const updatedTask = await taskService.update(draggedTask.id, {
        ...draggedTask,
        status: targetStatus,
        completedAt: targetStatus === 'completed' ? new Date().toISOString() : null
      })

      setTasks(prev => prev?.map(t => t?.id === draggedTask.id ? updatedTask : t) || [])
      
      const statusChange = targetStatus === 'completed' ? 1 : -1
      setStats(prev => ({
        ...prev,
        completed: prev.completed + statusChange,
        pending: prev.pending - statusChange
      }))

      toast.success(`Task ${targetStatus}!`)
    } catch (error) {
      toast.error('Failed to update task')
    }
    
    setDraggedTask(null)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Quick Stats & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
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
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</p>
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
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 border border-surface-200 dark:border-surface-700 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Task Form */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-soft overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white">
                  Add New Task
                </h3>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  <ApperIcon name={showTaskForm ? "Minus" : "Plus"} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showTaskForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What needs to be done?"
                        className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add more details..."
                        rows="3"
                        className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          {categories?.map(category => (
                            <option key={category?.id} value={category?.name}>
                              {category?.name}
                            </option>
                          )) || (
                            <>
                              <option value="personal">Personal</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ApperIcon name="Plus" className="w-5 h-5" />
                      <span>Add Task</span>
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-soft"
          >
            <div className="p-4 sm:p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white">
                  Today's Tasks
                </h3>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' 
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'pending' 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {filteredTasks?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
                    <ApperIcon name="CheckSquare" className="w-8 h-8 text-surface-400" />
                  </div>
                  <p className="text-surface-500 dark:text-surface-400">
                    {filter === 'all' ? "No tasks for today. Add one to get started!" : 
                     filter === 'pending' ? "No pending tasks. Great job!" :
                     "No completed tasks yet. Keep going!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredTasks.map((task) => (
                      <motion.div
                        key={task?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        whileDrag={{ scale: 1.02, rotate: 1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, task?.status === 'completed' ? 'pending' : 'completed')}
                        className={`group p-4 border-l-4 rounded-xl bg-surface-50 dark:bg-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200 cursor-move ${
                          priorityColors[task?.priority] || priorityColors.medium
                        } ${task?.status === 'completed' ? 'task-completed' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleTaskStatus(task?.id)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              task?.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-surface-300 dark:border-surface-600 hover:border-green-500'
                            }`}
                          >
                            {task?.status === 'completed' && (
                              <ApperIcon name="Check" className="w-3 h-3" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium ${
                                  task?.status === 'completed' 
                                    ? 'line-through text-surface-500 dark:text-surface-400' 
                                    : 'text-surface-900 dark:text-white'
                                }`}>
                                  {task?.title}
                                </h4>
                                {task?.description && (
                                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                                    {task.description}
                                  </p>
                                )}
<div className="flex items-center space-x-4 mt-2">
                                  <span className="flex items-center space-x-1 text-xs text-surface-500">
                                    <ApperIcon name={priorityIcons[task?.priority] || 'Clock'} className="w-3 h-3" />
                                    <span className="capitalize">{task?.priority}</span>
                                  </span>
                                  <span className="flex items-center space-x-1 text-xs text-surface-500">
                                    <ApperIcon name="Tag" className="w-3 h-3" />
                                    <span className="capitalize">{task?.category}</span>
                                  </span>
                                  {task?.dueDate && (
                                    <span className="flex items-center space-x-1 text-xs text-surface-500">
                                      <ApperIcon name="Clock" className="w-3 h-3" />
                                      <span>{format(new Date(task.dueDate), 'HH:mm')}</span>
                                    </span>
                                  )}
                                </div>
{task?.reminder && task.reminder !== 'none' && (
                                  <div className="mt-2">
                                    <span className={`reminder-indicator ${getReminderColor(task)}`}>
                                      <ApperIcon name="Bell" className="w-3 h-3 mr-1" />
                                      {getReminderLabel(task.reminder)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => deleteTask(task?.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  <ApperIcon name="Trash2" className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
</motion.div>
        </div>
      </div>
    </div>
  )
}

export default MainFeature