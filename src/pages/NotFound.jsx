import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <ApperIcon name="AlertTriangle" className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-surface-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. Let's get you back to managing your tasks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Back to FlowDay</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound