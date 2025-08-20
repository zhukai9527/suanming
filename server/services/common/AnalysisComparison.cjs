// 分析结果对比功能模块
// 实现历史分析数据的智能对比和趋势分析

class AnalysisComparison {
  constructor() {
    // 对比权重配置
    this.comparisonWeights = {
      bazi: {
        element_strength: 0.3,
        ten_gods: 0.25,
        dayun_analysis: 0.2,
        yearly_analysis: 0.15,
        personality_traits: 0.1
      },
      ziwei: {
        palace_strength: 0.3,
        star_brightness: 0.25,
        sihua_effects: 0.2,
        major_periods: 0.15,
        pattern_analysis: 0.1
      },
      yijing: {
        hexagram_meaning: 0.4,
        changing_lines: 0.3,
        element_interaction: 0.2,
        timing_analysis: 0.1
      }
    };
    
    // 趋势分析阈值
    this.trendThresholds = {
      significant_change: 0.3,
      moderate_change: 0.15,
      minor_change: 0.05
    };
  }
  
  // 对比两个分析结果
  compareAnalysisResults(currentAnalysis, historicalAnalysis, analysisType) {
    if (!currentAnalysis || !historicalAnalysis) {
      return {
        comparison_available: false,
        reason: '缺少对比数据'
      };
    }
    
    const comparisonResult = {
      comparison_available: true,
      analysis_type: analysisType,
      comparison_date: new Date().toISOString(),
      current_analysis_date: currentAnalysis.analysis_date,
      historical_analysis_date: historicalAnalysis.analysis_date,
      time_span: this.calculateTimeSpan(currentAnalysis.analysis_date, historicalAnalysis.analysis_date),
      overall_similarity: 0,
      detailed_comparison: {},
      key_changes: [],
      trend_analysis: {},
      recommendations: []
    };
    
    // 根据分析类型进行具体对比
    switch (analysisType) {
      case 'bazi':
        this.compareBaziAnalysis(currentAnalysis, historicalAnalysis, comparisonResult);
        break;
      case 'ziwei':
        this.compareZiweiAnalysis(currentAnalysis, historicalAnalysis, comparisonResult);
        break;
      case 'yijing':
        this.compareYijingAnalysis(currentAnalysis, historicalAnalysis, comparisonResult);
        break;
      default:
        comparisonResult.comparison_available = false;
        comparisonResult.reason = '不支持的分析类型';
    }
    
    return comparisonResult;
  }
  
  // 对比八字分析结果
  compareBaziAnalysis(current, historical, result) {
    const weights = this.comparisonWeights.bazi;
    let totalSimilarity = 0;
    
    // 五行强弱对比
    const elementComparison = this.compareElementStrength(
      current.basic_info?.bazi_chart?.element_strength,
      historical.basic_info?.bazi_chart?.element_strength
    );
    result.detailed_comparison.element_strength = elementComparison;
    totalSimilarity += elementComparison.similarity * weights.element_strength;
    
    // 十神关系对比
    const tenGodsComparison = this.compareTenGods(
      current.basic_info?.bazi_chart?.ten_gods,
      historical.basic_info?.bazi_chart?.ten_gods
    );
    result.detailed_comparison.ten_gods = tenGodsComparison;
    totalSimilarity += tenGodsComparison.similarity * weights.ten_gods;
    
    // 大运分析对比
    const dayunComparison = this.compareDayunAnalysis(
      current.detailed_analysis?.timing_analysis,
      historical.detailed_analysis?.timing_analysis
    );
    result.detailed_comparison.dayun_analysis = dayunComparison;
    totalSimilarity += dayunComparison.similarity * weights.dayun_analysis;
    
    // 流年分析对比
    const yearlyComparison = this.compareYearlyAnalysis(
      current.detailed_analysis?.yearly_fortune,
      historical.detailed_analysis?.yearly_fortune
    );
    result.detailed_comparison.yearly_analysis = yearlyComparison;
    totalSimilarity += yearlyComparison.similarity * weights.yearly_analysis;
    
    // 性格特质对比
    const personalityComparison = this.comparePersonalityTraits(
      current.detailed_analysis?.personality_analysis,
      historical.detailed_analysis?.personality_analysis
    );
    result.detailed_comparison.personality_traits = personalityComparison;
    totalSimilarity += personalityComparison.similarity * weights.personality_traits;
    
    result.overall_similarity = totalSimilarity;
    
    // 识别关键变化
    result.key_changes = this.identifyBaziKeyChanges(result.detailed_comparison);
    
    // 趋势分析
    result.trend_analysis = this.analyzeBaziTrends(result.detailed_comparison, result.time_span);
    
    // 生成建议
    result.recommendations = this.generateBaziRecommendations(result);
  }
  
