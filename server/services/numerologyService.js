import { dbOperations } from '../database.js';

// 天干地支数据
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 五行属性
const WUXING_MAP = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

// 紫微斗数星曜
const ZIWEI_STARS = {
  main: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'],
  lucky: ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存', '天马'],
  unlucky: ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']
};

// 易经六十四卦
const HEXAGRAMS = [
  { name: '乾为天', symbol: '☰☰', description: '刚健中正，自强不息' },
  { name: '坤为地', symbol: '☷☷', description: '厚德载物，包容万象' },
  { name: '水雷屯', symbol: '☵☳', description: '万物始生，艰难创业' },
  { name: '山水蒙', symbol: '☶☵', description: '启蒙教育，循序渐进' },
  // ... 更多卦象可以根据需要添加
];

export const numerologyService = {
  /**
   * 八字命理分析
   */
  async analyzeBazi(userId, birthData) {
    const { name, birthDate, birthTime, gender, birthPlace } = birthData;
    
    try {
      // 计算八字
      const bazi = this.calculateBazi(birthDate, birthTime);
      
      // 五行分析
      const wuxing = this.analyzeWuxing(bazi);
      
      // 生成分析结果
      const analysis = this.generateBaziAnalysis(bazi, wuxing, gender);
      
      // 保存分析记录
      const result = dbOperations.createReading.run(
        userId,
        'bazi',
        name,
        birthDate,
        birthTime,
        gender,
        birthPlace,
        JSON.stringify(birthData),
        JSON.stringify({ bazi, wuxing }),
        JSON.stringify(analysis)
      );
      
      return {
        recordId: result.lastInsertRowid,
        analysis: {
          bazi,
          wuxing,
          analysis
        }
      };
    } catch (error) {
      throw new Error(`八字分析失败: ${error.message}`);
    }
  },
  
  /**
   * 紫微斗数分析
   */
  async analyzeZiwei(userId, birthData) {
    const { name, birthDate, birthTime, gender, birthPlace } = birthData;
    
    try {
      // 计算紫微斗数
      const ziwei = this.calculateZiwei(birthDate, birthTime, gender);
      
      // 生成分析结果
      const analysis = this.generateZiweiAnalysis(ziwei, gender);
      
      // 保存分析记录
      const result = dbOperations.createReading.run(
        userId,
        'ziwei',
        name,
        birthDate,
        birthTime,
        gender,
        birthPlace,
        JSON.stringify(birthData),
        JSON.stringify({ ziwei }),
        JSON.stringify(analysis)
      );
      
      return {
        recordId: result.lastInsertRowid,
        analysis: {
          ziwei,
          analysis
        }
      };
    } catch (error) {
      throw new Error(`紫微斗数分析失败: ${error.message}`);
    }
  },
  
  /**
   * 易经占卜分析
   */
  async analyzeYijing(userId, divinationData) {
    const { question, method } = divinationData;
    
    try {
      // 生成卦象
      const hexagram = this.generateHexagram();
      
      // 生成分析结果
      const analysis = this.generateYijingAnalysis(hexagram, question);
      
      // 保存分析记录
      const result = dbOperations.createReading.run(
        userId,
        'yijing',
        null,
        null,
        null,
        null,
        null,
        JSON.stringify(divinationData),
        JSON.stringify({ hexagram }),
        JSON.stringify(analysis)
      );
      
      return {
        recordId: result.lastInsertRowid,
        analysis
      };
    } catch (error) {
      throw new Error(`易经占卜分析失败: ${error.message}`);
    }
  },
  
  /**
   * 五行分析
   */
  async analyzeWuxing(userId, birthData) {
    const { name, birthDate, birthTime, gender } = birthData;
    
    try {
      // 计算八字
      const bazi = this.calculateBazi(birthDate, birthTime);
      
      // 五行分析
      const wuxing = this.analyzeWuxing(bazi);
      
      // 生成建议
      const recommendations = this.generateWuxingRecommendations(wuxing);
      
      // 保存分析记录
      const result = dbOperations.createReading.run(
        userId,
        'wuxing',
        name,
        birthDate,
        birthTime,
        gender,
        null,
        JSON.stringify(birthData),
        JSON.stringify({ wuxing }),
        JSON.stringify({ recommendations })
      );
      
      return {
        recordId: result.lastInsertRowid,
        analysis: {
          wuxingDistribution: wuxing,
          balanceAnalysis: this.analyzeWuxingBalance(wuxing),
          recommendations
        }
      };
    } catch (error) {
      throw new Error(`五行分析失败: ${error.message}`);
    }
  },
  
  /**
   * 计算八字
   */
  calculateBazi(birthDate, birthTime) {
    const date = new Date(birthDate + 'T' + (birthTime || '12:00'));
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    
    // 简化的八字计算（实际应用中需要更复杂的算法）
    const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
    const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];
    
    const monthStem = HEAVENLY_STEMS[(month - 1) % 10];
    const monthBranch = EARTHLY_BRANCHES[(month - 1) % 12];
    
    const dayStem = HEAVENLY_STEMS[(day - 1) % 10];
    const dayBranch = EARTHLY_BRANCHES[(day - 1) % 12];
    
    const hourStem = HEAVENLY_STEMS[Math.floor(hour / 2) % 10];
    const hourBranch = EARTHLY_BRANCHES[Math.floor(hour / 2) % 12];
    
    return {
      year: yearStem + yearBranch,
      month: monthStem + monthBranch,
      day: dayStem + dayBranch,
      hour: hourStem + hourBranch,
      yearAnimal: ZODIAC_ANIMALS[(year - 4) % 12]
    };
  },
  
  /**
   * 五行分析
   */
  analyzeWuxing(bazi) {
    const wuxingCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 统计五行
    Object.values(bazi).forEach(pillar => {
      if (typeof pillar === 'string' && pillar.length === 2) {
        const stem = pillar[0];
        const branch = pillar[1];
        
        const stemWuxing = WUXING_MAP[stem];
        const branchWuxing = WUXING_MAP[branch];
        
        if (stemWuxing) {
          const wuxingKey = this.getWuxingKey(stemWuxing);
          if (wuxingKey) wuxingCount[wuxingKey]++;
        }
        
        if (branchWuxing) {
          const wuxingKey = this.getWuxingKey(branchWuxing);
          if (wuxingKey) wuxingCount[wuxingKey]++;
        }
      }
    });
    
    return wuxingCount;
  },
  
  /**
   * 获取五行英文键名
   */
  getWuxingKey(wuxing) {
    const map = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };
    return map[wuxing];
  },
  
  /**
   * 五行平衡分析
   */
  analyzeWuxingBalance(wuxing) {
    const total = Object.values(wuxing).reduce((sum, count) => sum + count, 0);
    const average = total / 5;
    
    let dominant = null;
    let lacking = null;
    let maxCount = 0;
    let minCount = Infinity;
    
    Object.entries(wuxing).forEach(([element, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = element;
      }
      if (count < minCount) {
        minCount = count;
        lacking = element;
      }
    });
    
    const balanceScore = Math.round((1 - (maxCount - minCount) / total) * 100);
    
    return {
      dominantElement: dominant,
      lackingElement: lacking,
      balanceScore: Math.max(0, Math.min(100, balanceScore))
    };
  },
  
  /**
   * 生成八字分析
   */
  generateBaziAnalysis(bazi, wuxing, gender) {
    return {
      character: this.generateCharacterAnalysis(bazi, wuxing, gender),
      career: this.generateCareerAnalysis(bazi, wuxing),
      wealth: this.generateWealthAnalysis(bazi, wuxing),
      health: this.generateHealthAnalysis(bazi, wuxing),
      relationships: this.generateRelationshipAnalysis(bazi, wuxing, gender)
    };
  },
  
  /**
   * 生成性格分析
   */
  generateCharacterAnalysis(bazi, wuxing, gender) {
    const traits = [];
    
    // 根据日干分析性格
    const dayStem = bazi.day[0];
    switch (dayStem) {
      case '甲':
        traits.push('性格刚直，有领导才能，喜欢挑战');
        break;
      case '乙':
        traits.push('性格温和，适应能力强，善于合作');
        break;
      case '丙':
        traits.push('性格开朗，热情洋溢，富有创造力');
        break;
      case '丁':
        traits.push('性格细腻，思维敏锐，注重细节');
        break;
      default:
        traits.push('性格特点需要结合具体情况分析');
    }
    
    // 根据五行平衡分析性格
    const balance = this.analyzeWuxingBalance(wuxing);
    if (balance.dominantElement === 'wood') {
      traits.push('木旺之人，性格积极向上，富有生命力');
    } else if (balance.dominantElement === 'fire') {
      traits.push('火旺之人，性格热情奔放，行动力强');
    }
    
    return traits.join('；');
  },
  
  /**
   * 生成事业分析
   */
  generateCareerAnalysis(bazi, wuxing) {
    const advice = [];
    const balance = this.analyzeWuxingBalance(wuxing);
    
    if (balance.dominantElement === 'wood') {
      advice.push('适合从事教育、文化、林业等与木相关的行业');
    } else if (balance.dominantElement === 'fire') {
      advice.push('适合从事能源、娱乐、餐饮等与火相关的行业');
    } else if (balance.dominantElement === 'earth') {
      advice.push('适合从事房地产、农业、建筑等与土相关的行业');
    } else if (balance.dominantElement === 'metal') {
      advice.push('适合从事金融、机械、汽车等与金相关的行业');
    } else if (balance.dominantElement === 'water') {
      advice.push('适合从事航运、水利、贸易等与水相关的行业');
    }
    
    return advice.join('；');
  },
  
  /**
   * 生成财运分析
   */
  generateWealthAnalysis(bazi, wuxing) {
    return '财运需要通过努力获得，建议理性投资，稳健理财';
  },
  
  /**
   * 生成健康分析
   */
  generateHealthAnalysis(bazi, wuxing) {
    const balance = this.analyzeWuxingBalance(wuxing);
    const advice = [];
    
    if (balance.lackingElement === 'wood') {
      advice.push('注意肝胆健康，多接触绿色植物');
    } else if (balance.lackingElement === 'fire') {
      advice.push('注意心脏健康，保持乐观心态');
    }
    
    return advice.length > 0 ? advice.join('；') : '身体健康状况良好，注意均衡饮食和适量运动';
  },
  
  /**
   * 生成感情分析
   */
  generateRelationshipAnalysis(bazi, wuxing, gender) {
    return '感情运势平稳，建议真诚待人，珍惜缘分';
  },
  
  /**
   * 计算紫微斗数
   */
  calculateZiwei(birthDate, birthTime, gender) {
    const date = new Date(birthDate + 'T' + (birthTime || '12:00'));
    const hour = date.getHours();
    
    // 简化的紫微斗数计算
    const mingGongIndex = Math.floor(hour / 2);
    const mingGong = EARTHLY_BRANCHES[mingGongIndex];
    
    // 随机分配主星（实际应用中需要复杂的计算）
    const mainStars = this.getRandomStars(ZIWEI_STARS.main, 2);
    const luckyStars = this.getRandomStars(ZIWEI_STARS.lucky, 3);
    const unluckyStars = this.getRandomStars(ZIWEI_STARS.unlucky, 2);
    
    // 生成十二宫位
    const twelvePalaces = this.generateTwelvePalaces(mingGongIndex);
    
    // 四化飞星
    const siHua = this.generateSiHua();
    
    return {
      mingGong,
      mingGongXing: mainStars,
      shiErGong: twelvePalaces,
      siHua,
      birthChart: {
        mingGongPosition: mingGong,
        mainStars,
        luckyStars,
        unluckyStars
      }
    };
  },
  
  /**
   * 随机获取星曜
   */
  getRandomStars(starArray, count) {
    const shuffled = [...starArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },
  
  /**
   * 生成十二宫位
   */
  generateTwelvePalaces(mingGongIndex) {
    const palaces = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'];
    const result = {};
    
    palaces.forEach((palace, index) => {
      const branchIndex = (mingGongIndex + index) % 12;
      result[palace] = {
        branch: EARTHLY_BRANCHES[branchIndex],
        mainStars: this.getRandomStars(ZIWEI_STARS.main, 1),
        interpretation: `${palace}的详细解读内容`
      };
    });
    
    return result;
  },
  
  /**
   * 生成四化飞星
   */
  generateSiHua() {
    return {
      huaLu: { star: '廉贞', meaning: '财禄亨通，运势顺遂' },
      huaQuan: { star: '破军', meaning: '权力地位，事业有成' },
      huaKe: { star: '武曲', meaning: '贵人相助，学业有成' },
      huaJi: { star: '太阳', meaning: '需要谨慎，防范风险' }
    };
  },
  
  /**
   * 生成紫微斗数分析
   */
  generateZiweiAnalysis(ziwei, gender) {
    return {
      character: {
        overview: '根据命宫主星分析，您的性格特点突出',
        personalityTraits: '具有领导能力，做事果断，富有责任感'
      },
      career: {
        suitableIndustries: ['管理', '金融', '教育'],
        careerAdvice: '适合从事需要决策和领导的工作'
      },
      wealth: {
        wealthPattern: '财运稳定，通过努力可以获得不错的收入'
      },
      health: {
        constitution: '体质较好，注意劳逸结合',
        wellnessAdvice: '保持规律作息，适量运动'
      },
      relationships: {
        marriageFortune: '感情运势平稳，婚姻美满',
        spouseCharacteristics: '伴侣性格温和，相处和谐'
      }
    };
  },
  
  /**
   * 生成卦象
   */
  generateHexagram() {
    const randomIndex = Math.floor(Math.random() * HEXAGRAMS.length);
    const hexagram = HEXAGRAMS[randomIndex];
    
    return {
      name: hexagram.name,
      symbol: hexagram.symbol,
      description: hexagram.description,
      upperTrigram: hexagram.symbol.substring(0, 1),
      lowerTrigram: hexagram.symbol.substring(1, 2)
    };
  },
  
  /**
   * 生成易经分析
   */
  generateYijingAnalysis(hexagram, question) {
    return {
      basicInfo: {
        divinationData: {
          question,
          method: '梅花易数时间起卦法',
          divinationTime: new Date().toISOString()
        },
        hexagramInfo: {
          mainHexagram: hexagram.name,
          hexagramDescription: hexagram.description,
          upperTrigram: hexagram.upperTrigram,
          lowerTrigram: hexagram.lowerTrigram,
          detailedInterpretation: `${hexagram.name}卦象显示${hexagram.description}`
        }
      },
      detailedAnalysis: {
        hexagramAnalysis: {
          primaryMeaning: '此卦象征着新的开始和机遇',
          judgment: '吉',
          image: '天行健，君子以自强不息'
        },
        changingLinesAnalysis: {
          changingLinePosition: '六二',
          lineMeaning: '见龙在田，利见大人'
        },
        changingHexagram: {
          name: '天风姤',
          meaning: '变化中蕴含新的机遇',
          transformationInsight: '顺应变化，把握时机'
        }
      },
      lifeGuidance: {
        overallFortune: '整体运势向好，宜积极进取',
        careerGuidance: '事业发展顺利，可以大胆尝试',
        relationshipGuidance: '人际关系和谐，感情稳定',
        wealthGuidance: '财运亨通，投资需谨慎'
      },
      divinationWisdom: {
        keyMessage: '天道酬勤，自强不息',
        actionAdvice: '保持积极心态，勇于面对挑战',
        philosophicalInsight: '变化是永恒的，适应变化才能成功'
      }
    };
  },
  
  /**
   * 生成五行建议
   */
  generateWuxingRecommendations(wuxing) {
    const balance = this.analyzeWuxingBalance(wuxing);
    const recommendations = {
      colors: [],
      directions: [],
      careerFields: [],
      lifestyleAdvice: ''
    };
    
    if (balance.lackingElement === 'wood') {
      recommendations.colors = ['绿色', '青色'];
      recommendations.directions = ['东方'];
      recommendations.careerFields = ['教育', '文化', '林业'];
      recommendations.lifestyleAdvice = '多接触自然，种植绿色植物';
    } else if (balance.lackingElement === 'fire') {
      recommendations.colors = ['红色', '橙色'];
      recommendations.directions = ['南方'];
      recommendations.careerFields = ['能源', '娱乐', '餐饮'];
      recommendations.lifestyleAdvice = '保持乐观心态，多参加社交活动';
    }
    
    return recommendations;
  },
  
  /**
   * 获取用户分析历史
   */
  async getReadingHistory(userId, type = null) {
    try {
      let readings;
      if (type) {
        readings = dbOperations.getReadingsByUserIdAndType.all(userId, type);
      } else {
        readings = dbOperations.getReadingsByUserId.all(userId);
      }
      
      return readings.map(reading => ({
        id: reading.id,
        type: reading.reading_type,
        name: reading.name,
        birthDate: reading.birth_date,
        birthTime: reading.birth_time,
        gender: reading.gender,
        birthPlace: reading.birth_place,
        status: reading.status,
        createdAt: reading.created_at,
        results: reading.results ? JSON.parse(reading.results) : null,
        analysis: reading.analysis ? JSON.parse(reading.analysis) : null
      }));
    } catch (error) {
      throw new Error(`获取分析历史失败: ${error.message}`);
    }
  },
  
  /**
   * 删除分析记录
   */
  async deleteReading(userId, readingId) {
    try {
      const result = dbOperations.deleteReading.run(readingId, userId);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`删除分析记录失败: ${error.message}`);
    }
  }
};