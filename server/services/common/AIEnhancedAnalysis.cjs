// AI增强分析模块
// 使用机器学习模型优化个性化推荐和分析准确度

class AIEnhancedAnalysis {
  constructor() {
    // 用户行为权重配置
    this.behaviorWeights = {
      analysis_frequency: 0.2,    // 分析频率
      preferred_types: 0.25,      // 偏好类型
      interaction_depth: 0.2,     // 交互深度
      feedback_quality: 0.15,     // 反馈质量
      time_patterns: 0.1,         // 时间模式
      question_complexity: 0.1    // 问题复杂度
    };
    
    // 个性化特征向量
    this.userFeatures = new Map();
    
    // 分析准确度模型参数
    this.accuracyModel = {
      baseAccuracy: 0.75,
      personalizedBoost: 0.15,
      contextualBoost: 0.1
    };
    
    // 推荐系统配置
    this.recommendationConfig = {
      maxRecommendations: 5,
      diversityThreshold: 0.3,
      relevanceThreshold: 0.6,
      noveltyWeight: 0.2
    };
    
    // 学习模型状态
    this.modelState = {
      trainingData: [],
      modelVersion: '1.0',
      lastTraining: null,
      accuracy: 0.75
    };
  }
  
  // 分析用户行为模式
  analyzeUserBehavior(userId, analysisHistory, interactionData) {
    const behaviorProfile = {
      userId: userId,
      analysis_frequency: this.calculateAnalysisFrequency(analysisHistory),
      preferred_types: this.identifyPreferredTypes(analysisHistory),
      interaction_depth: this.measureInteractionDepth(interactionData),
      feedback_quality: this.assessFeedbackQuality(interactionData),
      time_patterns: this.analyzeTimePatterns(analysisHistory),
      question_complexity: this.analyzeQuestionComplexity(analysisHistory),
      personality_traits: this.inferPersonalityTraits(analysisHistory, interactionData),
      learning_style: this.identifyLearningStyle(interactionData),
      engagement_level: this.calculateEngagementLevel(interactionData)
    };
    
    // 更新用户特征向量
    this.updateUserFeatures(userId, behaviorProfile);
    
    return behaviorProfile;
  }
  