  // 对比紫微斗数分析结果
  compareZiweiAnalysis(current, historical, result) {
    const weights = this.comparisonWeights.ziwei;
    let totalSimilarity = 0;
    
    // 宫位强度对比
    const palaceComparison = this.comparePalaceStrength(
      current.ziwei_analysis?.twelve_palaces,
      historical.ziwei_analysis?.twelve_palaces
    );
    result.detailed_comparison.palace_strength = palaceComparison;
    totalSimilarity += palaceComparison.similarity * weights.palace_strength;
    
    // 星曜亮度对比
    const brightnessComparison = this.compareStarBrightness(
      current.ziwei_analysis?.twelve_palaces,
      historical.ziwei_analysis?.twelve_palaces
    );
    result.detailed_comparison.star_brightness = brightnessComparison;
    totalSimilarity += brightnessComparison.similarity * weights.star_brightness;
    
    // 四化效应对比
    const sihuaComparison = this.compareSihuaEffects(
      current.ziwei_analysis?.si_hua,
      historical.ziwei_analysis?.si_hua
    );
    result.detailed_comparison.sihua_effects = sihuaComparison;
    totalSimilarity += sihuaComparison.similarity * weights.sihua_effects;
    
    // 大限分析对比
    const majorPeriodsComparison = this.compareMajorPeriods(
      current.ziwei_analysis?.major_periods,
      historical.ziwei_analysis?.major_periods
    );
    result.detailed_comparison.major_periods = majorPeriodsComparison;
    totalSimilarity += majorPeriodsComparison.similarity * weights.major_periods;
    
    // 格局分析对比
    const patternComparison = this.comparePatternAnalysis(
      current.detailed_analysis?.pattern_analysis,
      historical.detailed_analysis?.pattern_analysis
    );
    result.detailed_comparison.pattern_analysis = patternComparison;
    totalSimilarity += patternComparison.similarity * weights.pattern_analysis;
    
    result.overall_similarity = totalSimilarity;
    
    // 识别关键变化
    result.key_changes = this.identifyZiweiKeyChanges(result.detailed_comparison);
    
    // 趋势分析
    result.trend_analysis = this.analyzeZiweiTrends(result.detailed_comparison, result.time_span);
    
    // 生成建议
    result.recommendations = this.generateZiweiRecommendations(result);
  }
  
  // 对比易经分析结果
  compareYijingAnalysis(current, historical, result) {
    const weights = this.comparisonWeights.yijing;
    let totalSimilarity = 0;
    
    // 卦象含义对比
    const hexagramComparison = this.compareHexagramMeaning(
      current.yijing_analysis?.main_hexagram,
      historical.yijing_analysis?.main_hexagram
    );
    result.detailed_comparison.hexagram_meaning = hexagramComparison;
    totalSimilarity += hexagramComparison.similarity * weights.hexagram_meaning;
    
    // 变爻对比
    const changingLinesComparison = this.compareChangingLines(
      current.yijing_analysis?.changing_lines,
      historical.yijing_analysis?.changing_lines
    );
    result.detailed_comparison.changing_lines = changingLinesComparison;
    totalSimilarity += changingLinesComparison.similarity * weights.changing_lines;
    
    // 五行相互作用对比
    const elementInteractionComparison = this.compareElementInteraction(
      current.yijing_analysis?.element_analysis,
      historical.yijing_analysis?.element_analysis
    );
    result.detailed_comparison.element_interaction = elementInteractionComparison;
    totalSimilarity += elementInteractionComparison.similarity * weights.element_interaction;
    
    // 时机分析对比
    const timingComparison = this.compareTimingAnalysis(
      current.detailed_analysis?.timing_guidance,
      historical.detailed_analysis?.timing_guidance
    );
    result.detailed_comparison.timing_analysis = timingComparison;
    totalSimilarity += timingComparison.similarity * weights.timing_analysis;
    
    result.overall_similarity = totalSimilarity;
    
    // 识别关键变化
    result.key_changes = this.identifyYijingKeyChanges(result.detailed_comparison);
    
    // 趋势分析
    result.trend_analysis = this.analyzeYijingTrends(result.detailed_comparison, result.time_span);
    
    // 生成建议
    result.recommendations = this.generateYijingRecommendations(result);
  }
  
