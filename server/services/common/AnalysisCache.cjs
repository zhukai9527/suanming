// 智能分析缓存机制
// 实现LRU缓存算法和TTL过期机制，提升分析响应速度

const crypto = require('crypto');

class AnalysisCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // 最大缓存条目数
    this.defaultTTL = options.defaultTTL || 3600000; // 默认1小时过期
    this.cache = new Map();
    this.accessOrder = new Map(); // 用于LRU排序
    this.hitCount = 0;
    this.missCount = 0;
    
    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000); // 每5分钟清理一次
  }
  
  // 生成缓存键
  generateKey(analysisType, inputData) {
    const keyData = {
      type: analysisType,
      data: this.normalizeInputData(inputData)
    };
    
    const keyString = JSON.stringify(keyData, Object.keys(keyData).sort());
    return crypto.createHash('md5').update(keyString).digest('hex');
  }
  
  // 标准化输入数据
  normalizeInputData(inputData) {
    const normalized = {};
    
    // 标准化日期时间格式
    if (inputData.birth_date) {
      normalized.birth_date = new Date(inputData.birth_date).toISOString().split('T')[0];
    }
    
    if (inputData.birth_time) {
      normalized.birth_time = inputData.birth_time;
    }
    
    if (inputData.name) {
      normalized.name = inputData.name.trim();
    }
    
    if (inputData.gender) {
      normalized.gender = inputData.gender;
    }
    
    if (inputData.birth_place) {
      normalized.birth_place = inputData.birth_place.trim();
    }
    
    // 易经特有参数
    if (inputData.question) {
      normalized.question = inputData.question.trim();
    }
    
    if (inputData.divination_method) {
      normalized.divination_method = inputData.divination_method;
    }
    
    return normalized;
  }
  
  // 获取缓存
  get(analysisType, inputData) {
    const key = this.generateKey(analysisType, inputData);
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.missCount++;
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > cached.expireAt) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.missCount++;
      return null;
    }
    
    // 更新访问时间（LRU）
    this.accessOrder.set(key, Date.now());
    this.hitCount++;
    
    return {
      ...cached.data,
      _cached: true,
      _cacheHit: true,
      _cacheTime: cached.createdAt
    };
  }
  
  // 设置缓存
  set(analysisType, inputData, result, ttl = null) {
    const key = this.generateKey(analysisType, inputData);
    const expireTime = ttl || this.defaultTTL;
    
    // 如果缓存已满，删除最久未访问的项
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const cacheItem = {
      data: result,
      createdAt: Date.now(),
      expireAt: Date.now() + expireTime,
      analysisType: analysisType,
      size: this.estimateSize(result)
    };
    
    this.cache.set(key, cacheItem);
    this.accessOrder.set(key, Date.now());
    
    return key;
  }
  
  // 估算对象大小（字节）
  estimateSize(obj) {
    try {
      return JSON.stringify(obj).length * 2; // 粗略估算
    } catch (error) {
      return 1024; // 默认1KB
    }
  }
  
  // LRU淘汰策略
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, accessTime] of this.accessOrder) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }
  
  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, item] of this.cache) {
      if (now > item.expireAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      console.log(`[AnalysisCache] 清理了 ${expiredKeys.length} 个过期缓存项`);
    }
  }
  
  // 手动清除特定类型的缓存
  clearByType(analysisType) {
    const keysToDelete = [];
    
    for (const [key, item] of this.cache) {
      if (item.analysisType === analysisType) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
    
    return keysToDelete.length;
  }
  
  // 清空所有缓存
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    this.hitCount = 0;
    this.missCount = 0;
    return size;
  }
  
  // 获取缓存统计信息
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) : 0;
    
    let totalSize = 0;
    const typeStats = {};
    
    for (const [key, item] of this.cache) {
      totalSize += item.size;
      
      if (!typeStats[item.analysisType]) {
        typeStats[item.analysisType] = { count: 0, size: 0 };
      }
      
      typeStats[item.analysisType].count++;
      typeStats[item.analysisType].size += item.size;
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      typeStats: typeStats,
      memoryUsage: process.memoryUsage()
    };
  }
  
  // 预热缓存（可选）
  async warmup(commonInputs = []) {
    console.log('[AnalysisCache] 开始预热缓存...');
    
    for (const input of commonInputs) {
      try {
        // 这里可以预先计算一些常见的分析结果
        // 实际实现时需要调用相应的分析器
        console.log(`[AnalysisCache] 预热: ${input.type}`);
      } catch (error) {
        console.error(`[AnalysisCache] 预热失败: ${error.message}`);
      }
    }
    
    console.log('[AnalysisCache] 缓存预热完成');
  }
  
  // 销毁缓存实例
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

module.exports = AnalysisCache;