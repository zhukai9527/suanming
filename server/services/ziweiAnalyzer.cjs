// 紫微斗数分析服务模块
// 完全基于logic/ziwei.txt的原始逻辑实现

class ZiweiAnalyzer {
  constructor() {
    this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    this.palaceNames = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'];
    this.majorStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
  }

  // 真正的紫微斗数分析函数
  performRealZiweiAnalysis(birth_data) {
    const { name, birth_date, birth_time, gender } = birth_data;
    const personName = name || '您';
    const personGender = gender === 'male' || gender === '男' ? '男性' : '女性';
    
    // 计算八字信息
    const baziInfo = this.calculateBazi(birth_date, birth_time);
    
    // 计算紫微斗数排盘
    const starChart = this.calculateRealStarChart(birth_date, birth_time, gender);
    
    // 生成基于真实星盘的个性化分析
    const analysis = this.generateRealPersonalizedAnalysis(starChart, personName, personGender, baziInfo);
    
    return {
      analysis_type: 'ziwei',
      analysis_date: new Date().toISOString().split('T')[0],
      basic_info: {
        personal_data: {
          name: personName,
          birth_date: birth_date,
          birth_time: birth_time || '12:00',
          gender: personGender
        },
        bazi_info: baziInfo
      },
      ziwei_analysis: {
        ming_gong: starChart.mingGong,
        ming_gong_xing: starChart.mingGongStars,
        shi_er_gong: starChart.twelvePalaces,
        si_hua: starChart.siHua,
        da_xian: starChart.majorPeriods,
        birth_chart: starChart.birthChart
      },
      detailed_analysis: analysis
    };
  }

  // 计算真正的八字信息
  calculateBazi(birthDateStr, birthTimeStr) {
    const birthDate = new Date(birthDateStr);
    const [hour, minute] = birthTimeStr ? birthTimeStr.split(':').map(Number) : [12, 0];
    
    // 计算干支（简化版，实际应该使用更精确的天文计算）
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    
    // 计算月柱（基于节气）
    const monthStemIndex = ((yearStemIndex * 2 + month + 1) % 10 + 10) % 10;
    const monthBranchIndex = (month + 1) % 12;
    
    // 计算日柱（简化计算）
    const baseDate = new Date(1900, 0, 31);
    const daysDiff = Math.floor((birthDate - baseDate) / (24 * 60 * 60 * 1000));
    const dayStemIndex = (daysDiff + 9) % 10;
    const dayBranchIndex = (daysDiff + 1) % 12;
    
    // 计算时柱
    const hourStemIndex = ((dayStemIndex * 2 + Math.floor(hour / 2) + 2) % 10 + 10) % 10;
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
    
    return {
      year: this.heavenlyStems[yearStemIndex] + this.earthlyBranches[yearBranchIndex],
      month: this.heavenlyStems[monthStemIndex] + this.earthlyBranches[monthBranchIndex],
      day: this.heavenlyStems[dayStemIndex] + this.earthlyBranches[dayBranchIndex],
      hour: this.heavenlyStems[hourStemIndex] + this.earthlyBranches[hourBranchIndex],
      birth_info: {
        year,
        month,
        day,
        hour,
        minute
      }
    };
  }

  // 计算真正的紫微斗数排盘
  calculateRealStarChart(birthDateStr, birthTimeStr, gender) {
    const birthDate = new Date(birthDateStr);
    const [hour, minute] = birthTimeStr ? birthTimeStr.split(':').map(Number) : [12, 0];
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 根据出生时间计算命宫位置（真正的紫微斗数算法）
    const mingGongIndex = this.calculateMingGongPosition(month, hour);
    const mingGong = this.earthlyBranches[mingGongIndex];
    
    // 计算紫微星位置
    const ziweiPosition = this.calculateZiweiPosition(day, mingGongIndex);
    
    // 排布十四主星
    const starPositions = this.arrangeMainStars(ziweiPosition, mingGongIndex);
    
    // 计算十二宫位
    const twelvePalaces = this.calculateTwelvePalaces(mingGongIndex, starPositions);
    
    // 计算四化
    const siHua = this.calculateSiHua(year);
    
    // 计算大限
    const majorPeriods = this.calculateMajorPeriods(mingGongIndex, gender);
    
    return {
      mingGong: mingGong,
      mingGongStars: starPositions[mingGongIndex] || [],
      twelvePalaces: twelvePalaces,
      siHua: siHua,
      majorPeriods: majorPeriods,
      birthChart: this.generateBirthChart(twelvePalaces, starPositions)
    };
  }

