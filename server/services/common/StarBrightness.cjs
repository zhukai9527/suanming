// 紫微斗数星曜亮度计算系统
// 实现庙旺利陷的精确计算，提升分析精确度

class StarBrightness {
  constructor() {
    // 十四主星庙旺利陷表
    this.starBrightnessTable = {
      '紫微': {
        '子': '旺', '丑': '得', '寅': '旺', '卯': '得', '辰': '旺', '巳': '得',
        '午': '庙', '未': '得', '申': '旺', '酉': '得', '戌': '旺', '亥': '得'
      },
      '天机': {
        '子': '旺', '丑': '利', '寅': '庙', '卯': '旺', '辰': '利', '巳': '陷',
        '午': '陷', '未': '利', '申': '陷', '酉': '利', '戌': '利', '亥': '旺'
      },
      '太阳': {
        '子': '陷', '丑': '利', '寅': '旺', '卯': '庙', '辰': '旺', '巳': '庙',
        '午': '庙', '未': '旺', '申': '利', '酉': '陷', '戌': '利', '亥': '陷'
      },
      '武曲': {
        '子': '得', '丑': '庙', '寅': '得', '卯': '陷', '辰': '得', '巳': '利',
        '午': '陷', '未': '利', '申': '旺', '酉': '庙', '戌': '得', '亥': '得'
      },
      '天同': {
        '子': '庙', '丑': '得', '寅': '得', '卯': '旺', '辰': '得', '巳': '利',
        '午': '陷', '未': '利', '申': '得', '酉': '得', '戌': '得', '亥': '旺'
      },
      '廉贞': {
        '子': '利', '丑': '得', '寅': '旺', '卯': '庙', '辰': '旺', '巳': '庙',
        '午': '得', '未': '得', '申': '利', '酉': '陷', '戌': '利', '亥': '得'
      },
      '天府': {
        '子': '得', '丑': '庙', '寅': '得', '卯': '得', '辰': '庙', '巳': '得',
        '午': '得', '未': '庙', '申': '得', '酉': '得', '戌': '庙', '亥': '得'
      },
      '太阴': {
        '子': '庙', '丑': '旺', '寅': '利', '卯': '陷', '辰': '利', '巳': '陷',
        '午': '陷', '未': '利', '申': '利', '酉': '旺', '戌': '旺', '亥': '庙'
      },
      '贪狼': {
        '子': '利', '丑': '得', '寅': '旺', '卯': '庙', '辰': '得', '巳': '利',
        '午': '利', '未': '得', '申': '利', '酉': '得', '戌': '得', '亥': '旺'
      },
      '巨门': {
        '子': '旺', '丑': '得', '寅': '利', '卯': '陷', '辰': '利', '巳': '庙',
        '午': '旺', '未': '庙', '申': '利', '酉': '得', '戌': '得', '亥': '利'
      },
      '天相': {
        '子': '得', '丑': '庙', '寅': '得', '卯': '得', '辰': '庙', '巳': '得',
        '午': '得', '未': '庙', '申': '得', '酉': '得', '戌': '庙', '亥': '得'
      },
      '天梁': {
        '子': '得', '丑': '庙', '寅': '旺', '卯': '庙', '辰': '旺', '巳': '得',
        '午': '利', '未': '得', '申': '利', '酉': '得', '戌': '得', '亥': '旺'
      },
      '七杀': {
        '子': '旺', '丑': '得', '寅': '利', '卯': '陷', '辰': '利', '巳': '得',
        '午': '庙', '未': '得', '申': '庙', '酉': '旺', '戌': '得', '亥': '利'
      },
      '破军': {
        '子': '庙', '丑': '得', '寅': '得', '卯': '旺', '辰': '得', '巳': '利',
        '午': '陷', '未': '利', '申': '得', '酉': '得', '戌': '得', '亥': '旺'
      }
    };
    
    // 六吉星庙旺利陷表
    this.luckyStarBrightnessTable = {
      '文昌': {
        '子': '得', '丑': '庙', '寅': '得', '卯': '得', '辰': '庙', '巳': '得',
        '午': '得', '未': '庙', '申': '得', '酉': '得', '戌': '庙', '亥': '得'
      },
      '文曲': {
        '子': '庙', '丑': '得', '寅': '得', '卯': '庙', '辰': '得', '巳': '得',
        '午': '庙', '未': '得', '申': '得', '酉': '庙', '戌': '得', '亥': '得'
      },
      '左辅': {
        '子': '庙', '丑': '庙', '寅': '庙', '卯': '庙', '辰': '庙', '巳': '庙',
        '午': '庙', '未': '庙', '申': '庙', '酉': '庙', '戌': '庙', '亥': '庙'
      },
      '右弼': {
        '子': '庙', '丑': '庙', '寅': '庙', '卯': '庙', '辰': '庙', '巳': '庙',
        '午': '庙', '未': '庙', '申': '庙', '酉': '庙', '戌': '庙', '亥': '庙'
      },
      '天魁': {
        '子': '庙', '丑': '庙', '寅': '庙', '卯': '庙', '辰': '庙', '巳': '庙',
        '午': '庙', '未': '庙', '申': '庙', '酉': '庙', '戌': '庙', '亥': '庙'
      },
      '天钺': {
        '子': '庙', '丑': '庙', '寅': '庙', '卯': '庙', '辰': '庙', '巳': '庙',
        '午': '庙', '未': '庙', '申': '庙', '酉': '庙', '戌': '庙', '亥': '庙'
      }
    };
    
    // 六煞星庙旺利陷表
    this.unluckyStarBrightnessTable = {
      '擎羊': {
        '子': '陷', '丑': '利', '寅': '得', '卯': '旺', '辰': '得', '巳': '利',
        '午': '庙', '未': '旺', '申': '得', '酉': '利', '戌': '得', '亥': '陷'
      },
      '陀罗': {
        '子': '陷', '丑': '得', '寅': '利', '卯': '得', '辰': '旺', '巳': '庙',
        '午': '利', '未': '得', '申': '旺', '酉': '庙', '戌': '利', '亥': '陷'
      },
      '火星': {
        '子': '陷', '丑': '利', '寅': '庙', '卯': '旺', '辰': '利', '巳': '得',
        '午': '得', '未': '利', '申': '得', '酉': '利', '戌': '旺', '亥': '陷'
      },
      '铃星': {
        '子': '陷', '丑': '得', '寅': '利', '卯': '得', '辰': '旺', '巳': '庙',
        '午': '利', '未': '得', '申': '旺', '酉': '得', '戌': '利', '亥': '陷'
      },
      '地空': {
        '子': '陷', '丑': '陷', '寅': '陷', '卯': '陷', '辰': '陷', '巳': '陷',
        '午': '陷', '未': '陷', '申': '陷', '酉': '陷', '戌': '陷', '亥': '陷'
      },
      '地劫': {
        '子': '陷', '丑': '陷', '寅': '陷', '卯': '陷', '辰': '陷', '巳': '陷',
        '午': '陷', '未': '陷', '申': '陷', '酉': '陷', '戌': '陷', '亥': '陷'
      }
    };
    
    // 亮度等级数值映射
    this.brightnessScore = {
      '庙': 5,
      '旺': 4,
      '得': 3,
      '利': 2,
      '陷': 1
    };
    
    // 亮度描述
    this.brightnessDescription = {
      '庙': '庙旺，星曜力量最强，发挥最佳',
      '旺': '旺相，星曜力量强盛，表现良好',
      '得': '得地，星曜力量中等，表现平稳',
      '利': '利益，星曜力量较弱，需要扶助',
      '陷': '陷落，星曜力量最弱，表现不佳'
    };
  }
  
