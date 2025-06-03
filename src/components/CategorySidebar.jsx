import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './ApperIcon'

const CategorySidebar = ({ 
  tasks, 
  categories, 
  selectedCategories, 
  onCategoryChange, 
  selectedTags, 
  onTagChange,
  isOpen,
  onToggle 
}) => {
  // Get all unique tags from tasks
  const allTags = [...new Set(tasks?.flatMap(task => task.tags || []).filter(Boolean))]
  
  // Calculate task counts per category
  const getCategoryCount = (categoryName) => {
    return tasks?.filter(task => 
      task.category === categoryName && task.status !== 'completed'
    ).length || 0
  }
  
  // Calculate task counts per tag
  const getTagCount = (tag) => {
    return tasks?.filter(task => 
      task.tags?.includes(tag) && task.status !== 'completed'
    ).length || 0
  }
  
  const handleCategoryToggle = (categoryName) => {
    const newSelected = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(cat => cat !== categoryName)
      : [...selectedCategories, categoryName]
    onCategoryChange(newSelected)
  }
  
  const handleTagToggle = (tag) => {
    const newSelected = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    onTagChange(newSelected)
  }
  
  const clearAllFilters = () => {
    onCategoryChange([])
    onTagChange([])
  }
  
  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700 lg:p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Filters
            </h2>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors lg:hidden"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {/* Categories Section */}
            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 flex items-center">
                <ApperIcon name="Folder" className="w-4 h-4 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories?.map(category => {
                  const count = getCategoryCount(category.name)
                  const isSelected = selectedCategories.includes(category.name)
                  
                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryToggle(category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="capitalize font-medium">{category.name}</span>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSelected 
                            ? 'bg-primary-200 dark:bg-primary-800' 
                            : 'bg-surface-200 dark:bg-surface-600'
                        }`}>
                          {count}
                        </span>
                      )}
                    </motion.button>
                  )
                }) || (
                  <div className="text-sm text-surface-500 dark:text-surface-400">
                    No categories available
                  </div>
                )}
              </div>
            </div>
            
            {/* Tags Section */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 flex items-center">
                  <ApperIcon name="Tag" className="w-4 h-4 mr-2" />
                  Tags
                </h3>
                <div className="space-y-2">
                  {allTags.map(tag => {
                    const count = getTagCount(tag)
                    const isSelected = selectedTags.includes(tag)
                    
                    return (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTagToggle(tag)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800'
                            : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400'
                        }`}
                      >
                        <span className="text-sm">#{tag}</span>
                        {count > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isSelected 
                              ? 'bg-secondary-200 dark:bg-secondary-800' 
                              : 'bg-surface-200 dark:bg-surface-600'
                          }`}>
                            {count}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Active Tasks</span>
                  <span className="font-medium">{tasks?.filter(t => t.status !== 'completed').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Categories</span>
                  <span className="font-medium">{categories?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Tags</span>
                  <span className="font-medium">{allTags.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default CategorySidebar