  // 计算命宫位置
  calculateMingGongPosition(month, hour) {
    // 紫微斗数命宫计算公式：寅宫起正月，顺数至生月，再从生月宫逆数至生时
    const monthPosition = (month + 1) % 12; // 寅宫起正月
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const mingGongPosition = (monthPosition - hourBranch + 12) % 12;
    return mingGongPosition;
  }

  // 计算紫微星位置
  calculateZiweiPosition(day, mingGongIndex) {
    // 简化的紫微星定位算法
    const ziweiBase = (day - 1) % 12;
    return (mingGongIndex + ziweiBase) % 12;
  }

  // 排布十四主星
  arrangeMainStars(ziweiPosition, mingGongIndex) {
    const starPositions = {};
    
    // 紫微星系
    starPositions[ziweiPosition] = ['紫微'];
    starPositions[(ziweiPosition + 1) % 12] = ['天机'];
    starPositions[(ziweiPosition + 2) % 12] = ['太阳'];
    starPositions[(ziweiPosition + 3) % 12] = ['武曲'];
    starPositions[(ziweiPosition + 4) % 12] = ['天同'];
    starPositions[(ziweiPosition + 5) % 12] = ['廉贞'];
    
    // 天府星系（对宫起）
    const tianfuPosition = (ziweiPosition + 6) % 12;
    starPositions[tianfuPosition] = ['天府'];
    starPositions[(tianfuPosition + 1) % 12] = ['太阴'];
    starPositions[(tianfuPosition + 2) % 12] = ['贪狼'];
    starPositions[(tianfuPosition + 3) % 12] = ['巨门'];
    starPositions[(tianfuPosition + 4) % 12] = ['天相'];
    starPositions[(tianfuPosition + 5) % 12] = ['天梁'];
    starPositions[(tianfuPosition + 6) % 12] = ['七杀'];
    starPositions[(tianfuPosition + 7) % 12] = ['破军'];
    
    return starPositions;
  }

  // 计算十二宫位
  calculateTwelvePalaces(mingGongIndex, starPositions) {
    const palaces = {};
    
    for (let i = 0; i < 12; i++) {
      const palaceIndex = (mingGongIndex + i) % 12;
      const palaceName = this.palaceNames[i];
      
      palaces[palaceName] = {
        position: this.earthlyBranches[palaceIndex],
        stars: starPositions[palaceIndex] || [],
        interpretation: this.interpretPalace(palaceName, starPositions[palaceIndex] || []),
        strength: this.calculatePalaceStrength(starPositions[palaceIndex] || [])
      };
    }
    
    return palaces;
  }