  // 获取星曜亮度
  getStarBrightness(starName, position) {
    let brightness = '得'; // 默认亮度
    
    if (this.starBrightnessTable[starName]) {
      brightness = this.starBrightnessTable[starName][position] || '得';
    } else if (this.luckyStarBrightnessTable[starName]) {
      brightness = this.luckyStarBrightnessTable[starName][position] || '得';
    } else if (this.unluckyStarBrightnessTable[starName]) {
      brightness = this.unluckyStarBrightnessTable[starName][position] || '得';
    }
    
    return {
      level: brightness,
      score: this.brightnessScore[brightness],
      description: this.brightnessDescription[brightness]
    };
  }
  
  // 计算宫位整体星曜亮度
  calculatePalaceBrightness(stars, position) {
    if (!stars || stars.length === 0) {
      return {
        averageScore: 3,
        totalScore: 0,
        starCount: 0,
        level: '得',
        description: '无主要星曜'
      };
    }
    
    let totalScore = 0;
    const starBrightness = [];
    
    stars.forEach(star => {
      const brightness = this.getStarBrightness(star, position);
      totalScore += brightness.score;
      starBrightness.push({
        star: star,
        brightness: brightness
      });
    });
    
    const averageScore = totalScore / stars.length;
    const level = this.getAverageBrightnessLevel(averageScore);
    
    return {
      averageScore: averageScore,
      totalScore: totalScore,
      starCount: stars.length,
      level: level,
      description: this.brightnessDescription[level],
      starDetails: starBrightness
    };
  }
  