  // 对比五行强弱
  compareElementStrength(current, historical) {
    if (!current || !historical) {
      return { similarity: 0, changes: [], note: '缺少五行强弱数据' };
    }
    
    const elements = ['木', '火', '土', '金', '水'];
    let totalDifference = 0;
    const changes = [];
    
    elements.forEach(element => {
      const currentStrength = current.element_percentages?.[element] || 0;
      const historicalStrength = historical.element_percentages?.[element] || 0;
      const difference = Math.abs(currentStrength - historicalStrength);
      
      totalDifference += difference;
      
      if (difference > this.trendThresholds.minor_change * 100) {
        changes.push({
          element: element,
          current_strength: currentStrength,
          historical_strength: historicalStrength,
          change: currentStrength - historicalStrength,
          change_type: currentStrength > historicalStrength ? '增强' : '减弱'
        });
      }
    });
    
    const similarity = Math.max(0, 1 - totalDifference / 500); // 归一化到0-1
    
    return {
      similarity: similarity,
      changes: changes,
      average_change: totalDifference / elements.length,
      note: `五行强弱整体相似度：${(similarity * 100).toFixed(1)}%`
    };
  }
  
  // 对比十神关系
  compareTenGods(current, historical) {
    if (!current || !historical) {
      return { similarity: 0, changes: [], note: '缺少十神关系数据' };
    }
    
    const positions = ['year', 'month', 'day', 'hour'];
    let matchCount = 0;
    const changes = [];
    
    positions.forEach(position => {
      const currentGod = current[position];
      const historicalGod = historical[position];
      
      if (currentGod === historicalGod) {
        matchCount++;
      } else {
        changes.push({
          position: position,
          current: currentGod,
          historical: historicalGod,
          change_type: '十神变化'
        });
      }
    });
    
    const similarity = matchCount / positions.length;
    
    return {
      similarity: similarity,
      changes: changes,
      match_count: matchCount,
      note: `十神关系匹配度：${matchCount}/${positions.length}`
    };
  }
  
  // 对比宫位强度
  comparePalaceStrength(current, historical) {
    if (!current || !historical) {
      return { similarity: 0, changes: [], note: '缺少宫位强度数据' };
    }
    
    const palaces = Object.keys(current);
    let totalSimilarity = 0;
    const changes = [];
    
    palaces.forEach(palace => {
      const currentPalace = current[palace];
      const historicalPalace = historical[palace];
      
      if (currentPalace && historicalPalace) {
        const currentStrength = this.getStrengthValue(currentPalace.strength);
        const historicalStrength = this.getStrengthValue(historicalPalace.strength);
        const difference = Math.abs(currentStrength - historicalStrength);
        
        totalSimilarity += Math.max(0, 1 - difference / 4); // 强度等级0-4
        
        if (difference >= 1) {
          changes.push({
            palace: palace,
            current_strength: currentPalace.strength,
            historical_strength: historicalPalace.strength,
            change_type: currentStrength > historicalStrength ? '增强' : '减弱'
          });
        }
      }
    });
    
    const similarity = totalSimilarity / palaces.length;
    
    return {
      similarity: similarity,
      changes: changes,
      note: `宫位强度整体相似度：${(similarity * 100).toFixed(1)}%`
    };
  }
  
  // 获取强度数值
  getStrengthValue(strength) {
    const strengthMap = {
      '陷': 0,
      '不得地': 1,
      '平': 2,
      '得地': 3,
      '旺': 4
    };
    return strengthMap[strength] || 2;
  }
  
