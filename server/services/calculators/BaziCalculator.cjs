// 八字计算器模块
// 专注于核心计算逻辑，不包含分析解释

const BaseData = require('../common/BaseData.cjs');
const PreciseSolarTerms = require('../common/PreciseSolarTerms.cjs');

class BaziCalculator {
  constructor() {
    this.baseData = new BaseData();
    this.solarTerms = new PreciseSolarTerms();
  }
  
  // 计算精确八字四柱
  calculatePreciseBazi(birth_date, birth_time, longitude = 116.4, latitude = 39.9) {
    const birthDate = new Date(birth_date);
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 解析时辰
    const timeInfo = this.parseTime(birth_time);
    const hour = timeInfo.hour;
    const minute = timeInfo.minute;
    
    // 计算年柱
    const yearPillar = this.calculateYearPillar(year);
    
    // 计算月柱（基于精确节气）
    const monthPillar = this.calculateMonthPillar(year, month, day, hour, longitude, latitude);
    
    // 计算日柱
    const dayPillar = this.calculateDayPillar(year, month, day);
    
    // 计算时柱
    const hourPillar = this.calculateHourPillar(dayPillar.stem, hour);
    
    // 确定日主和日主五行
    const dayMaster = dayPillar.stem;
    const dayMasterElement = this.baseData.getStemElement(dayMaster);
    
    // 获取节气调整建议
    const solarTermAdjustment = this.solarTerms.shouldAdjustMonthPillar(
      birth_date, birth_time, longitude, latitude
    );
    
    return {
      year_pillar: yearPillar,
      month_pillar: monthPillar,
      day_pillar: dayPillar,
      hour_pillar: hourPillar,
      day_master: dayMaster,
      day_master_element: dayMasterElement,
      birth_info: {
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        longitude: longitude,
        latitude: latitude
      },
      solar_term_adjustment: solarTermAdjustment,
      precision_level: 'high'
    };
  }
  
  // 解析时间字符串
  parseTime(timeStr) {
    if (!timeStr) return { hour: 12, minute: 0 };
    
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      return {
        hour: parseInt(timeMatch[1]),
        minute: parseInt(timeMatch[2])
      };
    }
    