  // 计算分析频率
  calculateAnalysisFrequency(analysisHistory) {
    if (!analysisHistory || analysisHistory.length === 0) {
      return { frequency: 0, pattern: 'inactive' };
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentAnalyses = analysisHistory.filter(analysis => 
      new Date(analysis.created_at) > thirtyDaysAgo
    );
    
    const frequency = recentAnalyses.length / 30; // 每天平均次数
    
    let pattern = 'low';
    if (frequency > 1) pattern = 'high';
    else if (frequency > 0.3) pattern = 'moderate';
    else if (frequency > 0.1) pattern = 'occasional';
    
    return {
      frequency: frequency,
      pattern: pattern,
      total_analyses: analysisHistory.length,
      recent_analyses: recentAnalyses.length
    };
  }
  
  // 识别偏好类型
  identifyPreferredTypes(analysisHistory) {
    const typeCounts = {};
    const typePreferences = {};
    
    analysisHistory.forEach(analysis => {
      const type = analysis.reading_type || analysis.analysis_type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    const totalAnalyses = analysisHistory.length;
    Object.keys(typeCounts).forEach(type => {
      typePreferences[type] = typeCounts[type] / totalAnalyses;
    });
    
    // 找出主要偏好
    const sortedPreferences = Object.entries(typePreferences)
      .sort(([,a], [,b]) => b - a);
    
    return {
      preferences: typePreferences,
      primary_type: sortedPreferences[0]?.[0] || 'bazi',
      diversity_score: this.calculateDiversityScore(typePreferences),
      specialization_level: sortedPreferences[0]?.[1] || 0
    };
  }
  
  // 测量交互深度
  measureInteractionDepth(interactionData) {
    if (!interactionData) {
      return { depth: 0, engagement: 'low' };
    }
    
    const metrics = {
      session_duration: interactionData.averageSessionDuration || 0,
      pages_per_session: interactionData.averagePagesPerSession || 1,
      return_visits: interactionData.returnVisits || 0,
      feature_usage: interactionData.featureUsage || {},
      scroll_depth: interactionData.averageScrollDepth || 0.5
    };
    
    // 计算综合深度分数
    const depthScore = (
      Math.min(metrics.session_duration / 300, 1) * 0.3 +  // 5分钟为满分
      Math.min(metrics.pages_per_session / 5, 1) * 0.2 +   // 5页为满分
      Math.min(metrics.return_visits / 10, 1) * 0.2 +      // 10次回访为满分
      metrics.scroll_depth * 0.2 +                         // 滚动深度
      Math.min(Object.keys(metrics.feature_usage).length / 10, 1) * 0.1  // 功能使用多样性
    );
    
    let engagement = 'low';
    if (depthScore > 0.7) engagement = 'high';
    else if (depthScore > 0.4) engagement = 'moderate';
    
    return {
      depth: depthScore,
      engagement: engagement,
      metrics: metrics
    };
  }
  
  // 评估反馈质量
  assessFeedbackQuality(interactionData) {
    const feedback = interactionData?.feedback || [];
    
    if (feedback.length === 0) {
      return { quality: 0, engagement: 'none' };
    }
    
    let totalQuality = 0;
    let detailedFeedbackCount = 0;
    
    feedback.forEach(item => {
      if (item.rating) {
        totalQuality += item.rating / 5; // 归一化到0-1
      }
      if (item.comment && item.comment.length > 20) {
        detailedFeedbackCount++;
      }
    });
    
    const averageRating = totalQuality / feedback.length;
    const detailRatio = detailedFeedbackCount / feedback.length;
    
    const qualityScore = averageRating * 0.7 + detailRatio * 0.3;
    
    return {
      quality: qualityScore,
      average_rating: averageRating,
      detail_ratio: detailRatio,
      feedback_count: feedback.length,
      engagement: qualityScore > 0.6 ? 'high' : qualityScore > 0.3 ? 'moderate' : 'low'
    };
  }
  
  // 分析时间模式
  analyzeTimePatterns(analysisHistory) {
    const hourCounts = new Array(24).fill(0);
    const dayOfWeekCounts = new Array(7).fill(0);
    
    analysisHistory.forEach(analysis => {
      const date = new Date(analysis.created_at);
      hourCounts[date.getHours()]++;
      dayOfWeekCounts[date.getDay()]++;
    });
    
    // 找出最活跃的时间段
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
    
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    return {
      peak_hour: peakHour,
      peak_day: peakDay,
      peak_day_name: dayNames[peakDay],
      hour_distribution: hourCounts,
      day_distribution: dayOfWeekCounts,
      activity_pattern: this.classifyActivityPattern(hourCounts, dayOfWeekCounts)
    };
  }
  
  // 分析问题复杂度
  analyzeQuestionComplexity(analysisHistory) {
    let totalComplexity = 0;
    let questionCount = 0;
    
    analysisHistory.forEach(analysis => {
      if (analysis.question) {
        const complexity = this.calculateQuestionComplexity(analysis.question);
        totalComplexity += complexity;
        questionCount++;
      }
    });
    
    const averageComplexity = questionCount > 0 ? totalComplexity / questionCount : 0.5;
    
    return {
      average_complexity: averageComplexity,
      complexity_level: averageComplexity > 0.7 ? 'high' : averageComplexity > 0.4 ? 'moderate' : 'low',
      question_count: questionCount
    };
  }
  
  // 推断性格特质
  inferPersonalityTraits(analysisHistory, interactionData) {
    const traits = {
      curiosity: 0,      // 好奇心
      patience: 0,       // 耐心
      detail_oriented: 0, // 细节导向
      intuitive: 0,      // 直觉性
      analytical: 0      // 分析性
    };
    
    // 基于分析频率推断好奇心
    const frequency = this.calculateAnalysisFrequency(analysisHistory);
    traits.curiosity = Math.min(frequency.frequency * 2, 1);
    
    // 基于交互深度推断耐心和细节导向
    const interaction = this.measureInteractionDepth(interactionData);
    traits.patience = interaction.depth;
    traits.detail_oriented = interaction.metrics.scroll_depth || 0.5;
    
    // 基于偏好类型推断直觉性和分析性
    const preferences = this.identifyPreferredTypes(analysisHistory);
    if (preferences.primary_type === 'yijing') {
      traits.intuitive = 0.8;
      traits.analytical = 0.4;
    } else if (preferences.primary_type === 'bazi') {
      traits.analytical = 0.8;
      traits.intuitive = 0.3;
    } else {
      traits.analytical = 0.6;
      traits.intuitive = 0.6;
    }
    
    return traits;
  }
  
  // 识别学习风格
  identifyLearningStyle(interactionData) {
    const styles = {
      visual: 0,      // 视觉型
      textual: 0,     // 文本型
      interactive: 0, // 互动型
      systematic: 0   // 系统型
    };
    
    // 基于功能使用模式推断学习风格
    const featureUsage = interactionData?.featureUsage || {};
    
    if (featureUsage.charts > featureUsage.text) {
      styles.visual = 0.8;
    } else {
      styles.textual = 0.8;
    }
    
    if (featureUsage.comparisons || featureUsage.trends) {
      styles.interactive = 0.7;
    }
    
    if (featureUsage.detailed_analysis > featureUsage.summary) {
      styles.systematic = 0.8;
    }
    
    // 找出主导学习风格
    const dominantStyle = Object.entries(styles)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return {
      styles: styles,
      dominant_style: dominantStyle,
      learning_preference: this.describeLearningPreference(dominantStyle)
    };
  }
  
  // 生成个性化推荐
  generatePersonalizedRecommendations(userId, currentAnalysis, behaviorProfile) {
    const recommendations = [];
    
    // 基于用户偏好推荐
    const preferenceRecommendations = this.generatePreferenceBasedRecommendations(
      behaviorProfile.preferred_types,
      currentAnalysis
    );
    recommendations.push(...preferenceRecommendations);
    
    // 基于学习风格推荐
    const learningStyleRecommendations = this.generateLearningStyleRecommendations(
      behaviorProfile.learning_style,
      currentAnalysis
    );
    recommendations.push(...learningStyleRecommendations);
    
    // 基于时间模式推荐
    const timingRecommendations = this.generateTimingRecommendations(
      behaviorProfile.time_patterns,
      currentAnalysis
    );
    recommendations.push(...timingRecommendations);
    
    // 基于性格特质推荐
    const personalityRecommendations = this.generatePersonalityBasedRecommendations(
      behaviorProfile.personality_traits,
      currentAnalysis
    );
    recommendations.push(...personalityRecommendations);
    
    // 排序和过滤推荐
    const filteredRecommendations = this.filterAndRankRecommendations(
      recommendations,
      behaviorProfile
    );
    
    return {
      recommendations: filteredRecommendations.slice(0, this.recommendationConfig.maxRecommendations),
      personalization_score: this.calculatePersonalizationScore(behaviorProfile),
      recommendation_confidence: this.calculateRecommendationConfidence(filteredRecommendations),
      user_segment: this.classifyUserSegment(behaviorProfile)
    };
  }
  
  // 优化分析准确度
  optimizeAnalysisAccuracy(analysisResult, userContext, historicalFeedback) {
    const baseAccuracy = this.accuracyModel.baseAccuracy;
    
    // 个性化调整
    const personalizedAdjustment = this.calculatePersonalizedAdjustment(
      analysisResult,
      userContext
    );
    
    // 上下文调整
    const contextualAdjustment = this.calculateContextualAdjustment(
      analysisResult,
      userContext.currentSituation
    );
    
    // 历史反馈调整
    const feedbackAdjustment = this.calculateFeedbackAdjustment(
      analysisResult,
      historicalFeedback
    );
    
    const optimizedAccuracy = Math.min(
      baseAccuracy + personalizedAdjustment + contextualAdjustment + feedbackAdjustment,
      1.0
    );
    
    // 生成置信度区间
    const confidenceInterval = this.calculateConfidenceInterval(
      optimizedAccuracy,
      userContext.dataQuality
    );
    
    return {
      base_accuracy: baseAccuracy,
      optimized_accuracy: optimizedAccuracy,
      confidence_interval: confidenceInterval,
      adjustment_factors: {
        personalized: personalizedAdjustment,
        contextual: contextualAdjustment,
        feedback: feedbackAdjustment
      },
      reliability_score: this.calculateReliabilityScore(analysisResult, userContext)
    };
  }
  
  // 机器学习模型训练
  trainModel(trainingData) {
    // 简化的模型训练逻辑
    this.modelState.trainingData = trainingData;
    this.modelState.lastTraining = new Date().toISOString();
    
    // 计算模型准确度
    const accuracy = this.evaluateModelAccuracy(trainingData);
    this.modelState.accuracy = accuracy;
    
    // 更新模型版本
    const version = parseFloat(this.modelState.modelVersion) + 0.1;
    this.modelState.modelVersion = version.toFixed(1);
    
    return {
      model_version: this.modelState.modelVersion,
      accuracy: accuracy,
      training_samples: trainingData.length,
      training_date: this.modelState.lastTraining,
      improvement: accuracy - this.accuracyModel.baseAccuracy
    };
  }
  
  // 预测用户行为
  predictUserBehavior(userId, currentContext) {
    const userFeatures = this.userFeatures.get(userId);
    if (!userFeatures) {
      return {
        prediction_available: false,
        reason: '用户数据不足'
      };
    }
    
    const predictions = {
      next_analysis_type: this.predictNextAnalysisType(userFeatures),
      engagement_probability: this.predictEngagementProbability(userFeatures),
      churn_risk: this.predictChurnRisk(userFeatures),
      optimal_timing: this.predictOptimalTiming(userFeatures),
      content_preferences: this.predictContentPreferences(userFeatures)
    };
    
    return {
      prediction_available: true,
      predictions: predictions,
      confidence_score: this.calculatePredictionConfidence(userFeatures),
      model_version: this.modelState.modelVersion
    };
  }
  
  // 辅助方法实现
  calculateDiversityScore(preferences) {
    const values = Object.values(preferences);
    const entropy = values.reduce((sum, p) => {
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0);
    return entropy / Math.log2(values.length); // 归一化
  }
  
  classifyActivityPattern(hourCounts, dayOfWeekCounts) {
    const workdaySum = dayOfWeekCounts.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekendSum = dayOfWeekCounts[0] + dayOfWeekCounts[6];
    
    if (workdaySum > weekendSum * 2) {
      return 'workday_focused';
    } else if (weekendSum > workdaySum) {
      return 'weekend_focused';
    } else {
      return 'balanced';
    }
  }
  
  calculateQuestionComplexity(question) {
    const length = question.length;
    const wordCount = question.split(' ').length;
    const questionMarks = (question.match(/[？?]/g) || []).length;
    const keywords = ['为什么', '如何', '什么时候', '怎么样', '是否'].filter(kw => question.includes(kw)).length;
    
    const complexity = (
      Math.min(length / 100, 1) * 0.3 +
      Math.min(wordCount / 20, 1) * 0.3 +
      Math.min(questionMarks / 3, 1) * 0.2 +
      Math.min(keywords / 3, 1) * 0.2
    );
    
    return complexity;
  }
  
  describeLearningPreference(dominantStyle) {
    const descriptions = {
      visual: '偏好图表和可视化内容，通过视觉元素更好地理解信息',
      textual: '偏好详细的文字说明，喜欢深入阅读分析内容',
      interactive: '喜欢互动功能，通过对比和探索来学习',
      systematic: '偏好系统性的详细分析，按步骤深入了解'
    };
    return descriptions[dominantStyle] || '学习风格均衡';
  }
  
  // 其他辅助方法的简化实现
  generatePreferenceBasedRecommendations(preferences, currentAnalysis) {
    return [{
      type: 'preference',
      title: '基于您的偏好推荐',
      description: `根据您对${preferences.primary_type}的偏好，推荐相关深度分析`,
      relevance: 0.8
    }];
  }
  
  generateLearningStyleRecommendations(learningStyle, currentAnalysis) {
    return [{
      type: 'learning_style',
      title: '学习风格匹配推荐',
      description: `基于您的${learningStyle.dominant_style}学习风格定制内容`,
      relevance: 0.7
    }];
  }
  
  generateTimingRecommendations(timePatterns, currentAnalysis) {
    return [{
      type: 'timing',
      title: '最佳时机建议',
      description: `根据您的活跃时间模式，建议在${timePatterns.peak_hour}点进行分析`,
      relevance: 0.6
    }];
  }
  
  generatePersonalityBasedRecommendations(traits, currentAnalysis) {
    return [{
      type: 'personality',
      title: '性格特质匹配',
      description: '基于您的性格特质提供个性化建议',
      relevance: 0.75
    }];
  }
  
  filterAndRankRecommendations(recommendations, behaviorProfile) {
    return recommendations
      .filter(rec => rec.relevance > this.recommendationConfig.relevanceThreshold)
      .sort((a, b) => b.relevance - a.relevance);
  }
  
  calculatePersonalizationScore(behaviorProfile) {
    return 0.8; // 简化实现
  }
  
  calculateRecommendationConfidence(recommendations) {
    return recommendations.length > 0 ? 0.75 : 0.5;
  }
  
  classifyUserSegment(behaviorProfile) {
    if (behaviorProfile.engagement_level > 0.7) {
      return 'power_user';
    } else if (behaviorProfile.engagement_level > 0.4) {
      return 'regular_user';
    } else {
      return 'casual_user';
    }
  }
  
  calculatePersonalizedAdjustment(analysisResult, userContext) {
    return 0.05; // 简化实现
  }
  
  calculateContextualAdjustment(analysisResult, currentSituation) {
    return 0.03; // 简化实现
  }
  
  calculateFeedbackAdjustment(analysisResult, historicalFeedback) {
    return 0.02; // 简化实现
  }
  
  calculateConfidenceInterval(accuracy, dataQuality) {
    const margin = (1 - dataQuality) * 0.1;
    return {
      lower: Math.max(accuracy - margin, 0),
      upper: Math.min(accuracy + margin, 1)
    };
  }
  
  calculateReliabilityScore(analysisResult, userContext) {
    return 0.8; // 简化实现
  }
  
  evaluateModelAccuracy(trainingData) {
    return 0.82; // 简化实现
  }
  
  predictNextAnalysisType(userFeatures) {
    return userFeatures.preferred_types?.primary_type || 'bazi';
  }
  
  predictEngagementProbability(userFeatures) {
    return 0.7; // 简化实现
  }
  
  predictChurnRisk(userFeatures) {
    return 0.2; // 简化实现
  }
  
  predictOptimalTiming(userFeatures) {
    return {
      hour: userFeatures.time_patterns?.peak_hour || 14,
      day: userFeatures.time_patterns?.peak_day_name || '周三'
    };
  }
  
  predictContentPreferences(userFeatures) {
    return {
      detail_level: 'high',
      format: 'mixed',
      topics: ['career', 'relationships']
    };
  }
  
  calculatePredictionConfidence(userFeatures) {
    return 0.75; // 简化实现
  }
  
  calculateEngagementLevel(interactionData) {
    return 0.6; // 简化实现
  }
  
  updateUserFeatures(userId, behaviorProfile) {
    this.userFeatures.set(userId, behaviorProfile);
  }
}

module.exports = AIEnhancedAnalysis;