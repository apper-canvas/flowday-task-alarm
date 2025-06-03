import { toast } from 'react-toastify'
import { differenceInMinutes, parseISO } from 'date-fns'

class NotificationService {
  constructor() {
    this.permission = 'default'
    this.activeReminders = new Map()
    this.checkInterval = null
    this.init()
  }

  async init() {
    if ('Notification' in window) {
      this.permission = Notification.permission
      this.startReminderCheck()
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      
      if (permission === 'granted') {
        toast.success('Notifications enabled successfully!')
        this.startReminderCheck()
        return true
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.')
        return false
      } else {
        toast.warning('Notification permission not granted')
        return false
      }
    } catch (error) {
      toast.error('Failed to request notification permission')
      return false
    }
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  scheduleReminder(task) {
    if (!task.reminder || task.reminder === 'none' || !task.dueDate) {
      return
    }

    const dueDate = parseISO(task.dueDate)
    const now = new Date()
    
    // Calculate reminder time based on selected option
    const reminderMinutes = this.getReminderMinutes(task.reminder)
    const reminderTime = new Date(dueDate.getTime() - (reminderMinutes * 60 * 1000))
    
    // Only schedule if reminder time is in the future
    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        this.showTaskReminder(task)
        this.activeReminders.delete(task.id)
      }, reminderTime.getTime() - now.getTime())
      
      this.activeReminders.set(task.id, timeoutId)
    }
  }

  getReminderMinutes(reminderType) {
    const reminderMap = {
      '5min': 5,
      '30min': 30,
      '1hour': 60,
      '1day': 1440
    }
    return reminderMap[reminderType] || 0
  }

  cancelReminder(taskId) {
    const timeoutId = this.activeReminders.get(taskId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.activeReminders.delete(taskId)
    }
  }

  showTaskReminder(task) {
    const minutesUntilDue = differenceInMinutes(parseISO(task.dueDate), new Date())
    
    let message = `Task "${task.title}" is due`
    if (minutesUntilDue > 0) {
      message += ` in ${minutesUntilDue} minutes`
    } else if (minutesUntilDue === 0) {
      message += ' now'
    } else {
      message += ` ${Math.abs(minutesUntilDue)} minutes ago`
    }

    // Show browser notification
    this.showNotification('FlowDay Reminder', {
      body: message,
      tag: `task-${task.id}`,
      requireInteraction: true
    })

    // Show toast notification as backup
    if (minutesUntilDue <= 0) {
      toast.error(message, { autoClose: 10000 })
    } else if (minutesUntilDue <= 5) {
      toast.warning(message, { autoClose: 8000 })
    } else {
      toast.info(message, { autoClose: 5000 })
    }
  }

  startReminderCheck() {
    // Check for due tasks every minute
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    
    this.checkInterval = setInterval(() => {
      this.checkUpcomingTasks()
    }, 60000) // Check every minute
  }

  checkUpcomingTasks() {
    // This will be called by the main app to check tasks
    if (typeof this.onCheckTasks === 'function') {
      this.onCheckTasks()
    }
  }

  setTaskChecker(callback) {
    this.onCheckTasks = callback
  }

  getPermissionStatus() {
    return this.permission
  }

  isSupported() {
    return 'Notification' in window
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    
    // Cancel all active reminders
    this.activeReminders.forEach(timeoutId => {
      clearTimeout(timeoutId)
    })
    this.activeReminders.clear()
  }
}

export default new NotificationService()