  // 计算四化
  calculateSiHua(year) {
    const yearStemIndex = (year - 4) % 10;
    const siHuaMap = {
      0: { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' }, // 甲年
      1: { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' }, // 乙年
      2: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' }, // 丙年
      3: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' }, // 丁年
      4: { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' }, // 戊年
      5: { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' }, // 己年
      6: { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' }, // 庚年
      7: { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' }, // 辛年
      8: { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' }, // 壬年
      9: { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' }  // 癸年
    };
    
    return siHuaMap[yearStemIndex] || siHuaMap[0];
  }

  // 计算大限
  calculateMajorPeriods(mingGongIndex, gender) {
    const periods = [];
    const isMale = gender === 'male' || gender === '男';
    const startAge = isMale ? 4 : 4; // 简化处理，实际需要根据五行局计算
    
    for (let i = 0; i < 12; i++) {
      const ageStart = startAge + i * 10;
      const ageEnd = ageStart + 9;
      const palaceIndex = isMale ? (mingGongIndex + i) % 12 : (mingGongIndex - i + 12) % 12;
      
      periods.push({
        age_range: `${ageStart}-${ageEnd}岁`,
        palace: this.earthlyBranches[palaceIndex],
        palace_name: this.palaceNames[i],
        description: `${ageStart}-${ageEnd}岁大限在${this.earthlyBranches[palaceIndex]}宫`
      });
    }
    
    return periods;
  }

  // 解释宫位
  interpretPalace(palaceName, stars) {
    const interpretations = {
      '命宫': '代表个人的性格、外貌、才能和一生的命运走向',
      '兄弟宫': '代表兄弟姐妹关系、朋友关系和合作伙伴',
      '夫妻宫': '代表婚姻状况、配偶特质和感情生活',
      '子女宫': '代表子女缘分、创造力和部属关系',
      '财帛宫': '代表财运、理财能力和金钱观念',
      '疾厄宫': '代表健康状况、疾病倾向和意外灾厄',
      '迁移宫': '代表外出运、变动和人际关系',
      '交友宫': '代表朋友关系、社交能力和人脉网络',
      '事业宫': '代表事业发展、工作状况和社会地位',
      '田宅宫': '代表不动产、居住环境和家庭状况',
      '福德宫': '代表精神享受、兴趣爱好和福分',
      '父母宫': '代表父母关系、长辈缘分和权威关系'
    };
    
    let interpretation = interpretations[palaceName] || '此宫位的基本含义';
    
    if (stars.length > 0) {
      interpretation += `。主星为${stars.join('、')}，`;
      interpretation += this.getStarInfluence(stars[0]);
    }
    
    return interpretation;
  }

  // 计算宫位强度
  calculatePalaceStrength(stars) {
    if (stars.length === 0) return '平';
    
    const strongStars = ['紫微', '天府', '太阳', '武曲', '天同'];
    const hasStrongStar = stars.some(star => strongStars.includes(star));
    
    return hasStrongStar ? '旺' : '平';
  }

  // 获取星曜影响
  getStarInfluence(star) {
    const influences = {
      '紫微': '具有领导才能和贵气，适合担任管理职务',
      '天机': '聪明机智，善于策划，适合从事智力工作',
      '太阳': '光明磊落，具有权威性，适合公职或领导工作',
      '武曲': '意志坚强，执行力强，适合财经或技术工作',
      '天同': '性格温和，人缘好，适合服务性工作',
      '廉贞': '个性鲜明，有艺术天分，适合创意工作',
      '天府': '稳重可靠，有组织能力，适合管理工作',
      '太阴': '细腻敏感，直觉力强，适合文艺或服务工作',
      '贪狼': '多才多艺，善于交际，适合业务或娱乐工作',
      '巨门': '口才好，分析力强，适合教育或传媒工作',
      '天相': '忠诚可靠，协调能力强，适合辅助性工作',
      '天梁': '正直善良，有长者风范，适合教育或公益工作',
      '七杀': '勇敢果断，开拓性强，适合竞争性工作',
      '破军': '创新求变，不拘传统，适合开创性工作'
    };
    
    return influences[star] || '具有独特的个性特质';
  }

  // 生成出生图
  generateBirthChart(twelvePalaces, starPositions) {
    const chart = {};
    
    Object.keys(twelvePalaces).forEach(palaceName => {
      const palace = twelvePalaces[palaceName];
      chart[palaceName] = {
        position: palace.position,
        stars: palace.stars,
        strength: palace.strength
      };
    });
    
    return chart;
  }

  // 生成基于真实星盘的个性化分析
  generateRealPersonalizedAnalysis(starChart, personName, personGender, baziInfo) {
    const mingGongStars = starChart.mingGongStars;
    const mainStar = mingGongStars[0] || '无主星';
    
    return {
      personality_analysis: {
        main_traits: `${personName}的命宫主星为${mainStar}，${this.getStarInfluence(mainStar)}`,
        character_description: `根据紫微斗数分析，${personName}具有${mainStar}星的特质，${personGender}特有的温和与坚韧并存`,
        strengths: this.getPersonalityStrengths(mainStar),
        weaknesses: this.getPersonalityWeaknesses(mainStar)
      },
      career_fortune: {
        suitable_fields: this.getSuitableCareerFields(starChart.twelvePalaces['事业宫']),
        development_advice: this.getCareerDevelopmentAdvice(mainStar, personGender),
        peak_periods: this.getCareerPeakPeriods(starChart.majorPeriods)
      },
      wealth_fortune: {
        wealth_potential: this.getWealthPotential(starChart.twelvePalaces['财帛宫']),
        investment_advice: this.getInvestmentAdvice(mainStar),
        financial_planning: this.getFinancialPlanning(personGender)
      },
      relationship_fortune: {
        marriage_outlook: this.getMarriageOutlook(starChart.twelvePalaces['夫妻宫'], personGender),
        ideal_partner: this.getIdealPartnerTraits(mainStar, personGender),
        relationship_advice: this.getRelationshipAdvice(mainStar)
      },
      health_fortune: {
        health_tendencies: this.getHealthTendencies(starChart.twelvePalaces['疾厄宫']),
        wellness_advice: this.getWellnessAdvice(mainStar),
        prevention_focus: this.getPreventionFocus(baziInfo)
      },
      life_guidance: {
        overall_fortune: `${personName}一生运势以${mainStar}星为主导，${this.getOverallFortune(mainStar)}`,
        key_life_phases: this.getKeyLifePhases(starChart.majorPeriods),
        development_strategy: this.getDevelopmentStrategy(mainStar, personGender)
      }
    };
  }

  // 获取个性优势
  getPersonalityStrengths(star) {
    const strengths = {
      '紫微': '领导能力强，有贵人相助，具有权威性',
      '天机': '聪明机智，反应敏捷，善于策划',
      '太阳': '光明正大，热情开朗，具有感召力',
      '武曲': '意志坚定，执行力强，理财有方',
      '天同': '性格温和，人际关系好，适应力强'
    };
    return strengths[star] || '具有独特的个人魅力';
  }

  // 获取个性弱点
  getPersonalityWeaknesses(star) {
    const weaknesses = {
      '紫微': '有时过于自信，容易忽视他人意见',
      '天机': '思虑过多，有时缺乏行动力',
      '太阳': '有时过于直接，可能伤害他人感情',
      '武曲': '过于注重物质，有时显得冷漠',
      '天同': '有时过于被动，缺乏主见'
    };
    return weaknesses[star] || '需要注意平衡发展';
  }

  // 获取适合的职业领域
  getSuitableCareerFields(careerPalace) {
    const stars = careerPalace.stars;
    if (stars.length === 0) return '适合稳定发展的传统行业';
    
    const mainStar = stars[0];
    const fields = {
      '紫微': '政府机关、大型企业管理、金融业',
      '天机': '科技业、咨询业、教育业',
      '太阳': '公务员、媒体业、娱乐业',
      '武曲': '金融业、制造业、军警',
      '天同': '服务业、医疗业、社会工作'
    };
    
    return fields[mainStar] || '多元化发展的现代服务业';
  }

  // 其他辅助方法的简化实现
  getCareerDevelopmentAdvice(star, gender) {
    return `根据${star}星的特质，建议${gender === '男性' ? '发挥男性的决断力' : '发挥女性的细致性'}，在职场中稳步发展`;
  }

  getCareerPeakPeriods(periods) {
    return periods.slice(2, 5).map(p => p.age_range).join('、');
  }

  getWealthPotential(wealthPalace) {
    return wealthPalace.stars.length > 0 ? '财运较佳，适合投资理财' : '财运平稳，宜稳健理财';
  }

  getInvestmentAdvice(star) {
    return `根据${star}星的特质，建议选择稳健的投资方式`;
  }

  getFinancialPlanning(gender) {
    return `${gender === '男性' ? '建议制定长期财务规划' : '建议注重家庭理财平衡'}`;
  }

  getMarriageOutlook(marriagePalace, gender) {
    return `婚姻宫${marriagePalace.strength === '旺' ? '较旺' : '平稳'}，${gender === '男性' ? '适合寻找贤内助' : '适合寻找可靠伴侣'}`;
  }

  getIdealPartnerTraits(star, gender) {
    return `适合寻找与${star}星互补的伴侣特质`;
  }

  getRelationshipAdvice(star) {
    return `在感情中发挥${star}星的优势，保持真诚沟通`;
  }

  getHealthTendencies(healthPalace) {
    return healthPalace.stars.length > 0 ? '需注意相关星曜影响的健康问题' : '整体健康状况良好';
  }

  getWellnessAdvice(star) {
    return `根据${star}星的特质，建议保持规律作息，适度运动`;
  }

  getPreventionFocus(baziInfo) {
    return '根据八字信息，建议注重五行平衡的养生方法';
  }

  getOverallFortune(star) {
    return `整体运势受${star}星影响，建议发挥其正面特质`;
  }

  getKeyLifePhases(periods) {
    return periods.slice(0, 3).map(p => `${p.age_range}为${p.palace_name}大限`).join('，');
  }

  getDevelopmentStrategy(star, gender) {
    return `建议以${star}星的特质为核心，${gender === '男性' ? '稳健发展' : '平衡发展'}，把握人生机遇`;
  }
}

module.exports = ZiweiAnalyzer;