  // 计算时间跨度
  calculateTimeSpan(currentDate, historicalDate) {
    const current = new Date(currentDate);
    const historical = new Date(historicalDate);
    const diffTime = Math.abs(current - historical);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      months: Math.floor(diffDays / 30),
      years: Math.floor(diffDays / 365),
      description: this.formatTimeSpan(diffDays)
    };
  }
  
  // 格式化时间跨度
  formatTimeSpan(days) {
    if (days < 30) {
      return `${days}天`;
    } else if (days < 365) {
      return `${Math.floor(days / 30)}个月`;
    } else {
      return `${Math.floor(days / 365)}年${Math.floor((days % 365) / 30)}个月`;
    }
  }
  
  // 识别八字关键变化
  identifyBaziKeyChanges(detailedComparison) {
    const keyChanges = [];
    
    // 检查五行强弱的重大变化
    if (detailedComparison.element_strength?.changes) {
      detailedComparison.element_strength.changes.forEach(change => {
        if (Math.abs(change.change) > this.trendThresholds.significant_change * 100) {
          keyChanges.push({
            category: '五行强弱',
            description: `${change.element}行${change.change_type}${Math.abs(change.change).toFixed(1)}%`,
            impact: '重大',
            recommendation: `关注${change.element}行相关的人生领域`
          });
        }
      });
    }
    
    // 检查十神关系变化
    if (detailedComparison.ten_gods?.changes?.length > 0) {
      keyChanges.push({
        category: '十神关系',
        description: `${detailedComparison.ten_gods.changes.length}个柱位的十神发生变化`,
        impact: '中等',
        recommendation: '重新评估人际关系和事业发展策略'
      });
    }
    
    return keyChanges;
  }
  
  // 分析八字趋势
  analyzeBaziTrends(detailedComparison, timeSpan) {
    const trends = {
      overall_trend: '稳定',
      key_trends: [],
      prediction: ''
    };
    
    // 基于五行变化分析趋势
    if (detailedComparison.element_strength?.average_change > this.trendThresholds.significant_change * 100) {
      trends.overall_trend = '显著变化';
      trends.key_trends.push('五行格局正在发生重大调整');
    } else if (detailedComparison.element_strength?.average_change > this.trendThresholds.moderate_change * 100) {
      trends.overall_trend = '温和变化';
      trends.key_trends.push('五行格局呈现渐进式调整');
    }
    
    // 生成预测
    if (timeSpan.days < 365) {
      trends.prediction = '短期内运势格局相对稳定，建议保持现有策略';
    } else {
      trends.prediction = '长期趋势显示运势格局可能继续演变，建议适时调整人生规划';
    }
    
    return trends;
  }
  
  // 生成八字建议
  generateBaziRecommendations(comparisonResult) {
    const recommendations = [];
    
    // 基于整体相似度给出建议
    if (comparisonResult.overall_similarity > 0.8) {
      recommendations.push('分析结果高度一致，说明您的命理格局稳定，可以继续按既定方向发展');
    } else if (comparisonResult.overall_similarity > 0.6) {
      recommendations.push('分析结果存在一定变化，建议关注变化较大的领域，适当调整策略');
    } else {
      recommendations.push('分析结果变化较大，建议重新评估当前的人生规划和发展方向');
    }
    
    // 基于关键变化给出具体建议
    comparisonResult.key_changes.forEach(change => {
      recommendations.push(change.recommendation);
    });
    
    return recommendations;
  }
  
  // 批量对比分析结果
  batchCompareAnalysis(analysisHistory, analysisType) {
    if (!analysisHistory || analysisHistory.length < 2) {
      return {
        batch_comparison_available: false,
        reason: '历史数据不足，需要至少2次分析记录'
      };
    }
    
    const batchResult = {
      batch_comparison_available: true,
      analysis_type: analysisType,
      total_analyses: analysisHistory.length,
      time_range: {
        start: analysisHistory[analysisHistory.length - 1].analysis_date,
        end: analysisHistory[0].analysis_date
      },
      trend_summary: {},
      stability_analysis: {},
      recommendations: []
    };
    
    // 计算稳定性指标
    batchResult.stability_analysis = this.calculateStabilityMetrics(analysisHistory, analysisType);
    
    // 分析长期趋势
    batchResult.trend_summary = this.analyzeLongTermTrends(analysisHistory, analysisType);
    
    // 生成综合建议
    batchResult.recommendations = this.generateBatchRecommendations(batchResult);
    
    return batchResult;
  }
  
  // 计算稳定性指标
  calculateStabilityMetrics(analysisHistory, analysisType) {
    const similarities = [];
    
    for (let i = 0; i < analysisHistory.length - 1; i++) {
      const comparison = this.compareAnalysisResults(
        analysisHistory[i],
        analysisHistory[i + 1],
        analysisType
      );
      if (comparison.comparison_available) {
        similarities.push(comparison.overall_similarity);
      }
    }
    
    const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
    const variance = similarities.reduce((sum, sim) => sum + Math.pow(sim - averageSimilarity, 2), 0) / similarities.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      average_similarity: averageSimilarity,
      stability_score: Math.max(0, 1 - standardDeviation),
      variance: variance,
      stability_level: this.getStabilityLevel(averageSimilarity, standardDeviation)
    };
  }
  
  // 获取稳定性等级
  getStabilityLevel(averageSimilarity, standardDeviation) {
    if (averageSimilarity > 0.8 && standardDeviation < 0.1) {
      return '非常稳定';
    } else if (averageSimilarity > 0.6 && standardDeviation < 0.2) {
      return '较为稳定';
    } else if (averageSimilarity > 0.4 && standardDeviation < 0.3) {
      return '中等稳定';
    } else {
      return '不够稳定';
    }
  }
  
  // 分析长期趋势
  analyzeLongTermTrends(analysisHistory, analysisType) {
    // 简化的趋势分析，实际可以更复杂
    return {
      trend_direction: '稳定发展',
      key_patterns: ['命理格局基本稳定', '运势周期性变化正常'],
      future_outlook: '继续保持当前发展轨迹'
    };
  }
  
  // 生成批量对比建议
  generateBatchRecommendations(batchResult) {
    const recommendations = [];
    
    if (batchResult.stability_analysis.stability_level === '非常稳定') {
      recommendations.push('您的命理分析结果非常稳定，说明人生格局清晰，可以长期坚持当前策略');
    } else if (batchResult.stability_analysis.stability_level === '不够稳定') {
      recommendations.push('分析结果波动较大，建议深入了解变化原因，必要时寻求专业指导');
    }
    
    return recommendations;
  }
  
  // 其他对比方法的简化实现
  compareDayunAnalysis(current, historical) {
    return { similarity: 0.8, changes: [], note: '大运分析对比' };
  }
  
  compareYearlyAnalysis(current, historical) {
    return { similarity: 0.7, changes: [], note: '流年分析对比' };
  }
  
  comparePersonalityTraits(current, historical) {
    return { similarity: 0.9, changes: [], note: '性格特质对比' };
  }
  
  compareStarBrightness(current, historical) {
    return { similarity: 0.8, changes: [], note: '星曜亮度对比' };
  }
  
  compareSihuaEffects(current, historical) {
    return { similarity: 0.7, changes: [], note: '四化效应对比' };
  }
  
  compareMajorPeriods(current, historical) {
    return { similarity: 0.9, changes: [], note: '大限分析对比' };
  }
  
  comparePatternAnalysis(current, historical) {
    return { similarity: 0.8, changes: [], note: '格局分析对比' };
  }
  
  compareHexagramMeaning(current, historical) {
    return { similarity: 0.6, changes: [], note: '卦象含义对比' };
  }
  
  compareChangingLines(current, historical) {
    return { similarity: 0.5, changes: [], note: '变爻对比' };
  }
  
  compareElementInteraction(current, historical) {
    return { similarity: 0.7, changes: [], note: '五行相互作用对比' };
  }
  
  compareTimingAnalysis(current, historical) {
    return { similarity: 0.8, changes: [], note: '时机分析对比' };
  }
  
  identifyZiweiKeyChanges(detailedComparison) {
    return [];
  }
  
  identifyYijingKeyChanges(detailedComparison) {
    return [];
  }
  
  analyzeZiweiTrends(detailedComparison, timeSpan) {
    return { overall_trend: '稳定', key_trends: [], prediction: '' };
  }
  
  analyzeYijingTrends(detailedComparison, timeSpan) {
    return { overall_trend: '稳定', key_trends: [], prediction: '' };
  }
  
  generateZiweiRecommendations(comparisonResult) {
    return ['紫微斗数分析建议'];
  }
  
  generateYijingRecommendations(comparisonResult) {
    return ['易经分析建议'];
  }
}

module.exports = AnalysisComparison;