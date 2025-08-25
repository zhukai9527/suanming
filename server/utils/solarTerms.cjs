// 节气计算工具模块
// 提供精确的二十四节气计算功能

class SolarTerms {
  constructor() {
    this.initializeSolarTermsData();
  }

  // 初始化节气数据
  initializeSolarTermsData() {
    // 节气名称（按顺序）
    this.SOLAR_TERMS_NAMES = [
      '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
      '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
      '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
      '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
    ];

    // 节气对应的大致日期（平年）
    this.SOLAR_TERMS_DATES = {
      '立春': [2, 4], '雨水': [2, 19], '惊蛰': [3, 6], '春分': [3, 21],
      '清明': [4, 5], '谷雨': [4, 20], '立夏': [5, 6], '小满': [5, 21],
      '芒种': [6, 6], '夏至': [6, 21], '小暑': [7, 7], '大暑': [7, 23],
      '立秋': [8, 8], '处暑': [8, 23], '白露': [9, 8], '秋分': [9, 23],
      '寒露': [10, 8], '霜降': [10, 23], '立冬': [11, 8], '小雪': [11, 22],
      '大雪': [12, 7], '冬至': [12, 22], '小寒': [1, 6], '大寒': [1, 20]
    };
    
    // 节气的精确计算参数（基于天文算法的简化版本）
    this.SOLAR_TERMS_PARAMS = {
      '立春': { longitude: 315, baseDay: 4.6295 },
      '雨水': { longitude: 330, baseDay: 19.4599 },
      '惊蛰': { longitude: 345, baseDay: 6.3826 },
      '春分': { longitude: 0, baseDay: 21.4155 },
      '清明': { longitude: 15, baseDay: 5.59 },
      '谷雨': { longitude: 30, baseDay: 20.888 },
      '立夏': { longitude: 45, baseDay: 6.318 },
      '小满': { longitude: 60, baseDay: 21.86 },
      '芒种': { longitude: 75, baseDay: 6.5 },
      '夏至': { longitude: 90, baseDay: 22.2 },
      '小暑': { longitude: 105, baseDay: 7.928 },
      '大暑': { longitude: 120, baseDay: 23.65 },
      '立秋': { longitude: 135, baseDay: 8.35 },
      '处暑': { longitude: 150, baseDay: 23.95 },
      '白露': { longitude: 165, baseDay: 8.44 },
      '秋分': { longitude: 180, baseDay: 23.822 },
      '寒露': { longitude: 195, baseDay: 8.318 },
      '霜降': { longitude: 210, baseDay: 24.218 },
      '立冬': { longitude: 225, baseDay: 8.218 },
      '小雪': { longitude: 240, baseDay: 23.08 },
      '大雪': { longitude: 255, baseDay: 7.9 },
      '冬至': { longitude: 270, baseDay: 22.6 },
      '小寒': { longitude: 285, baseDay: 6.11 },
      '大寒': { longitude: 300, baseDay: 20.84 }
    };
  }

  /**
   * 计算指定年份的所有节气时间
   * @param {number} year - 年份
   * @returns {Array} 节气时间数组
   */
  calculateYearSolarTerms(year) {
    const solarTerms = [];
    
    for (const termName of this.SOLAR_TERMS_NAMES) {
      const termDate = this.calculateSolarTermDate(year, termName);
      solarTerms.push({
        name: termName,
        date: termDate,
        timestamp: termDate.getTime()
      });
    }
    
    // 按时间排序
    solarTerms.sort((a, b) => a.timestamp - b.timestamp);
    
    return solarTerms;
  }

  /**
   * 计算特定节气的精确时间（使用改进的算法）
   * @param {number} year - 年份
   * @param {string} termName - 节气名称
   * @returns {Date} 节气时间
   */
  calculateSolarTermDate(year, termName) {
    const baseDate = this.SOLAR_TERMS_DATES[termName];
    if (!baseDate) {
      throw new Error(`未知的节气名称: ${termName}`);
    }
    
    const [month, day] = baseDate;
    
    // 简化的节气计算（基于平均值和年份修正）
    const baseYear = 2000;
    const yearDiff = year - baseYear;
    
    // 每年节气时间的微调（约0.2422天/年的偏移）
    const dayOffset = Math.floor(yearDiff * 0.2422);
    
    let adjustedDay = day + dayOffset;
    let adjustedMonth = month;
    let adjustedYear = year;
    
    // 处理月份边界
    const daysInMonth = this.getDaysInMonth(adjustedYear, adjustedMonth);
    if (adjustedDay > daysInMonth) {
      adjustedDay -= daysInMonth;
      adjustedMonth += 1;
      if (adjustedMonth > 12) {
        adjustedMonth = 1;
        adjustedYear += 1;
      }
    } else if (adjustedDay < 1) {
      adjustedMonth -= 1;
      if (adjustedMonth < 1) {
        adjustedMonth = 12;
        adjustedYear -= 1;
      }
      adjustedDay += this.getDaysInMonth(adjustedYear, adjustedMonth);
    }
    
    return new Date(adjustedYear, adjustedMonth - 1, adjustedDay, 12, 0, 0);
  }
  