  // 根据平均分数获取亮度等级
  getAverageBrightnessLevel(averageScore) {
    if (averageScore >= 4.5) return '庙';
    if (averageScore >= 3.5) return '旺';
    if (averageScore >= 2.5) return '得';
    if (averageScore >= 1.5) return '利';
    return '陷';
  }
  
  // 分析星曜组合效果
  analyzeStarCombination(stars, position) {
    const brightness = this.calculatePalaceBrightness(stars, position);
    const mainStars = stars.filter(star => this.starBrightnessTable[star]);
    const luckyStars = stars.filter(star => this.luckyStarBrightnessTable[star]);
    const unluckyStars = stars.filter(star => this.unluckyStarBrightnessTable[star]);
    
    let combinationEffect = '中性';
    let effectDescription = '';
    
    // 分析组合效果
    if (luckyStars.length > unluckyStars.length && brightness.averageScore >= 3.5) {
      combinationEffect = '吉利';
      effectDescription = '吉星较多，星曜亮度良好，整体表现积极';
    } else if (unluckyStars.length > luckyStars.length || brightness.averageScore < 2.5) {
      combinationEffect = '不利';
      effectDescription = '煞星较多或星曜亮度不佳，需要注意调节';
    } else {
      effectDescription = '星曜组合平衡，表现中等';
    }
    
    return {
      ...brightness,
      mainStarCount: mainStars.length,
      luckyStarCount: luckyStars.length,
      unluckyStarCount: unluckyStars.length,
      combinationEffect: combinationEffect,
      effectDescription: effectDescription,
      recommendations: this.generateBrightnessRecommendations(brightness, combinationEffect)
    };
  }
  
  // 生成亮度建议
  generateBrightnessRecommendations(brightness, effect) {
    const recommendations = [];
    
    if (brightness.level === '庙' || brightness.level === '旺') {
      recommendations.push('星曜亮度良好，可充分发挥其正面特质');
      recommendations.push('适合在相关领域积极发展');
    } else if (brightness.level === '陷' || brightness.level === '利') {
      recommendations.push('星曜亮度不佳，需要其他吉星扶助');
      recommendations.push('避免在不利时期做重大决定');
      recommendations.push('可通过风水调理或行善积德来改善');
    }
    
    if (effect === '不利') {
      recommendations.push('注意煞星的负面影响');
      recommendations.push('保持谨慎态度，稳健行事');
    } else if (effect === '吉利') {
      recommendations.push('把握吉星带来的机遇');
      recommendations.push('可适当积极进取');
    }
    
    return recommendations;
  }
}

module.exports = StarBrightness;