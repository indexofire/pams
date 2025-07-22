// 分页工具函数和配置

/**
 * 获取分页配置
 * @param {Object} i18n - 国际化实例
 * @returns {Object} 分页配置对象
 */
export function getPaginationConfig(i18n) {
  return {
    // 每页显示条数选项
    pageSizes: [10, 20, 50, 100],
    
    // 布局配置
    layout: 'total, sizes, prev, pager, next, jumper',
    
    // 国际化文本
    texts: {
      total: (total) => i18n.t('pagination.total', { total }),
      pageSize: (size) => i18n.t('pagination.pageSize', { size }),
      goto: i18n.t('pagination.goto'),
      prev: i18n.t('pagination.prev'),
      next: i18n.t('pagination.next')
    }
  }
}

/**
 * 创建分页响应式数据
 * @param {Object} options - 配置选项
 * @returns {Object} 分页响应式对象
 */
export function createPagination(options = {}) {
  const {
    current = 1,
    size = 20,
    total = 0
  } = options

  return {
    current,
    size,
    total
  }
}

/**
 * 分页大小变化处理
 * @param {Function} loadData - 加载数据的函数
 * @param {Object} pagination - 分页对象
 * @returns {Function} 处理函数
 */
export function createSizeChangeHandler(loadData, pagination) {
  return (size) => {
    pagination.size = size
    pagination.current = 1 // 重置到第一页
    loadData()
  }
}

/**
 * 当前页变化处理
 * @param {Function} loadData - 加载数据的函数
 * @param {Object} pagination - 分页对象
 * @returns {Function} 处理函数
 */
export function createCurrentChangeHandler(loadData, pagination) {
  return (current) => {
    pagination.current = current
    loadData()
  }
}

/**
 * 格式化分页显示文本
 * @param {Object} i18n - 国际化实例
 * @param {number} total - 总条数
 * @param {number} current - 当前页
 * @param {number} size - 每页条数
 * @returns {Object} 格式化后的文本对象
 */
export function formatPaginationTexts(i18n, total, current, size) {
  const start = (current - 1) * size + 1
  const end = Math.min(current * size, total)
  
  return {
    total: i18n.t('pagination.total', { total }),
    range: `${start}-${end}`,
    pageInfo: i18n.t('pagination.page', { current }),
    sizeInfo: i18n.t('pagination.pageSize', { size })
  }
}

/**
 * 计算分页信息
 * @param {number} total - 总条数
 * @param {number} current - 当前页
 * @param {number} size - 每页条数
 * @returns {Object} 分页信息
 */
export function calculatePaginationInfo(total, current, size) {
  const totalPages = Math.ceil(total / size)
  const start = (current - 1) * size + 1
  const end = Math.min(current * size, total)
  
  return {
    totalPages,
    start,
    end,
    hasNext: current < totalPages,
    hasPrev: current > 1
  }
}