  /**
   * 儒略日转公历日期
   * @param {number} jd - 儒略日
   * @returns {Date} 公历日期
   */
  julianToGregorian(jd) {
    const a = Math.floor(jd + 0.5);
    const b = a + 1537;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    // 计算时分秒
    const fraction = (jd + 0.5) - a;
    const hours = fraction * 24;
    const hour = Math.floor(hours);
    const minutes = (hours - hour) * 60;
    const minute = Math.floor(minutes);
    const second = Math.floor((minutes - minute) * 60);
    
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  /**
   * 获取指定时间的当前节气
   * @param {Date} date - 日期时间
   * @returns {Object} 节气信息
   */
  getCurrentSolarTerm(date) {
    const year = date.getFullYear();
    const yearSolarTerms = this.calculateYearSolarTerms(year);
    
    // 找到当前时间对应的节气
    let currentTerm = yearSolarTerms[0];
    
    for (let i = 0; i < yearSolarTerms.length; i++) {
      if (date.getTime() >= yearSolarTerms[i].timestamp) {
        currentTerm = yearSolarTerms[i];
      } else {
        break;
      }
    }
    
    // 如果当前时间早于本年第一个节气，则取上一年最后一个节气
    if (date.getTime() < yearSolarTerms[0].timestamp) {
      const prevYearTerms = this.calculateYearSolarTerms(year - 1);
      currentTerm = prevYearTerms[prevYearTerms.length - 1];
    }
    
    return {
      name: currentTerm.name,
      date: currentTerm.date,
      isYindun: this.isYindunSeason(currentTerm.name)
    };
  }

  /**
   * 判断节气是否为阴遁季节
   * @param {string} termName - 节气名称
   * @returns {boolean} 是否为阴遁
   */
  isYindunSeason(termName) {
    const yindunTerms = [
      '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
      '秋分', '寒露', '霜降', '立冬', '小雪', '大雪'
    ];
    
    return yindunTerms.includes(termName);
  }

  /**
   * 计算上中下元
   * @param {Date} date - 当前日期
   * @param {Object} solarTerm - 节气信息
   * @returns {string} 元次（上元、中元、下元）
   */
  calculateYuan(date, solarTerm) {
    const daysSinceTerm = Math.floor((date.getTime() - solarTerm.date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceTerm < 5) {
      return '上元';
    } else if (daysSinceTerm < 10) {
      return '中元';
    } else {
      return '下元';
    }
  }

  /**
   * 获取节气的季节属性
   * @param {string} termName - 节气名称
   * @returns {string} 季节
   */
  getSeasonByTerm(termName) {
    const seasons = {
      '立春': '春', '雨水': '春', '惊蛰': '春', '春分': '春', '清明': '春', '谷雨': '春',
      '立夏': '夏', '小满': '夏', '芒种': '夏', '夏至': '夏', '小暑': '夏', '大暑': '夏',
      '立秋': '秋', '处暑': '秋', '白露': '秋', '秋分': '秋', '寒露': '秋', '霜降': '秋',
      '立冬': '冬', '小雪': '冬', '大雪': '冬', '冬至': '冬', '小寒': '冬', '大寒': '冬'
    };
    
    return seasons[termName] || '未知';
  }

  /**
   * 获取月份天数
   * @param {number} year - 年份
   * @param {number} month - 月份
   * @returns {number} 天数
   */
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * 获取下一个节气
   * @param {Date} date - 当前日期
   * @returns {Object} 下一个节气信息
   */
  getNextSolarTerm(date) {
    const year = date.getFullYear();
    const yearSolarTerms = this.calculateYearSolarTerms(year);
    
    for (const term of yearSolarTerms) {
      if (term.timestamp > date.getTime()) {
        return {
          name: term.name,
          date: term.date,
          daysUntil: Math.ceil((term.timestamp - date.getTime()) / (1000 * 60 * 60 * 24))
        };
      }
    }
    
    // 如果当年没有下一个节气，返回下一年的第一个节气
    const nextYearTerms = this.calculateYearSolarTerms(year + 1);
    const nextTerm = nextYearTerms[0];
    
    return {
      name: nextTerm.name,
      date: nextTerm.date,
      daysUntil: Math.ceil((nextTerm.timestamp - date.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  /**
   * 获取节气的详细信息
   * @param {string} termName - 节气名称
   * @returns {Object} 节气详细信息
   */
  getSolarTermInfo(termName) {
    const termInfo = {
      '立春': { meaning: '春季开始', temperature: '渐暖', weather: '春风送暖' },
      '雨水': { meaning: '降雨增多', temperature: '回暖', weather: '春雨绵绵' },
      '惊蛰': { meaning: '春雷惊醒蛰虫', temperature: '转暖', weather: '雷声阵阵' },
      '春分': { meaning: '昼夜等长', temperature: '温和', weather: '春暖花开' },
      '清明': { meaning: '天清地明', temperature: '舒适', weather: '清爽明朗' },
      '谷雨': { meaning: '雨水充足利于谷物生长', temperature: '温暖', weather: '春雨润物' },
      
      '立夏': { meaning: '夏季开始', temperature: '渐热', weather: '初夏时节' },
      '小满': { meaning: '麦类作物籽粒饱满', temperature: '炎热', weather: '暑热渐盛' },
      '芒种': { meaning: '有芒作物成熟', temperature: '酷热', weather: '梅雨季节' },
      '夏至': { meaning: '白昼最长', temperature: '最热', weather: '酷暑难耐' },
      '小暑': { meaning: '暑热开始', temperature: '炎热', weather: '暑气逼人' },
      '大暑': { meaning: '最热时期', temperature: '酷热', weather: '烈日炎炎' },
      
      '立秋': { meaning: '秋季开始', temperature: '渐凉', weather: '秋高气爽' },
      '处暑': { meaning: '暑热结束', temperature: '转凉', weather: '秋风送爽' },
      '白露': { meaning: '露水增多', temperature: '凉爽', weather: '秋意渐浓' },
      '秋分': { meaning: '昼夜等长', temperature: '舒适', weather: '秋高气爽' },
      '寒露': { meaning: '露水转寒', temperature: '微寒', weather: '秋风萧瑟' },
      '霜降': { meaning: '开始降霜', temperature: '寒冷', weather: '霜叶满天' },
      
      '立冬': { meaning: '冬季开始', temperature: '转寒', weather: '初冬时节' },
      '小雪': { meaning: '开始降雪', temperature: '寒冷', weather: '雪花飞舞' },
      '大雪': { meaning: '降雪增多', temperature: '严寒', weather: '大雪纷飞' },
      '冬至': { meaning: '白昼最短', temperature: '最冷', weather: '数九寒天' },
      '小寒': { meaning: '寒冷加剧', temperature: '严寒', weather: '滴水成冰' },
      '大寒': { meaning: '最寒冷时期', temperature: '酷寒', weather: '天寒地冻' }
    };
    
    return termInfo[termName] || { meaning: '未知', temperature: '未知', weather: '未知' };
  }
  
  /**
   * 验证节气计算的准确性
   * @param {number} year - 年份
   * @param {string} termName - 节气名称
   * @returns {Object} 验证结果
   */
  validateSolarTerm(year, termName) {
    const calculated = this.calculateSolarTermDate(year, termName);
    const expected = this.SOLAR_TERMS_DATES[termName];
    
    if (!expected) {
      return { valid: false, error: '未知节气' };
    }
    
    const [expectedMonth, expectedDay] = expected;
    const calculatedMonth = calculated.getMonth() + 1;
    const calculatedDay = calculated.getDate();
    
    const dayDiff = Math.abs(calculatedDay - expectedDay);
    const monthDiff = Math.abs(calculatedMonth - expectedMonth);
    
    return {
      valid: monthDiff === 0 && dayDiff <= 2, // 允许2天误差
      calculated: { month: calculatedMonth, day: calculatedDay },
      expected: { month: expectedMonth, day: expectedDay },
      difference: { month: monthDiff, day: dayDiff }
    };
  }

  /**
   * 计算春分点的儒略日
   * @param {number} year 年份
   * @returns {number} 儒略日
   */
  calculateSpringEquinox(year) {
    // 基于Meeus算法的春分计算
    const Y = year;
    const T = (Y - 2000) / 1000;
    
    // 春分点的平均时间（儒略日）
    let JDE = 2451623.80984 + 365242.37404 * T + 0.05169 * T * T - 0.00411 * T * T * T - 0.00057 * T * T * T * T;
    
    // 应用周期性修正
    const S = this.calculatePeriodicTerms(T);
    JDE += S;
    
    return JDE;
  }

  /**
   * 计算周期性修正项
   * @param {number} T 时间参数
   * @returns {number} 修正值
   */
  calculatePeriodicTerms(T) {
    // 简化的周期性修正项
    const terms = [
      [485, 324.96, 1934.136],
      [203, 337.23, 32964.467],
      [199, 342.08, 20.186],
      [182, 27.85, 445267.112],
      [156, 73.14, 45036.886],
      [136, 171.52, 22518.443],
      [77, 222.54, 65928.934],
      [74, 296.72, 3034.906],
      [70, 243.58, 9037.513],
      [58, 119.81, 33718.147]
    ];
    
    let S = 0;
    for (const [A, B, C] of terms) {
      S += A * Math.cos(this.degreesToRadians(B + C * T));
    }
    
    return S * 0.00001;
  }

  /**
   * 获取节气修正值
   * @param {number} year 年份
   * @param {number} termIndex 节气索引
   * @returns {number} 修正值（天）
   */
  getSolarTermCorrection(year, termIndex) {
    // 基于历史数据的经验修正
    const corrections = {
      // 立春修正
      0: -0.2422 * Math.sin(this.degreesToRadians((year - 1900) * 0.2422)),
      // 春分修正
      3: 0,
      // 夏至修正
      9: 0.1025 * Math.cos(this.degreesToRadians((year - 1900) * 0.25)),
      // 秋分修正
      15: 0,
      // 冬至修正
      21: -0.1030 * Math.cos(this.degreesToRadians((year - 1900) * 0.25))
    };
    
    return corrections[termIndex] || 0;
  }

  /**
   * 儒略日转换为日期
   * @param {number} jd 儒略日
   * @returns {Date} 日期对象
   */
  julianDayToDate(jd) {
    const a = Math.floor(jd + 0.5);
    const b = a + 1537;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    const fraction = (jd + 0.5) - a;
    const hours = fraction * 24;
    const hour = Math.floor(hours);
    const minutes = (hours - hour) * 60;
    const minute = Math.floor(minutes);
    const seconds = (minutes - minute) * 60;
    const second = Math.floor(seconds);
    
    return new Date(year, month - 1, day, hour, minute, second);
  }

  /**
   * 度转弧度
   * @param {number} degrees 度数
   * @returns {number} 弧度
   */
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 判断指定日期属于哪个节气月
   * @param {Date} date 日期
   * @returns {Object} 节气月信息
   */
  getSolarTermMonth(date) {
    const year = date.getFullYear();
    
    // 获取当年和前后年的节气，以处理跨年情况
    const prevYearTerms = this.calculateYearSolarTerms(year - 1);
    const currentYearTerms = this.calculateYearSolarTerms(year);
    const nextYearTerms = this.calculateYearSolarTerms(year + 1);
    
    // 合并所有节气，按时间排序
    const allTerms = [...prevYearTerms, ...currentYearTerms, ...nextYearTerms]
      .sort((a, b) => a.time - b.time);
    
    // 找到当前日期所在的节气区间
    for (let i = 0; i < allTerms.length - 1; i++) {
      const currentTerm = allTerms[i];
      const nextTerm = allTerms[i + 1];
      
      if (date >= currentTerm.time && date < nextTerm.time) {
        // 找到最近的月份起始节气（立春、惊蛰、清明等）
        let monthStartTerm = currentTerm;
        let monthStartIndex = this.solarTermNames.indexOf(currentTerm.name);
        
        // 如果当前节气不是月份起始节气，找到前一个月份起始节气
        if (monthStartIndex % 2 === 1) {
          // 当前是中气（雨水、春分等），需要找到前一个节气
          for (let j = i; j >= 0; j--) {
            const term = allTerms[j];
            const termIdx = this.solarTermNames.indexOf(term.name);
            if (termIdx % 2 === 0) {
              monthStartTerm = term;
              monthStartIndex = termIdx;
              break;
            }
          }
        }
        
        return {
          termName: monthStartTerm.name,
          termIndex: monthStartIndex,
          startTime: monthStartTerm.time,
          endTime: nextTerm.time,
          monthBranch: this.getMonthBranch(monthStartIndex)
        };
      }
    }
    
    // 默认返回立春月（寅月）
    return {
      termName: '立春',
      termIndex: 0,
      startTime: currentYearTerms[0].time,
      endTime: currentYearTerms[2].time,
      monthBranch: '寅'
    };
  }

  /**
   * 根据节气索引获取对应的月支
   * @param {number} termIndex 节气索引
   * @returns {string} 月支
   */
  getMonthBranch(termIndex) {
    // 节气与月支的对应关系（立春开始为寅月）
    const branches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    const monthIndex = Math.floor(termIndex / 2);
    return branches[monthIndex];
  }

  /**
   * 获取指定年份立春的精确时间
   * @param {number} year 年份
   * @returns {Date} 立春时间
   */
  getSpringBeginning(year) {
    return this.calculateSolarTermDate(year, '立春');
  }

  /**
   * 判断指定日期是否在立春之后
   * @param {Date} date 日期
   * @returns {boolean} 是否在立春之后
   */
  isAfterSpringBeginning(date) {
    const year = date.getFullYear();
    const springBeginning = this.getSpringBeginning(year);
    return date >= springBeginning;
  }
}

module.exports = SolarTerms;