    return { hour: 12, minute: 0 };
  }
  
  // 计算年柱
  calculateYearPillar(year) {
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    
    return {
      stem: this.baseData.getStemByIndex(stemIndex),
      branch: this.baseData.getBranchByIndex(branchIndex),
      element: this.baseData.getStemElement(this.baseData.getStemByIndex(stemIndex))
    };
  }
  
  // 计算月柱（基于精确节气）
  calculateMonthPillar(year, month, day, hour = 12, longitude = 116.4, latitude = 39.9) {
    const birthDate = new Date(year, month - 1, day, hour);
    
    // 获取当前日期的节气信息
    const solarTermInfo = this.solarTerms.getSolarTermForDate(birthDate, longitude, latitude);
    
    // 确定农历月份（基于节气）
    let lunarMonth = month;
    if (solarTermInfo) {
      const currentTerm = solarTermInfo.current;
      lunarMonth = this.getSolarTermMonth(currentTerm.index);
      
      // 如果在节气交替期间，需要精确判断
      if (birthDate < currentTerm.localTime) {
        lunarMonth = lunarMonth === 1 ? 12 : lunarMonth - 1;
      }
    }
    
    // 根据年干和农历月份计算月柱
    const yearStemIndex = (year - 4) % 10;
    const monthStemIndex = this.calculateMonthStem(yearStemIndex, lunarMonth);
    const monthBranchIndex = (lunarMonth + 1) % 12;
    
    const stem = this.baseData.getStemByIndex(monthStemIndex);
    const branch = this.baseData.getBranchByIndex(monthBranchIndex);
    
    return {
      stem: stem,
      branch: branch,
      element: this.baseData.getStemElement(stem),
      lunar_month: lunarMonth,
      solar_term_info: solarTermInfo,
      precision_note: '基于精确节气计算'
    };
  }
  
  // 根据节气索引获取对应月份
  getSolarTermMonth(termIndex) {
    const termMonths = [
      1, 1, 2, 2, 3, 3,    // 立春到谷雨
      4, 4, 5, 5, 6, 6,    // 立夏到大暑
      7, 7, 8, 8, 9, 9,    // 立秋到霜降
      10, 10, 11, 11, 12, 12 // 立冬到大寒
    ];
    return termMonths[termIndex] || 1;
  }
  
  // 计算月干
  calculateMonthStem(yearStemIndex, lunarMonth) {
    // 月干计算公式：年干 * 2 + 月支 - 2
    const monthBranchIndex = (lunarMonth + 1) % 12;
    return (yearStemIndex * 2 + monthBranchIndex) % 10;
  }
  
  // 计算日柱
  calculateDayPillar(year, month, day) {
    // 使用简化的日柱计算公式
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    
    const stemIndex = (daysDiff + 9) % 10; // 1900年1月1日为己亥日
    const branchIndex = (daysDiff + 11) % 12;
    
    const stem = this.baseData.getStemByIndex(stemIndex);
    const branch = this.baseData.getBranchByIndex(branchIndex);
    
    return {
      stem: stem,
      branch: branch,
      element: this.baseData.getStemElement(stem)
    };
  }
  
  // 计算时柱
  calculateHourPillar(dayStem, hour) {
    // 根据日干和时辰计算时柱
    const dayStemIndex = this.baseData.getStemIndex(dayStem);
    const hourBranchIndex = this.getHourBranchIndex(hour);
    
    // 时干计算公式
    const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
    
    const stem = this.baseData.getStemByIndex(hourStemIndex);
    const branch = this.baseData.getBranchByIndex(hourBranchIndex);
    
    return {
      stem: stem,
      branch: branch,
      element: this.baseData.getStemElement(stem)
    };
  }
  
  // 根据小时获取地支索引
  getHourBranchIndex(hour) {
    const hourRanges = [
      { start: 23, end: 1, branch: 0 },  // 子时
      { start: 1, end: 3, branch: 1 },   // 丑时
      { start: 3, end: 5, branch: 2 },   // 寅时
      { start: 5, end: 7, branch: 3 },   // 卯时
      { start: 7, end: 9, branch: 4 },   // 辰时
      { start: 9, end: 11, branch: 5 },  // 巳时
      { start: 11, end: 13, branch: 6 }, // 午时
      { start: 13, end: 15, branch: 7 }, // 未时
      { start: 15, end: 17, branch: 8 }, // 申时
      { start: 17, end: 19, branch: 9 }, // 酉时
      { start: 19, end: 21, branch: 10 }, // 戌时
      { start: 21, end: 23, branch: 11 }  // 亥时
    ];
    
    for (const range of hourRanges) {
      if (range.start === 23) { // 子时特殊处理
        if (hour >= 23 || hour < 1) return range.branch;
      } else {
        if (hour >= range.start && hour < range.end) return range.branch;
      }
    }
    
    return 6; // 默认午时
  }
  
  // 计算五行强弱
  calculateElementStrength(baziChart) {
    const elements = ['木', '火', '土', '金', '水'];
    const elementCount = {};
    const elementStrength = {};
    
    // 初始化计数
    elements.forEach(element => {
      elementCount[element] = 0;
      elementStrength[element] = 0;
    });
    
    // 统计四柱五行
    const pillars = [baziChart.year_pillar, baziChart.month_pillar, baziChart.day_pillar, baziChart.hour_pillar];
    
    pillars.forEach((pillar, index) => {
      const stemElement = pillar.element;
      const branchElement = this.baseData.getBranchElement(pillar.branch);
      
      // 天干权重
      elementCount[stemElement]++;
      elementStrength[stemElement] += this.getStemWeight(index);
      
      // 地支权重
      elementCount[branchElement]++;
      elementStrength[branchElement] += this.getBranchWeight(index);
      
      // 地支藏干
      const hiddenStems = this.baseData.getBranchHiddenStems(pillar.branch);
      if (hiddenStems) {
        Object.entries(hiddenStems).forEach(([stem, strength]) => {
          const hiddenElement = this.baseData.getStemElement(stem);
          elementStrength[hiddenElement] += strength * 0.3; // 藏干权重较低
        });
      }
    });
    
    // 计算总强度
    const totalStrength = Object.values(elementStrength).reduce((sum, strength) => sum + strength, 0);
    
    // 计算百分比
    const elementPercentages = {};
    elements.forEach(element => {
      elementPercentages[element] = Math.round((elementStrength[element] / totalStrength) * 100);
    });
    
    return {
      element_count: elementCount,
      element_strength: elementStrength,
      element_percentages: elementPercentages,
      total_strength: totalStrength,
      strongest_element: this.getStrongestElement(elementStrength),
      weakest_element: this.getWeakestElement(elementStrength)
    };
  }
  
  // 获取天干权重
  getStemWeight(pillarIndex) {
    const weights = [1.2, 1.5, 2.0, 1.0]; // 年月日时的权重
    return weights[pillarIndex] || 1.0;
  }
  
  // 获取地支权重
  getBranchWeight(pillarIndex) {
    const weights = [1.0, 1.8, 1.5, 0.8]; // 年月日时的权重
    return weights[pillarIndex] || 1.0;
  }
  
  // 获取最强五行
  getStrongestElement(elementStrength) {
    let maxElement = '木';
    let maxStrength = 0;
    
    Object.entries(elementStrength).forEach(([element, strength]) => {
      if (strength > maxStrength) {
        maxStrength = strength;
        maxElement = element;
      }
    });
    
    return { element: maxElement, strength: maxStrength };
  }
  
  // 获取最弱五行
  getWeakestElement(elementStrength) {
    let minElement = '木';
    let minStrength = Infinity;
    
    Object.entries(elementStrength).forEach(([element, strength]) => {
      if (strength < minStrength) {
        minStrength = strength;
        minElement = element;
      }
    });
    
    return { element: minElement, strength: minStrength };
  }
  
  // 计算大运序列
  calculateDayunSequence(baziChart, gender, startAge) {
    const monthStemIndex = this.baseData.getStemIndex(baziChart.month_pillar.stem);
    const monthBranchIndex = this.baseData.getBranchIndex(baziChart.month_pillar.branch);
    
    const dayunSequence = [];
    const isYangYear = monthStemIndex % 2 === 0;
    const direction = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear) ? 1 : -1;
    
    for (let i = 0; i < 8; i++) {
      const stemIndex = (monthStemIndex + direction * (i + 1) + 10) % 10;
      const branchIndex = (monthBranchIndex + direction * (i + 1) + 12) % 12;
      
      dayunSequence.push({
        sequence: i + 1,
        stem: this.baseData.getStemByIndex(stemIndex),
        branch: this.baseData.getBranchByIndex(branchIndex),
        start_age: startAge + i * 10,
        end_age: startAge + (i + 1) * 10 - 1,
        element: this.baseData.getStemElement(this.baseData.getStemByIndex(stemIndex))
      });
    }
    
    return dayunSequence;
  }
  
  // 计算起运年龄
  calculateStartLuckAge(baziChart, birthDate, gender) {
    // 简化计算，实际应该根据节气精确计算
    const monthBranch = baziChart.month_pillar.branch;
    const isYangYear = this.baseData.getStemIndex(baziChart.year_pillar.stem) % 2 === 0;
    
    // 基础起运年龄
    let baseAge = 8;
    
    // 根据性别和年份阴阳调整
    if ((gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear)) {
      baseAge = 8; // 顺行
    } else {
      baseAge = 2; // 逆行
    }
    
    return baseAge;
  }
  
  // 计算十神关系
  calculateTenGods(baziChart) {
    const dayMaster = baziChart.day_master;
    const dayMasterElement = baziChart.day_master_element;
    
    const tenGods = {
      year: this.getTenGod(dayMaster, baziChart.year_pillar.stem),
      month: this.getTenGod(dayMaster, baziChart.month_pillar.stem),
      day: '日主', // 日主自己
      hour: this.getTenGod(dayMaster, baziChart.hour_pillar.stem)
    };
    
    return tenGods;
  }
  
  // 获取十神关系
  getTenGod(dayMaster, targetStem) {
    const dayMasterIndex = this.baseData.getStemIndex(dayMaster);
    const targetIndex = this.baseData.getStemIndex(targetStem);
    
    const diff = (targetIndex - dayMasterIndex + 10) % 10;
    const isYang = dayMasterIndex % 2 === 0;
    
    const tenGodMap = {
      0: '比肩',
      1: isYang ? '劫财' : '劫财',
      2: isYang ? '食神' : '伤官',
      3: isYang ? '伤官' : '食神',
      4: isYang ? '偏财' : '正财',
      5: isYang ? '正财' : '偏财',
      6: isYang ? '七杀' : '正官',
      7: isYang ? '正官' : '七杀',
      8: isYang ? '偏印' : '正印',
      9: isYang ? '正印' : '偏印'
    };
    
    return tenGodMap[diff] || '未知';
  }
}

module.exports = BaziCalculator;