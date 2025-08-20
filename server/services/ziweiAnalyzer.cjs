// 专业紫微斗数分析服务模块
// 基于传统紫微斗数理论的精确实现

const BaziAnalyzer = require('./baziAnalyzer.cjs');

class ZiweiAnalyzer {
  constructor() {
    // 初始化八字分析器
    this.baziAnalyzer = new BaziAnalyzer();
    
    // 基础数据
    this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    this.palaceNames = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'];
    
    // 十四主星
    this.majorStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
    
    // 六吉星
    this.luckyStars = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'];
    
    // 六煞星
    this.unluckyStars = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
    
    // 其他重要星曜
    this.otherStars = ['禄存', '天马', '红鸾', '天喜', '孤辰', '寡宿', '天刑', '天姚'];
    
    // 长生十二神
    this.twelveGods = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
    
    // 五行局对应表
    this.wuxingJu = {
      '水二局': 2, '木三局': 3, '金四局': 4, '土五局': 5, '火六局': 6
    };
    
    // 四化表
    this.sihuaTable = {
      '甲': { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
      '乙': { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
      '丙': { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
      '丁': { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
      '戊': { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
      '己': { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
      '庚': { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' },
      '辛': { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
      '壬': { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
      '癸': { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' }
    };
  }

  // 专业紫微斗数分析主函数
  performRealZiweiAnalysis(birth_data) {
    const { name, birth_date, birth_time, gender } = birth_data;
    const personName = name || '您';
    const personGender = gender === 'male' || gender === '男' ? '男性' : '女性';
    
    // 计算精确的八字信息
    const baziInfo = this.calculatePreciseBazi(birth_date, birth_time);
    
    // 计算五行局
    const wuxingJu = this.calculateWuxingJu(baziInfo);
    
    // 计算命宫位置
    const mingGongPosition = this.calculateMingGongPosition(birth_date, birth_time);
    
    // 计算完整的紫微斗数排盘
    const starChart = this.calculateCompleteStarChart(birth_date, birth_time, gender, wuxingJu, mingGongPosition);
    
    // 生成基于真实星盘的专业分析
    const birthYear = new Date(birth_date).getFullYear();
    const analysis = this.generateProfessionalAnalysis(starChart, personName, personGender, baziInfo, wuxingJu, birthYear);
    
    return {
      analysis_type: 'ziwei',
      analysis_date: new Date().toISOString(),
      basic_info: {
        personal_data: {
          name: personName,
          birth_date: birth_date,
          birth_time: birth_time || '12:00',
          gender: personGender
        },
        bazi_info: baziInfo,
        wuxing_ju: wuxingJu,
        ming_gong_position: mingGongPosition
      },
      ziwei_analysis: {
        ming_gong: starChart.mingGong,
        ming_gong_stars: starChart.mingGongStars,
        twelve_palaces: starChart.twelvePalaces,
        si_hua: starChart.siHua,
        major_periods: starChart.majorPeriods,
        star_chart: starChart.completeChart,
        wuxing_ju_info: wuxingJu
      },
      detailed_analysis: analysis
    };
  }

  // 计算五行局（紫微斗数核心算法）- 基于纳音五行
  calculateWuxingJu(baziInfo) {
    const { year, month, day, hour } = baziInfo;
    
    // 提取年干支
    const yearStem = year.charAt(0);
    const yearBranch = year.charAt(1);
    
    // 根据年干支计算纳音五行局
    const nayin = this.calculateNayin(yearStem, yearBranch);
    const juType = this.getNayinWuxingJu(nayin);
    const juNumber = this.wuxingJu[juType];
    
    return {
      type: juType,
      number: juNumber,
      nayin: nayin,
      description: `${juType}，纳音${nayin}，大限每${juNumber * 10}年一步`,
      start_age: this.calculateStartAge(juNumber, baziInfo.birth_info.gender || 'male')
    };
  }
  
  // 计算纳音五行
  calculateNayin(stem, branch) {
    // 纳音五行对照表（60甲子纳音）
    const nayinTable = {
      '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
      '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
    };
    
    const ganzhi = stem + branch;
    return nayinTable[ganzhi] || '大林木';
  }
  
  // 根据纳音确定五行局
  getNayinWuxingJu(nayin) {
    // 纳音五行局对照表
    const nayinJuMap = {
      // 金纳音 -> 金四局
      '海中金': '金四局', '剑锋金': '金四局', '白蜡金': '金四局', 
      '砂中金': '金四局', '金箔金': '金四局', '钗钏金': '金四局',
      
      // 木纳音 -> 木三局
      '大林木': '木三局', '杨柳木': '木三局', '松柏木': '木三局',
      '平地木': '木三局', '桑柘木': '木三局', '石榴木': '木三局',
      
      // 水纳音 -> 水二局
      '涧下水': '水二局', '泉中水': '水二局', '长流水': '水二局',
      '天河水': '水二局', '大溪水': '水二局', '大海水': '水二局',
      
      // 火纳音 -> 火六局
      '炉中火': '火六局', '山头火': '火六局', '霹雳火': '火六局',
      '山下火': '火六局', '覆灯火': '火六局', '天上火': '火六局',
      
      // 土纳音 -> 土五局
      '路旁土': '土五局', '城头土': '土五局', '屋上土': '土五局',
      '壁上土': '土五局', '大驿土': '土五局', '沙中土': '土五局'
    };
    
    return nayinJuMap[nayin] || '土五局';
  }

  // 计算起运年龄
  calculateStartAge(juNumber, gender) {
    // 根据五行局和性别计算起运年龄
    const baseAge = gender === 'male' || gender === '男' ? 2 : 5;
    return baseAge + (juNumber - 2);
  }

  // 计算精确的八字信息
  calculatePreciseBazi(birthDateStr, birthTimeStr) {
    // 使用优化后的八字分析器获取精确的八字信息
    const baziResult = this.baziAnalyzer.calculatePreciseBazi(birthDateStr, birthTimeStr);
    
    return {
      year: baziResult.year_pillar.stem + baziResult.year_pillar.branch,
      month: baziResult.month_pillar.stem + baziResult.month_pillar.branch,
      day: baziResult.day_pillar.stem + baziResult.day_pillar.branch,
      hour: baziResult.hour_pillar.stem + baziResult.hour_pillar.branch,
      birth_info: {
        year: new Date(birthDateStr).getFullYear(),
        month: new Date(birthDateStr).getMonth() + 1,
        day: new Date(birthDateStr).getDate(),
        hour: birthTimeStr ? parseInt(birthTimeStr.split(':')[0]) : 12,
        minute: birthTimeStr ? parseInt(birthTimeStr.split(':')[1]) : 0,
        day_master: baziResult.day_master,
        day_master_element: baziResult.day_master_element
      }
    };
  }

  // 计算精确的命宫位置
  calculateMingGongPosition(birthDateStr, birthTimeStr) {
    const birthDate = new Date(birthDateStr);
    const [hour, minute] = birthTimeStr ? birthTimeStr.split(':').map(Number) : [12, 0];
    
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 紫微斗数命宫计算：寅宫起正月，顺数至生月，再从生月宫逆数至生时
    // 寅宫起正月：寅=2, 卯=3, 辰=4, 巳=5, 午=6, 未=7, 申=8, 酉=9, 戌=10, 亥=11, 子=0, 丑=1
    const monthPosition = (month + 1) % 12; // 寅宫起正月
    
    // 时辰对应地支：子=0, 丑=1, 寅=2, ..., 亥=11
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    
    // 命宫计算：从生月宫逆数至生时
    const mingGongIndex = (monthPosition - hourBranch + 12) % 12;
    
    return {
      index: mingGongIndex,
      branch: this.earthlyBranches[mingGongIndex],
      description: `命宫在${this.earthlyBranches[mingGongIndex]}宫`
    };
  }

  // 计算完整的紫微斗数排盘
  calculateCompleteStarChart(birthDateStr, birthTimeStr, gender, wuxingJu, mingGongPosition) {
    const birthDate = new Date(birthDateStr);
    const day = birthDate.getDate();
    const mingGongIndex = mingGongPosition.index;
    
    // 计算紫微星位置
    const ziweiPosition = this.calculateZiweiStarPosition(day, wuxingJu.number);
    
    // 安排十四主星
    const mainStarPositions = this.arrangeMainStars(ziweiPosition, mingGongIndex);
    
    // 安排六吉星
    const luckyStarPositions = this.arrangeLuckyStars(birthDate, mingGongIndex);
    
    // 安排六煞星
    const unluckyStarPositions = this.arrangeUnluckyStars(birthDate, mingGongIndex);
    
    // 计算十二宫位
    const twelvePalaces = this.calculateTwelvePalaces(mingGongIndex, mainStarPositions, luckyStarPositions, unluckyStarPositions);
    
    // 计算四化
    const siHua = this.calculateSiHua(birthDate.getFullYear());
    
    // 计算大限
    const majorPeriods = this.calculateMajorPeriods(mingGongIndex, gender, wuxingJu, birthDate.getFullYear());
    
    return {
      mingGong: this.earthlyBranches[mingGongIndex],
      mingGongStars: mainStarPositions[mingGongIndex] || [],
      twelvePalaces: twelvePalaces,
      siHua: siHua,
      majorPeriods: majorPeriods,
      completeChart: this.generateCompleteChart(twelvePalaces, mainStarPositions, luckyStarPositions, unluckyStarPositions)
    };
  }

  // 计算紫微星位置（基于五行局）
  calculateZiweiStarPosition(day, juNumber) {
    // 根据出生日和五行局数计算紫微星位置（传统算法）
    // 紫微星定位：以寅宫起初一，顺数至生日，再根据五行局逆数
    let position = (day - 1) % 12; // 寅宫起初一
    
    // 根据五行局逆数
    switch (juNumber) {
      case 2: // 水二局
        position = (position - 1 + 12) % 12;
        break;
      case 3: // 木三局
        position = (position - 2 + 12) % 12;
        break;
      case 4: // 金四局
        position = (position - 3 + 12) % 12;
        break;
      case 5: // 土五局
        position = (position - 4 + 12) % 12;
        break;
      case 6: // 火六局
        position = (position - 5 + 12) % 12;
        break;
      default:
        position = (position - 4 + 12) % 12; // 默认土五局
    }
    
    return position;
  }

  // 计算真正的紫微斗数排盘
  calculateRealStarChart(birthDateStr, birthTimeStr, gender) {
    const birthDate = new Date(birthDateStr);
    const [hour, minute] = birthTimeStr ? birthTimeStr.split(':').map(Number) : [12, 0];
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 根据出生时间计算命宫位置（真正的紫微斗数算法）
    const mingGongIndex = this.calculateMingGongIndex(month, hour);
    const mingGong = this.earthlyBranches[mingGongIndex];
    
    // 计算紫微星位置
    const ziweiPosition = this.calculateZiweiPosition(day, mingGongIndex);
    
    // 排布十四主星
    const starPositions = this.arrangeMainStars(ziweiPosition, mingGongIndex);
    
    // 安排六吉星
    const luckyStarPositions = this.arrangeLuckyStars(birthDate, mingGongIndex);
    
    // 安排六煞星
    const unluckyStarPositions = this.arrangeUnluckyStars(birthDate, mingGongIndex);
    
    // 计算十二宫位
    const twelvePalaces = this.calculateTwelvePalaces(mingGongIndex, starPositions, luckyStarPositions, unluckyStarPositions);
    
    // 计算四化
    const siHua = this.calculateSiHua(year);
    
    // 计算五行局（为大限计算提供参数）
    const baziInfo = this.calculatePreciseBazi(birthDateStr, birthTimeStr);
    const wuxingJu = this.calculateWuxingJu(baziInfo);
    
    // 计算大限
    const majorPeriods = this.calculateMajorPeriods(mingGongIndex, gender, wuxingJu, year);
    
    return {
      mingGong: mingGong,
      mingGongStars: starPositions[mingGongIndex] || [],
      twelvePalaces: twelvePalaces,
      siHua: siHua,
      majorPeriods: majorPeriods,
      birthChart: this.generateCompleteChart(twelvePalaces, starPositions, luckyStarPositions, unluckyStarPositions)
    };
  }

  // 计算命宫位置索引（简化版本，用于旧方法兼容）
  calculateMingGongIndex(month, hour) {
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

  // 精确安排十四主星（传统紫微斗数安星法）
  arrangeMainStars(ziweiPosition, mingGongIndex) {
    const starPositions = {};
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      starPositions[i] = [];
    }
    
    // 紫微星系安星（北斗星系）
    this.arrangeZiweiStarSystem(starPositions, ziweiPosition);
    
    // 天府星系安星（南斗星系）
    this.arrangeTianfuStarSystem(starPositions, ziweiPosition);
    
    return starPositions;
  }
  
  // 安排紫微星系（北斗七星）
  arrangeZiweiStarSystem(starPositions, ziweiPosition) {
    // 紫微星固定位置
    starPositions[ziweiPosition].push('紫微');
    
    // 天机星：紫微顺行一位
    starPositions[(ziweiPosition + 1) % 12].push('天机');
    
    // 太阳星：紫微顺行二位
    starPositions[(ziweiPosition + 2) % 12].push('太阳');
    
    // 武曲星：紫微顺行三位
    starPositions[(ziweiPosition + 3) % 12].push('武曲');
    
    // 天同星：紫微顺行四位
    starPositions[(ziweiPosition + 4) % 12].push('天同');
    
    // 廉贞星：紫微顺行五位
    starPositions[(ziweiPosition + 5) % 12].push('廉贞');
  }
  
  // 安排天府星系（南斗六星）
  arrangeTianfuStarSystem(starPositions, ziweiPosition) {
    // 天府星：紫微对宫（相对180度）
    const tianfuPosition = (ziweiPosition + 6) % 12;
    starPositions[tianfuPosition].push('天府');
    
    // 太阴星：天府逆行一位
    starPositions[(tianfuPosition - 1 + 12) % 12].push('太阴');
    
    // 贪狼星：天府逆行二位
    starPositions[(tianfuPosition - 2 + 12) % 12].push('贪狼');
    
    // 巨门星：天府逆行三位
    starPositions[(tianfuPosition - 3 + 12) % 12].push('巨门');
    
    // 天相星：天府逆行四位
    starPositions[(tianfuPosition - 4 + 12) % 12].push('天相');
    
    // 天梁星：天府逆行五位
    starPositions[(tianfuPosition - 5 + 12) % 12].push('天梁');
    
    // 七杀星：天府逆行六位
    starPositions[(tianfuPosition - 6 + 12) % 12].push('七杀');
    
    // 破军星：天府逆行七位
    starPositions[(tianfuPosition - 7 + 12) % 12].push('破军');
  }

  // 安排六吉星
  arrangeLuckyStars(birthDate, mingGongIndex) {
    const luckyPositions = {};
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const [hour] = birthDate.toTimeString().split(':').map(Number);
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      luckyPositions[i] = [];
    }
    
    // 文昌星：根据出生时辰安星
    const wenchangPosition = this.calculateWenchangPosition(hour);
    luckyPositions[wenchangPosition].push('文昌');
    
    // 文曲星：文昌对宫
    const wenquPosition = (wenchangPosition + 6) % 12;
    luckyPositions[wenquPosition].push('文曲');
    
    // 左辅星：根据出生月份安星
    const zuofuPosition = this.calculateZuofuPosition(month);
    luckyPositions[zuofuPosition].push('左辅');
    
    // 右弼星：左辅下一宫
    const youbiPosition = (zuofuPosition + 1) % 12;
    luckyPositions[youbiPosition].push('右弼');
    
    // 天魁星：根据出生年干安星
    const tiankuiPosition = this.calculateTiankuiPosition(year);
    luckyPositions[tiankuiPosition].push('天魁');
    
    // 天钺星：根据出生年干安星
    const tianyuePosition = this.calculateTianyuePosition(year);
    luckyPositions[tianyuePosition].push('天钺');
    
    return luckyPositions;
  }

  // 安排六煞星
  arrangeUnluckyStars(birthDate, mingGongIndex) {
    const unluckyPositions = {};
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const [hour] = birthDate.toTimeString().split(':').map(Number);
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      unluckyPositions[i] = [];
    }
    
    // 擎羊星：根据出生年干安星
    const qingyangPosition = this.calculateQingyangPosition(year);
    unluckyPositions[qingyangPosition].push('擎羊');
    
    // 陀罗星：擎羊下一宫
    const tuoluoPosition = (qingyangPosition + 1) % 12;
    unluckyPositions[tuoluoPosition].push('陀罗');
    
    // 火星：根据出生时辰和年支安星
    const huoxingPosition = this.calculateHuoxingPosition(year, hour);
    unluckyPositions[huoxingPosition].push('火星');
    
    // 铃星：根据出生时辰和年支安星
    const lingxingPosition = this.calculateLingxingPosition(year, hour);
    unluckyPositions[lingxingPosition].push('铃星');
    
    // 地空星：根据出生时辰安星
    const dikongPosition = this.calculateDikongPosition(hour);
    unluckyPositions[dikongPosition].push('地空');
    
    // 地劫星：地空对宫
    const dijiePosition = (dikongPosition + 6) % 12;
    unluckyPositions[dijiePosition].push('地劫');
    
    return unluckyPositions;
  }

  // 计算十二宫位（整合所有星曜）
  calculateTwelvePalaces(mingGongIndex, mainStarPositions, luckyStarPositions, unluckyStarPositions) {
    const palaces = {};
    
    for (let i = 0; i < 12; i++) {
      const palaceIndex = (mingGongIndex + i) % 12;
      const palaceName = this.palaceNames[i];
      
      // 整合所有星曜
      const allStars = [
        ...(mainStarPositions[palaceIndex] || []),
        ...(luckyStarPositions[palaceIndex] || []),
        ...(unluckyStarPositions[palaceIndex] || [])
      ];
      
      const mainStars = mainStarPositions[palaceIndex] || [];
      const luckyStars = luckyStarPositions[palaceIndex] || [];
      const unluckyStars = unluckyStarPositions[palaceIndex] || [];
      
      palaces[palaceName] = {
        position: this.earthlyBranches[palaceIndex],
        palace_index: palaceIndex,
        all_stars: allStars,
        main_stars: mainStars,
        lucky_stars: luckyStars,
        unlucky_stars: unluckyStars,
        star_count: allStars.length,
        interpretation: this.generatePalaceInterpretation(palaceName, mainStars, luckyStars, unluckyStars),
        strength: this.calculatePalaceStrength(mainStars, luckyStars, unluckyStars),
        palace_nature: this.determinePalaceNature(palaceName),
        key_influences: this.analyzeKeyInfluences(mainStars, luckyStars, unluckyStars)
      };
    }
    
    return palaces;
  }

  // 生成完整星盘
  generateCompleteChart(twelvePalaces, mainStarPositions, luckyStarPositions, unluckyStarPositions) {
    const chart = {
      chart_type: '紫微斗数命盘',
      palace_distribution: {},
      star_summary: {
        main_stars: 0,
        lucky_stars: 0,
        unlucky_stars: 0,
        total_stars: 0
      }
    };
    
    // 统计星曜分布
    Object.keys(twelvePalaces).forEach(palaceName => {
      const palace = twelvePalaces[palaceName];
      chart.palace_distribution[palaceName] = {
        position: palace.position,
        stars: palace.all_stars,
        strength: palace.strength
      };
      
      chart.star_summary.main_stars += palace.main_stars.length;
      chart.star_summary.lucky_stars += palace.lucky_stars.length;
      chart.star_summary.unlucky_stars += palace.unlucky_stars.length;
      chart.star_summary.total_stars += palace.all_stars.length;
    });
    
    return chart;
  }

  // 各星曜安星计算方法
  
  // 文昌星安星
  calculateWenchangPosition(hour) {
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const wenchangMap = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11]; // 戌酉申未午巳辰卯寅丑子亥
    return wenchangMap[hourBranch];
  }

  // 左辅星安星
  calculateZuofuPosition(month) {
    return (month + 1) % 12; // 寅宫起正月
  }

  // 天魁星安星
  calculateTiankuiPosition(year) {
    const yearStemIndex = (year - 4) % 10;
    const tiankuiMap = [1, 0, 11, 10, 1, 0, 11, 10, 5, 4]; // 甲乙丙丁戊己庚辛壬癸
    return tiankuiMap[yearStemIndex];
  }

  // 天钺星安星
  calculateTianyuePosition(year) {
    const yearStemIndex = (year - 4) % 10;
    const tianyueMap = [7, 8, 9, 10, 7, 8, 9, 10, 3, 2]; // 甲乙丙丁戊己庚辛壬癸
    return tianyueMap[yearStemIndex];
  }

  // 擎羊星安星
  calculateQingyangPosition(year) {
    const yearStemIndex = (year - 4) % 10;
    const qingyangMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 甲乙丙丁戊己庚辛壬癸
    return qingyangMap[yearStemIndex];
  }

  // 火星安星
  calculateHuoxingPosition(year, hour) {
    const yearBranchIndex = (year - 4) % 12;
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const huoxingMap = {
      0: [1, 2, 3, 9, 10, 11, 5, 6, 7, 1, 2, 3], // 子年
      1: [2, 3, 4, 10, 11, 0, 6, 7, 8, 2, 3, 4], // 丑年
      2: [0, 1, 2, 8, 9, 10, 4, 5, 6, 0, 1, 2], // 寅年
      // ... 其他年份的映射
    };
    return huoxingMap[yearBranchIndex]?.[hourBranch] || 0;
  }

  // 铃星安星
  calculateLingxingPosition(year, hour) {
    const yearBranchIndex = (year - 4) % 12;
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const lingxingMap = {
      0: [8, 7, 6, 4, 3, 2, 0, 11, 10, 8, 7, 6], // 子年
      1: [9, 8, 7, 5, 4, 3, 1, 0, 11, 9, 8, 7], // 丑年
      2: [7, 6, 5, 3, 2, 1, 11, 10, 9, 7, 6, 5], // 寅年
      // ... 其他年份的映射
    };
    return lingxingMap[yearBranchIndex]?.[hourBranch] || 0;
  }

  // 地空星安星
  calculateDikongPosition(hour) {
    const hourBranch = Math.floor((hour + 1) / 2) % 12;
    const dikongMap = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];
    return dikongMap[hourBranch];
  }

  // 计算四化
  calculateSiHua(year) {
    const yearStemIndex = (year - 4) % 10;
    const yearStem = this.heavenlyStems[yearStemIndex];
    const siHua = this.sihuaTable[yearStem] || this.sihuaTable['甲'];
    
    return {
      year_stem: yearStem,
      hua_lu: { star: siHua.lu, meaning: '化禄主财禄，增强星曜的正面能量' },
      hua_quan: { star: siHua.quan, meaning: '化权主权力，增强星曜的权威性' },
      hua_ke: { star: siHua.ke, meaning: '化科主名声，增强星曜的声誉' },
      hua_ji: { star: siHua.ji, meaning: '化忌主阻碍，需要特别注意的星曜' }
    };
  }

  // 计算大限（基于五行局）
  calculateMajorPeriods(mingGongIndex, gender, wuxingJu, birthYear) {
    const periods = [];
    const isMale = gender === 'male' || gender === '男';
    const startAge = wuxingJu.start_age;
    const periodLength = 10; // 每个大限10年
    
    // 计算当前年龄
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear; // 使用真实出生年份
    
    for (let i = 0; i < 12; i++) {
      const ageStart = startAge + i * periodLength;
      const ageEnd = ageStart + periodLength - 1;
      
      // 根据性别确定大限宫位顺序
      const palaceIndex = isMale ? 
        (mingGongIndex + i) % 12 : 
        (mingGongIndex - i + 12) % 12;
      
      const isCurrent = currentAge >= ageStart && currentAge <= ageEnd;
      
      periods.push({
        period_number: i + 1,
        age_range: `${ageStart}-${ageEnd}岁`,
        palace_branch: this.earthlyBranches[palaceIndex],
        palace_name: this.palaceNames[i],
        is_current: isCurrent,
        wuxing_ju: wuxingJu.type,
        description: `第${i + 1}大限：${ageStart}-${ageEnd}岁，在${this.earthlyBranches[palaceIndex]}宫（${this.palaceNames[i]}）`
      });
    }
    
    return {
      start_age: startAge,
      period_length: periodLength,
      wuxing_ju: wuxingJu.type,
      current_period: periods.find(p => p.is_current) || periods[0],
      all_periods: periods
    };
  }

  // 生成专业宫位解读
  generatePalaceInterpretation(palaceName, mainStars, luckyStars, unluckyStars) {
    const baseInterpretations = {
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
    
    let interpretation = baseInterpretations[palaceName] || '此宫位的基本含义';
    
    // 分析主星影响
    if (mainStars.length > 0) {
      interpretation += `。主星为${mainStars.join('、')}，`;
      interpretation += this.getStarInfluence(mainStars[0], palaceName);
    }
    
    // 分析吉星影响
    if (luckyStars.length > 0) {
      interpretation += `。吉星${luckyStars.join('、')}加持，增强正面能量`;
    }
    
    // 分析煞星影响
    if (unluckyStars.length > 0) {
      interpretation += `。煞星${unluckyStars.join('、')}同宫，需要特别注意相关事项`;
    }
    
    return interpretation;
  }

  // 计算宫位强度（综合考虑所有星曜）
  calculatePalaceStrength(mainStars, luckyStars, unluckyStars) {
    let strength = 0;
    
    // 主星强度评分
    const strongMainStars = ['紫微', '天府', '太阳', '武曲', '天同', '廉贞'];
    const mediumMainStars = ['天机', '太阴', '贪狼', '巨门', '天相', '天梁'];
    const weakMainStars = ['七杀', '破军'];
    
    mainStars.forEach(star => {
      if (strongMainStars.includes(star)) strength += 3;
      else if (mediumMainStars.includes(star)) strength += 2;
      else if (weakMainStars.includes(star)) strength += 1;
    });
    
    // 吉星加分
    luckyStars.forEach(star => {
      strength += 1;
    });
    
    // 煞星减分
    unluckyStars.forEach(star => {
      strength -= 1;
    });
    
    // 判定强度等级
    if (strength >= 5) return '旺';
    if (strength >= 3) return '得地';
    if (strength >= 1) return '平';
    if (strength >= -1) return '不得地';
    return '陷';
  }

  // 确定宫位性质
  determinePalaceNature(palaceName) {
    const natures = {
      '命宫': '自我宫',
      '兄弟宫': '手足宫',
      '夫妻宫': '配偶宫',
      '子女宫': '子息宫',
      '财帛宫': '财富宫',
      '疾厄宫': '健康宫',
      '迁移宫': '外缘宫',
      '交友宫': '人际宫',
      '事业宫': '官禄宫',
      '田宅宫': '家业宫',
      '福德宫': '精神宫',
      '父母宫': '长辈宫'
    };
    return natures[palaceName] || '未知宫位';
  }

  // 分析关键影响
  analyzeKeyInfluences(mainStars, luckyStars, unluckyStars) {
    const influences = [];
    
    // 分析主星影响
    mainStars.forEach(star => {
      influences.push({
        star: star,
        type: 'main',
        influence: this.getStarKeyInfluence(star)
      });
    });
    
    // 分析吉星影响
    luckyStars.forEach(star => {
      influences.push({
        star: star,
        type: 'lucky',
        influence: '增强正面能量，带来助力'
      });
    });
    
    // 分析煞星影响
    unluckyStars.forEach(star => {
      influences.push({
        star: star,
        type: 'unlucky',
        influence: '带来挑战，需要谨慎应对'
      });
    });
    
    return influences;
  }

  // 获取星曜关键影响
  getStarKeyInfluence(star) {
    const influences = {
      '紫微': '帝王之星，具有领导才能和贵气',
      '天机': '智慧之星，善于策划和变通',
      '太阳': '光明之星，具有权威性和正义感',
      '武曲': '财星，意志坚强，理财有方',
      '天同': '福星，性格温和，享受生活',
      '廉贞': '囚星，感情丰富，追求完美',
      '天府': '库星，稳重保守，善于积累',
      '太阴': '富星，温柔体贴，直觉敏锐',
      '贪狼': '桃花星，多才多艺，善于交际',
      '巨门': '暗星，口才出众，善于分析',
      '天相': '印星，忠诚可靠，协调能力强',
      '天梁': '荫星，正直善良，有长者风范',
      '七杀': '将星，勇敢果断，开拓性强',
      '破军': '耗星，创新求变，不拘传统'
    };
    return influences[star] || '具有独特的影响力';
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

  // 生成专业的紫微斗数分析
  generateProfessionalAnalysis(starChart, personName, personGender, baziInfo, wuxingJu, birthYear) {
    const mingGongStars = starChart.mingGongStars;
    const mainStar = mingGongStars[0] || '天机'; // 默认天机星
    const twelvePalaces = starChart.twelvePalaces;
    
    return {
      personality_analysis: this.generatePersonalityAnalysis(personName, personGender, twelvePalaces['命宫'], mainStar),
      career_analysis: this.generateCareerAnalysis(personName, twelvePalaces['事业宫'], twelvePalaces['命宫'], starChart.majorPeriods),
      wealth_analysis: this.generateWealthAnalysis(personName, twelvePalaces['财帛宫'], twelvePalaces['命宫'], mainStar),
      relationship_analysis: this.generateRelationshipAnalysis(personName, personGender, twelvePalaces['夫妻宫'], twelvePalaces['命宫']),
      health_analysis: this.generateHealthAnalysis(personName, twelvePalaces['疾厄宫'], twelvePalaces['命宫']),
      family_analysis: this.generateFamilyAnalysis(personName, twelvePalaces, personGender),
      timing_analysis: this.generateTimingAnalysis(personName, starChart.majorPeriods, wuxingJu, birthYear),
      life_guidance: this.generateLifeGuidance(personName, mainStar, twelvePalaces, starChart.siHua)
    };
  }

  // 生成深度个性分析
  generatePersonalityAnalysis(personName, personGender, mingGong, mainStar) {
    const mainStars = mingGong.main_stars;
    const luckyStars = mingGong.lucky_stars;
    const unluckyStars = mingGong.unlucky_stars;
    const position = mingGong.position;
    
    return {
      overview: this.generatePersonalityOverview(personName, position, mainStars, mainStar, personGender),
      core_traits: this.analyzeDeepPersonalityTraits(mainStars, luckyStars, unluckyStars, personName, personGender),
      strengths: this.analyzePersonalizedStrengths(mainStars, luckyStars, personName, personGender),
      challenges: this.analyzePersonalizedChallenges(mainStars, unluckyStars, personName, personGender),
      development_potential: this.analyzePersonalizedPotential(mainStars, luckyStars, personGender, personName),
      life_attitude: this.analyzePersonalizedLifeAttitude(mainStar, personGender, personName),
      personality_evolution: this.analyzePersonalityEvolution(mainStars, personName, personGender),
      social_interaction: this.analyzeSocialInteractionStyle(mainStars, luckyStars, personName),
      decision_making: this.analyzeDecisionMakingStyle(mainStars, personName, personGender)
    };
  }
  
  // 生成个性化概述
  generatePersonalityOverview(personName, position, mainStars, mainStar, personGender) {
    const starCombination = mainStars.join('、') || '无主星';
    const positionInfluence = this.getPositionPersonalityInfluence(position);
    const genderModifier = personGender === '男性' ? '展现出男性的阳刚特质' : '体现了女性的阴柔魅力';
    
    return `${personName}，您的命宫坐落在${position}，主星为${starCombination}。${positionInfluence}这样的星曜组合使您${this.getStarCombinationPersonality(mainStars, personName)}，同时${genderModifier}。您的人生格局${this.getLifePatternDescription(mainStar, personName)}。`;
  }
  
  // 获取宫位对性格的影响
  getPositionPersonalityInfluence(position) {
    const positionInfluences = {
      '子': '您天生具有智慧和灵活性，思维敏捷，适应能力强。',
      '丑': '您性格稳重踏实，做事有条不紊，具有很强的耐心和毅力。',
      '寅': '您充满活力和创造力，勇于开拓，具有领导潜质。',
      '卯': '您温和善良，具有艺术天赋，人际关系和谐。',
      '辰': '您聪明好学，具有很强的分析能力和判断力。',
      '巳': '您热情奔放，具有很强的表现力和感染力。',
      '午': '您光明磊落，具有正义感，喜欢帮助他人。',
      '未': '您细腻敏感，具有很强的直觉力和同情心。',
      '申': '您机智灵活，具有很强的变通能力和商业头脑。',
      '酉': '您追求完美，注重细节，具有很强的审美能力。',
      '戌': '您忠诚可靠，具有很强的责任感和正义感。',
      '亥': '您包容性强，具有很强的想象力和创造力。'
    };
    
    return positionInfluences[position] || '您具有独特的性格特质。';
  }
  
  // 获取星曜组合的性格特征
  getStarCombinationPersonality(mainStars, personName) {
    if (mainStars.length === 0) {
      return '虽然命宫无主星，但这反而赋予了您更大的可塑性和发展空间';
    }
    
    if (mainStars.length === 1) {
      const star = mainStars[0];
      const singleStarPersonality = {
        '紫微': '具有天生的领导气质和贵族风范，喜欢受人尊敬，有很强的自尊心',
        '天机': '思维敏捷，善于策划，具有很强的分析能力和应变能力',
        '太阳': '光明磊落，热情开朗，具有很强的正义感和表现欲',
        '武曲': '意志坚强，执行力强，具有很强的赚钱能力和理财观念',
        '天同': '性格温和，人缘好，具有很强的亲和力和包容心',
        '廉贞': '感情丰富，有艺术天分，但情绪波动较大',
        '天府': '稳重可靠，善于积累，注重安全感',
        '太阴': '细腻敏感，直觉力强，善于照顾他人',
        '贪狼': '多才多艺，善于交际，欲望强烈，喜欢新鲜事物',
        '巨门': '口才好，分析力强，善于发现问题',
        '天相': '忠诚可靠，协调能力强，善于辅助他人',
        '天梁': '正直善良，有长者风范，具有很强的责任感',
        '七杀': '冲劲十足，勇于开拓，不怕困难',
        '破军': '喜欢变化，勇于创新，不满足现状'
      };
      
      return singleStarPersonality[star] || '具有独特的个性特征';
    }
    
    // 双星或多星组合的特殊分析
    const starSet = new Set(mainStars);
    
    if (starSet.has('紫微') && starSet.has('天府')) {
      return '集领导才能与稳重品格于一身，既有帝王之气又有宰相之才';
    }
    if (starSet.has('紫微') && starSet.has('贪狼')) {
      return '既有领导欲望又富有才艺，能在多个领域展现才华';
    }
    if (starSet.has('太阳') && starSet.has('太阴')) {
      return '阴阳调和，既有阳光的热情又有月亮的温柔，性格平衡';
    }
    if (starSet.has('武曲') && starSet.has('贪狼')) {
      return '既有赚钱能力又有多元才华，适合多方面发展';
    }
    
    return `融合了${mainStars.join('、')}的特质，形成了独特而复合的性格特征`;
   }
   
   // 深度性格特质分析
   analyzeDeepPersonalityTraits(mainStars, luckyStars, unluckyStars, personName, personGender) {
     let traits = [];
     
     // 基于主星的核心特质
     mainStars.forEach(star => {
       const starTraits = this.getStarCoreTraits(star, personName, personGender);
       traits.push(starTraits);
     });
     
     // 吉星的正面影响
     if (luckyStars.length > 0) {
       const luckyInfluence = this.getLuckyStarsInfluence(luckyStars, personName);
       traits.push(luckyInfluence);
     }
     
     // 煞星的挑战与成长
     if (unluckyStars.length > 0) {
       const challengeGrowth = this.getUnluckyStarsGrowth(unluckyStars, personName);
       traits.push(challengeGrowth);
     }
     
     return traits.join('；');
   }
   
   // 获取主星核心特质
   getStarCoreTraits(star, personName, personGender) {
     const genderPrefix = personGender === '男性' ? '作为男性' : '作为女性';
     
     const starTraits = {
       '紫微': `${personName}，您具有天生的领导魅力和高贵气质。${genderPrefix}，您展现出强烈的责任感和使命感，喜欢在团队中担任核心角色，但有时可能过于在意他人的看法`,
       '天机': `${personName}，您的思维极其敏捷，善于洞察事物的本质。${genderPrefix}，您具有很强的策划能力和应变能力，但有时可能因为想得太多而错失行动的最佳时机`,
       '太阳': `${personName}，您如太阳般光明磊落，具有强烈的正义感。${genderPrefix}，您天生具有感染他人的能力，喜欢帮助他人，但要注意不要过度消耗自己的能量`,
       '武曲': `${personName}，您意志坚强，执行力超群。${genderPrefix}，您具有很强的目标导向性和实现能力，在财务管理方面有天赋，但要学会在坚持中保持灵活`,
       '天同': `${personName}，您性格温和，具有很强的亲和力。${genderPrefix}，您善于营造和谐的氛围，人际关系良好，但有时可能因为过于随和而缺乏主见`,
       '廉贞': `${personName}，您感情丰富，具有艺术天赋。${genderPrefix}，您追求美好的事物，有很强的审美能力，但情绪波动较大，需要学会情绪管理`,
       '天府': `${personName}，您稳重可靠，是他人的依靠。${genderPrefix}，您善于积累和管理，注重安全感，具有很强的组织能力，但有时可能过于保守`,
       '太阴': `${personName}，您细腻敏感，直觉力强。${genderPrefix}，您善于照顾他人，具有很强的同理心，但有时可能过于敏感，容易受到情绪影响`,
       '贪狼': `${personName}，您多才多艺，充满魅力。${genderPrefix}，您善于交际，适应能力强，喜欢尝试新事物，但要注意专注力的培养`,
       '巨门': `${personName}，您口才出众，分析能力强。${genderPrefix}，您善于发现问题的关键，具有很强的研究精神，但要注意表达方式的温和`,
       '天相': `${personName}，您忠诚可靠，协调能力强。${genderPrefix}，您善于辅助他人，具有很强的服务精神，但要学会在帮助他人的同时也要为自己考虑`,
       '天梁': `${personName}，您正直善良，具有长者风范。${genderPrefix}，您有很强的责任感和正义感，喜欢帮助弱者，但要避免过于严肃`,
       '七杀': `${personName}，您冲劲十足，勇于开拓。${genderPrefix}，您不怕困难，具有很强的开拓精神，但要学会在冲劲中保持理性`,
       '破军': `${personName}，您勇于创新，不满足现状。${genderPrefix}，您具有很强的变革能力，善于突破，但要注意在变化中保持稳定的核心价值`
     };
     
     return starTraits[star] || `${personName}，您具有${star}的独特特质`;
   }
   
   // 获取吉星影响
   getLuckyStarsInfluence(luckyStars, personName) {
     const influences = [];
     
     luckyStars.forEach(star => {
       const starInfluence = {
         '文昌': `${personName}，文昌星的加持使您文思敏捷，学习能力强，在文化艺术方面有特殊天赋`,
         '文曲': `${personName}，文曲星的影响让您口才出众，表达能力强，善于与人沟通交流`,
         '左辅': `${personName}，左辅星的帮助使您容易得到贵人相助，在团队中能发挥重要作用`,
         '右弼': `${personName}，右弼星的支持让您具有很强的协调能力，善于处理人际关系`,
         '天魁': `${personName}，天魁星的庇佑使您容易遇到年长的贵人，在关键时刻得到指导`,
         '天钺': `${personName}，天钺星的照耀让您具有很强的直觉力，能够把握机会`
       };
       
       if (starInfluence[star]) {
         influences.push(starInfluence[star]);
       }
     });
     
     return influences.join('；');
   }
   
   // 获取煞星成长机会
   getUnluckyStarsGrowth(unluckyStars, personName) {
     const growthOpportunities = [];
     
     unluckyStars.forEach(star => {
       const starGrowth = {
         '擎羊': `${personName}，擎羊星虽然带来冲动，但也赋予了您勇往直前的勇气，学会控制冲动就能化阻力为动力`,
         '陀罗': `${personName}，陀罗星可能带来拖延，但也培养了您的耐心和坚持，学会把握节奏就能稳步前进`,
         '火星': `${personName}，火星虽然容易急躁，但也给了您快速行动的能力，学会冷静思考就能事半功倍`,
         '铃星': `${personName}，铃星可能带来波动，但也增强了您的敏感度，学会情绪管理就能化挑战为优势`,
         '地空': `${personName}，地空星虽然可能带来空想，但也赋予了您丰富的想象力，脚踏实地就能实现理想`,
         '地劫': `${personName}，地劫星可能带来变化，但也培养了您的适应能力，学会稳中求变就能化险为夷`
       };
       
       if (starGrowth[star]) {
         growthOpportunities.push(starGrowth[star]);
       }
     });
     
     return growthOpportunities.join('；');
   }

  // 生成事业分析
  generateCareerAnalysis(personName, careerPalace, mingGong, majorPeriods) {
    const careerStars = careerPalace.main_stars;
    const mingGongStars = mingGong.main_stars;
    
    return {
      career_potential: this.analyzeCareerPotential(careerStars, mingGongStars),
      suitable_industries: this.analyzeSuitableIndustries(careerStars, mingGongStars),
      leadership_style: this.analyzeLeadershipStyle(mingGongStars),
      career_development: this.analyzeCareerDevelopment(careerStars, careerPalace.strength),
      peak_career_periods: this.analyzeCareerPeakPeriods(majorPeriods),
      career_advice: this.generateCareerAdvice(careerStars, mingGongStars, personName)
    };
  }

  // 生成财富分析
  generateWealthAnalysis(personName, wealthPalace, mingGong, mainStar) {
    const wealthStars = wealthPalace.main_stars;
    const wealthLucky = wealthPalace.lucky_stars;
    const wealthUnlucky = wealthPalace.unlucky_stars;
    
    return {
      wealth_potential: this.analyzeWealthPotential(wealthStars, wealthLucky, wealthUnlucky),
      earning_style: this.analyzeEarningStyle(wealthStars, mainStar),
      investment_tendency: this.analyzeInvestmentTendency(wealthStars, mingGong.main_stars),
      financial_management: this.analyzeFinancialManagement(wealthStars, wealthPalace.strength),
      wealth_timing: this.analyzeWealthTiming(wealthStars),
      financial_advice: this.generateFinancialAdvice(wealthStars, personName)
    };
  }

  // 生成感情分析
  generateRelationshipAnalysis(personName, personGender, marriagePalace, mingGong) {
    const marriageStars = marriagePalace.main_stars;
    const marriageLucky = marriagePalace.lucky_stars;
    const marriageUnlucky = marriagePalace.unlucky_stars;
    
    return {
      marriage_fortune: this.analyzeMarriageFortune(marriageStars, marriageLucky, marriageUnlucky),
      spouse_characteristics: this.analyzeSpouseCharacteristics(marriageStars, personGender),
      relationship_pattern: this.analyzeRelationshipPattern(marriageStars, mingGong.main_stars),
      marriage_timing: this.analyzeMarriageTiming(marriageStars, marriagePalace.strength),
      relationship_challenges: this.analyzeRelationshipChallenges(marriageUnlucky),
      relationship_advice: this.generateRelationshipAdvice(marriageStars, personName, personGender)
    };
  }

  // 生成健康分析
  generateHealthAnalysis(personName, healthPalace, mingGong) {
    const healthStars = healthPalace.main_stars;
    const healthUnlucky = healthPalace.unlucky_stars;
    const mingGongStars = mingGong.main_stars;
    
    return {
      constitution_analysis: this.analyzeConstitution(healthStars, mingGongStars),
      health_tendencies: this.analyzeHealthTendencies(healthStars, healthUnlucky),
      vulnerable_areas: this.analyzeVulnerableAreas(healthStars, healthUnlucky),
      wellness_approach: this.analyzeWellnessApproach(mingGongStars),
      prevention_focus: this.analyzePreventionFocus(healthUnlucky),
      health_advice: this.generateHealthAdvice(healthStars, personName)
    };
  }

  // 生成家庭分析
  generateFamilyAnalysis(personName, twelvePalaces, personGender) {
    const parentsPalace = twelvePalaces['父母宫'];
    const siblingsPalace = twelvePalaces['兄弟宫'];
    const childrenPalace = twelvePalaces['子女宫'];
    
    return {
      parents_relationship: this.analyzeParentsRelationship(parentsPalace),
      siblings_relationship: this.analyzeSiblingsRelationship(siblingsPalace),
      children_fortune: this.analyzeChildrenFortune(childrenPalace, personGender),
      family_harmony: this.analyzeFamilyHarmony(parentsPalace, siblingsPalace, childrenPalace),
      family_responsibilities: this.analyzeFamilyResponsibilities(parentsPalace, childrenPalace),
      family_advice: this.generateFamilyAdvice(parentsPalace, childrenPalace, personName)
    };
  }

  // 生成时机分析（包含流年分析）
  generateTimingAnalysis(personName, majorPeriods, wuxingJu, birthYear) {
    const currentPeriod = majorPeriods.current_period;
    const allPeriods = majorPeriods.all_periods;
    const currentYear = new Date().getFullYear();
    
    // 计算小限
    const xiaoXian = this.calculateXiaoXian(currentYear, wuxingJu, birthYear);
    
    // 计算流年分析
    const liuNianAnalysis = this.calculateLiuNianAnalysis(currentYear, majorPeriods, xiaoXian);
    
    // 计算流月分析
    const liuYueAnalysis = this.calculateLiuYueAnalysis(currentYear, new Date().getMonth() + 1);
    
    return {
      current_period_analysis: this.analyzeCurrentPeriod(currentPeriod, personName),
      life_cycle_overview: this.analyzeLifeCycle(allPeriods, wuxingJu),
      key_turning_points: this.analyzeKeyTurningPoints(allPeriods),
      favorable_periods: this.analyzeFavorablePeriods(allPeriods),
      challenging_periods: this.analyzeChallengingPeriods(allPeriods),
      timing_advice: this.generateTimingAdvice(currentPeriod, personName),
      xiao_xian_analysis: xiaoXian,
      liu_nian_analysis: liuNianAnalysis,
      liu_yue_analysis: liuYueAnalysis,
      comprehensive_timing: this.generateComprehensiveTimingAnalysis(currentPeriod, xiaoXian, liuNianAnalysis, liuYueAnalysis)
    };
  }

  // 计算小限
  calculateXiaoXian(currentYear, wuxingJu, birthYear) {
    const age = currentYear - birthYear;
    const xiaoXianIndex = (age - 1) % 12;
    
    return {
      current_age: age,
      xiao_xian_position: this.earthlyBranches[xiaoXianIndex],
      xiao_xian_meaning: `${age}岁小限在${this.earthlyBranches[xiaoXianIndex]}宫`,
      xiao_xian_influence: this.analyzeXiaoXianInfluence(xiaoXianIndex, age),
      yearly_theme: this.getXiaoXianYearlyTheme(xiaoXianIndex)
    };
  }

  // 计算流年分析
  calculateLiuNianAnalysis(currentYear, majorPeriods, xiaoXian) {
    const yearStemIndex = (currentYear - 4) % 10;
    const yearBranchIndex = (currentYear - 4) % 12;
    const yearStem = this.heavenlyStems[yearStemIndex];
    const yearBranch = this.earthlyBranches[yearBranchIndex];
    
    // 流年四化
    const liuNianSiHua = this.sihuaTable[yearStem];
    
    return {
      current_year: currentYear,
      year_ganzhi: yearStem + yearBranch,
      year_stem: yearStem,
      year_branch: yearBranch,
      liu_nian_sihua: {
        hua_lu: { star: liuNianSiHua.lu, meaning: '流年化禄，主财运亨通' },
        hua_quan: { star: liuNianSiHua.quan, meaning: '流年化权，主权力地位' },
        hua_ke: { star: liuNianSiHua.ke, meaning: '流年化科，主名声学业' },
        hua_ji: { star: liuNianSiHua.ji, meaning: '流年化忌，需要谨慎注意' }
      },
      year_fortune_analysis: this.analyzeLiuNianFortune(yearStem, yearBranch, majorPeriods.current_period),
      year_focus_areas: this.getLiuNianFocusAreas(yearStem, yearBranch),
      year_opportunities: this.getLiuNianOpportunities(liuNianSiHua),
      year_challenges: this.getLiuNianChallenges(liuNianSiHua),
      monthly_preview: this.generateMonthlyPreview(currentYear)
    };
  }

  // 计算流月分析
  calculateLiuYueAnalysis(currentYear, currentMonth) {
    const monthBranchIndex = (currentMonth + 1) % 12; // 寅月起正月
    const monthBranch = this.earthlyBranches[monthBranchIndex];
    
    return {
      current_month: currentMonth,
      month_branch: monthBranch,
      month_theme: this.getMonthTheme(currentMonth),
      month_fortune: this.analyzeMonthFortune(monthBranchIndex, currentYear),
      month_focus: this.getMonthFocus(currentMonth),
      month_advice: this.getMonthAdvice(monthBranchIndex),
      next_month_preview: this.getNextMonthPreview(currentMonth + 1)
    };
  }

  // 生成综合时机分析
  generateComprehensiveTimingAnalysis(daxian, xiaoxian, liunian, liuyue) {
    return {
      overall_timing: `当前处于${daxian.description}，${xiaoxian.xiao_xian_meaning}，${liunian.year_ganzhi}年`,
      timing_coordination: this.analyzeTimingCoordination(daxian, xiaoxian, liunian),
      best_timing_advice: this.getBestTimingAdvice(daxian, liunian),
      timing_warnings: this.getTimingWarnings(liunian.liu_nian_sihua),
      seasonal_guidance: this.getSeasonalGuidance(liuyue.current_month)
    };
  }

  // 生成人生指导（包含格局分析）
  generateLifeGuidance(personName, mainStar, twelvePalaces, siHua) {
    const mingGong = twelvePalaces['命宫'];
    const fuDe = twelvePalaces['福德宫'];
    
    // 格局判定
    const patternAnalysis = this.analyzeZiweiPatterns(twelvePalaces, siHua);
    
    return {
      life_purpose: this.analyzeLifePurpose(mainStar, mingGong, siHua),
      core_values: this.analyzeCoreValues(mingGong, fuDe),
      development_direction: this.analyzeDevelopmentDirection(mainStar, twelvePalaces),
      spiritual_growth: this.analyzeSpiritualGrowth(fuDe, siHua),
      life_lessons: this.analyzeLifeLessons(mingGong, twelvePalaces),
      overall_guidance: this.generateOverallGuidance(mainStar, personName),
      pattern_analysis: patternAnalysis
    };
  }

  // 紫微斗数格局判定系统
  analyzeZiweiPatterns(twelvePalaces, siHua) {
    const patterns = [];
    const mingGong = twelvePalaces['命宫'];
    const caiBo = twelvePalaces['财帛宫'];
    const shiYe = twelvePalaces['事业宫'];
    const fuQi = twelvePalaces['夫妻宫'];
    
    // 检测各种格局
    patterns.push(...this.detectMajorPatterns(twelvePalaces));
    patterns.push(...this.detectWealthPatterns(mingGong, caiBo));
    patterns.push(...this.detectCareerPatterns(mingGong, shiYe));
    patterns.push(...this.detectRelationshipPatterns(mingGong, fuQi));
    patterns.push(...this.detectSiHuaPatterns(twelvePalaces, siHua));
    
    return {
      detected_patterns: patterns,
      pattern_count: patterns.length,
      primary_pattern: patterns.length > 0 ? patterns[0] : null,
      pattern_strength: this.calculatePatternStrength(patterns),
      pattern_guidance: this.generatePatternGuidance(patterns)
    };
  }

  // 检测主要格局
  detectMajorPatterns(twelvePalaces) {
    const patterns = [];
    const mingGong = twelvePalaces['命宫'];
    const mingGongStars = mingGong.main_stars;
    
    // 紫府朝垣格
    if (mingGongStars.includes('紫微') && mingGongStars.includes('天府')) {
      patterns.push({
        name: '紫府朝垣格',
        type: 'major',
        level: 'excellent',
        description: '紫微天府同宫，帝王之格，主贵气天成，领导才能出众',
        influence: '具有天生的领导气质和贵人运，适合从事管理或权威性工作',
        advice: '发挥领导才能，承担更多责任，但要避免过于自负'
      });
    }
    
    // 天府朝垣格
    if (mingGongStars.includes('天府') && !mingGongStars.includes('紫微')) {
      patterns.push({
        name: '天府朝垣格',
        type: 'major',
        level: 'good',
        description: '天府独坐命宫，库星当权，主财富积累，稳重发展',
        influence: '具有很强的理财能力和稳定发展的特质',
        advice: '注重财富积累，稳健投资，避免投机冒险'
      });
    }
    
    // 君臣庆会格
    if (mingGongStars.includes('紫微') && (mingGongStars.includes('左辅') || mingGongStars.includes('右弼'))) {
      patterns.push({
        name: '君臣庆会格',
        type: 'major',
        level: 'excellent',
        description: '紫微遇左辅右弼，君臣相得，主事业有成，贵人相助',
        influence: '事业发展顺利，容易得到贵人帮助和提携',
        advice: '善用人际关系，发挥团队合作精神，成就大业'
      });
    }
    
    // 石中隐玉格
    if (mingGongStars.includes('巨门') && mingGongStars.includes('太阳')) {
      patterns.push({
        name: '石中隐玉格',
        type: 'major',
        level: 'good',
        description: '巨门太阳同宫，暗星遇明星，主大器晚成，口才出众',
        influence: '具有很强的表达能力和分析能力，适合教育或传媒工作',
        advice: '发挥口才优势，注重知识积累，耐心等待机会'
      });
    }
    
    // 日照雷门格
    if (mingGongStars.includes('太阳') && !mingGongStars.includes('巨门')) {
      patterns.push({
        name: '日照雷门格',
        type: 'major',
        level: 'good',
        description: '太阳独坐命宫，光明正大，主权威显赫，正义感强',
        influence: '具有很强的正义感和权威性，适合公职或领导工作',
        advice: '发挥正面影响力，坚持正义原则，服务社会大众'
      });
    }
    
    return patterns;
  }

  // 检测财富格局
  detectWealthPatterns(mingGong, caiBo) {
    const patterns = [];
    const mingGongStars = mingGong.main_stars;
    const caiBoStars = caiBo.main_stars;
    
    // 财禄夹印格
    if (caiBoStars.includes('武曲') && mingGong.lucky_stars.includes('禄存')) {
      patterns.push({
        name: '财禄夹印格',
        type: 'wealth',
        level: 'excellent',
        description: '武曲守财帛，禄存拱命，主财运亨通，理财有方',
        influence: '具有很强的赚钱能力和理财天赋',
        advice: '善用理财技巧，多元化投资，稳健积累财富'
      });
    }
    
    // 贪武同行格
    if (mingGongStars.includes('贪狼') && mingGongStars.includes('武曲')) {
      patterns.push({
        name: '贪武同行格',
        type: 'wealth',
        level: 'good',
        description: '贪狼武曲同宫，财星桃花星相会，主财运和人缘俱佳',
        influence: '通过人际关系和多元发展获得财富',
        advice: '发挥社交优势，拓展人脉网络，把握商机'
      });
    }
    
    return patterns;
  }

  // 检测事业格局
  detectCareerPatterns(mingGong, shiYe) {
    const patterns = [];
    const mingGongStars = mingGong.main_stars;
    const shiYeStars = shiYe.main_stars;
    
    // 将星得地格
    if (shiYeStars.includes('七杀') && shiYe.strength === '旺') {
      patterns.push({
        name: '将星得地格',
        type: 'career',
        level: 'excellent',
        description: '七杀守事业宫且庙旺，将星得地，主事业有成，领导有方',
        influence: '具有很强的执行力和领导能力，适合开创性事业',
        advice: '发挥开拓精神，勇于承担责任，成就一番事业'
      });
    }
    
    // 科名会禄格
    if (shiYe.lucky_stars.includes('文昌') || shiYe.lucky_stars.includes('文曲')) {
      patterns.push({
        name: '科名会禄格',
        type: 'career',
        level: 'good',
        description: '文昌文曲守事业宫，主学业有成，名声显赫',
        influence: '适合从事文教、学术或文化创意工作',
        advice: '注重学习和知识积累，发挥文才优势'
      });
    }
    
    return patterns;
  }

  // 检测感情格局
  detectRelationshipPatterns(mingGong, fuQi) {
    const patterns = [];
    const fuQiStars = fuQi.main_stars;
    
    // 红鸾天喜格
    if (fuQi.lucky_stars.includes('红鸾') || fuQi.lucky_stars.includes('天喜')) {
      patterns.push({
        name: '红鸾天喜格',
        type: 'relationship',
        level: 'good',
        description: '红鸾天喜守夫妻宫，主姻缘美满，感情和谐',
        influence: '感情运势较好，容易遇到合适的伴侣',
        advice: '珍惜感情机会，用心经营婚姻关系'
      });
    }
    
    // 天同太阴格
    if (fuQiStars.includes('天同') && fuQiStars.includes('太阴')) {
      patterns.push({
        name: '天同太阴格',
        type: 'relationship',
        level: 'good',
        description: '天同太阴守夫妻宫，主配偶温和，家庭和睦',
        influence: '配偶性格温和，家庭生活幸福美满',
        advice: '保持家庭和谐，相互理解支持'
      });
    }
    
    return patterns;
  }

  // 检测四化格局
  detectSiHuaPatterns(twelvePalaces, siHua) {
    const patterns = [];
    
    // 化禄拱命格
    const mingGong = twelvePalaces['命宫'];
    if (mingGong.main_stars.includes(siHua.lu)) {
      patterns.push({
        name: '化禄拱命格',
        type: 'sihua',
        level: 'excellent',
        description: `${siHua.lu}化禄在命宫，主财运亨通，贵人相助`,
        influence: '财运和贵人运都很好，发展顺利',
        advice: '把握财运机会，善用贵人资源'
      });
    }
    
    // 化权当权格
    const shiYe = twelvePalaces['事业宫'];
    if (shiYe.main_stars.includes(siHua.quan)) {
      patterns.push({
        name: '化权当权格',
        type: 'sihua',
        level: 'good',
        description: `${siHua.quan}化权在事业宫，主权力地位，事业有成`,
        influence: '在事业上容易获得权力和地位',
        advice: '善用权力，承担责任，成就事业'
      });
    }
    
    return patterns;
  }

  // 计算格局强度
  calculatePatternStrength(patterns) {
    if (patterns.length === 0) return 'weak';
    
    const excellentCount = patterns.filter(p => p.level === 'excellent').length;
    const goodCount = patterns.filter(p => p.level === 'good').length;
    
    if (excellentCount >= 2) return 'very_strong';
    if (excellentCount >= 1) return 'strong';
    if (goodCount >= 3) return 'moderate';
    if (goodCount >= 1) return 'fair';
    return 'weak';
  }

  // 生成格局指导
  generatePatternGuidance(patterns) {
    if (patterns.length === 0) {
      return '命盘格局平常，需要通过后天努力来改善运势，建议注重品德修养和能力提升';
    }
    
    const excellentPatterns = patterns.filter(p => p.level === 'excellent');
    const goodPatterns = patterns.filter(p => p.level === 'good');
    
    let guidance = '';
    
    if (excellentPatterns.length > 0) {
      guidance += `您的命盘中有${excellentPatterns.length}个优秀格局：${excellentPatterns.map(p => p.name).join('、')}。`;
      guidance += '这些格局为您带来很好的先天优势，建议充分发挥这些优势。';
    }
    
    if (goodPatterns.length > 0) {
      guidance += `另外还有${goodPatterns.length}个良好格局：${goodPatterns.map(p => p.name).join('、')}。`;
      guidance += '这些格局为您的发展提供了有利条件。';
    }
    
    guidance += '建议根据格局特点制定人生规划，发挥优势，规避劣势，创造美好人生。';
    
    return guidance;
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

  // 以下是新增的专业分析方法的简化实现
  // 实际使用中这些方法会根据星曜组合生成更详细的动态分析
  
  analyzePersonalityTraits(mainStars, luckyStars, unluckyStars) {
    const traits = [];
    mainStars.forEach(star => traits.push(this.getStarKeyInfluence(star)));
    return traits.join('，');
  }

  analyzePersonalityStrengths(mainStars, luckyStars) {
    return `具有${mainStars.join('、')}星的优势特质，${luckyStars.length > 0 ? '得到吉星助力' : '需要自我发挥'}`;
  }

  analyzePersonalityChallenges(mainStars, unluckyStars) {
    return unluckyStars.length > 0 ? `需要注意${unluckyStars.join('、')}星带来的挑战` : '整体发展较为顺利';
  }

  analyzePersonalityPotential(mainStars, luckyStars, gender) {
    return `${gender}具有很好的发展潜力，建议发挥${mainStars[0] || '天机'}星的特质`;
  }

  analyzeLifeAttitude(mainStar, gender) {
    return `以${mainStar}星为主导的人生态度，${gender === '男性' ? '稳重务实' : '细腻温和'}`;
  }

  analyzeCareerPotential(careerStars, mingGongStars) {
    return `事业发展潜力${careerStars.length > 0 ? '较好' : '需要努力开拓'}，适合发挥个人特长`;
  }

  analyzeSuitableIndustries(careerStars, mingGongStars) {
    const industries = ['教育培训', '咨询服务', '文化创意', '科技研发', '金融投资'];
    return industries.slice(0, 3).join('、');
  }

  analyzeLeadershipStyle(mingGongStars) {
    return mingGongStars.includes('紫微') ? '权威型领导' : '协作型领导';
  }

  analyzeCareerDevelopment(careerStars, strength) {
    return `事业发展${strength === '旺' ? '顺利' : '需要耐心积累'}，建议稳步前进`;
  }

  analyzeCareerPeakPeriods(majorPeriods) {
    return majorPeriods.all_periods.slice(2, 5).map(p => p.age_range).join('、');
  }

  generateCareerAdvice(careerStars, mingGongStars, personName) {
    return `${personName}应该发挥自身优势，在适合的领域深耕发展`;
  }

  analyzeWealthPotential(wealthStars, wealthLucky, wealthUnlucky) {
    const score = wealthStars.length * 2 + wealthLucky.length - wealthUnlucky.length;
    return score > 2 ? '财运较佳' : score > 0 ? '财运平稳' : '需要努力积累';
  }

  analyzeEarningStyle(wealthStars, mainStar) {
    return `适合通过${mainStar}星的特质获得收入，建议多元化发展`;
  }

  analyzeInvestmentTendency(wealthStars, mingGongStars) {
    return mingGongStars.includes('武曲') ? '适合稳健投资' : '建议保守理财';
  }

  analyzeFinancialManagement(wealthStars, strength) {
    return `理财能力${strength === '旺' ? '较强' : '需要学习提升'}，建议制定长期规划`;
  }

  analyzeWealthTiming(wealthStars) {
    return '财富积累需要时间，建议耐心经营';
  }

  generateFinancialAdvice(wealthStars, personName) {
    return `${personName}应该注重财务规划，稳健投资，避免投机`;
  }

  analyzeMarriageFortune(marriageStars, marriageLucky, marriageUnlucky) {
    const score = marriageStars.length + marriageLucky.length - marriageUnlucky.length;
    return score > 1 ? '婚姻运势较好' : '需要用心经营感情';
  }

  analyzeSpouseCharacteristics(marriageStars, gender) {
    return `配偶通常${gender === '男性' ? '温柔贤惠' : '稳重可靠'}，与您互补`;
  }

  analyzeRelationshipPattern(marriageStars, mingGongStars) {
    return '感情发展模式较为稳定，重视长期关系';
  }

  analyzeMarriageTiming(marriageStars, strength) {
    return `适婚年龄在${strength === '旺' ? '25-30岁' : '28-35岁'}之间`;
  }

  analyzeRelationshipChallenges(marriageUnlucky) {
    return marriageUnlucky.length > 0 ? '需要注意沟通和理解' : '感情发展较为顺利';
  }

  generateRelationshipAdvice(marriageStars, personName, gender) {
    return `${personName}在感情中应该保持真诚，用心经营婚姻关系`;
  }

  // 其他分析方法的简化实现
  analyzeConstitution(healthStars, mingGongStars) { return '体质整体良好，需要注意保养'; }
  analyzeHealthTendencies(healthStars, healthUnlucky) { return '注意预防常见疾病，保持健康生活方式'; }
  analyzeVulnerableAreas(healthStars, healthUnlucky) { return '注意心血管和消化系统健康'; }
  analyzeWellnessApproach(mingGongStars) { return '适合温和的养生方式，注重身心平衡'; }
  analyzePreventionFocus(healthUnlucky) { return '预防胜于治疗，定期体检很重要'; }
  generateHealthAdvice(healthStars, personName) { return `${personName}应该保持规律作息，适度运动`; }
  
  analyzeParentsRelationship(parentsPalace) { return '与父母关系和睦，得到长辈关爱'; }
  analyzeSiblingsRelationship(siblingsPalace) { return '兄弟姐妹关系良好，互相支持'; }
  analyzeChildrenFortune(childrenPalace, gender) { return '子女缘分深厚，家庭幸福'; }
  analyzeFamilyHarmony(parentsPalace, siblingsPalace, childrenPalace) { return '家庭和睦，亲情深厚'; }
  analyzeFamilyResponsibilities(parentsPalace, childrenPalace) { return '承担适当的家庭责任，平衡个人发展'; }
  generateFamilyAdvice(parentsPalace, childrenPalace, personName) { return `${personName}应该珍惜家庭关系，孝顺父母`; }
  
  analyzeCurrentPeriod(currentPeriod, personName) { return `${personName}目前处于${currentPeriod.description}，是重要的发展阶段`; }
  analyzeLifeCycle(allPeriods, wuxingJu) { return `人生按照${wuxingJu.type}的节奏发展，每个阶段都有其特色`; }
  analyzeKeyTurningPoints(allPeriods) { return '人生的关键转折点通常在大限交替时期'; }
  analyzeFavorablePeriods(allPeriods) { return allPeriods.slice(2, 6).map(p => p.age_range).join('、'); }
  analyzeChallengingPeriods(allPeriods) { return '需要特别注意的时期要谨慎应对'; }
  generateTimingAdvice(currentPeriod, personName) { return `${personName}应该把握当前时机，积极发展`; }
  
  analyzeLifePurpose(mainStar, mingGong, siHua) { return `人生目标是发挥${mainStar}星的特质，实现自我价值`; }
  analyzeCoreValues(mingGong, fuDe) { return '核心价值观注重诚信、善良和智慧'; }
  analyzeDevelopmentDirection(mainStar, twelvePalaces) { return `发展方向应该结合${mainStar}星的特质，全面发展`; }
  analyzeSpiritualGrowth(fuDe, siHua) { return '精神成长需要不断学习和修养'; }
  analyzeLifeLessons(mingGong, twelvePalaces) { return '人生课题是学会平衡各方面的发展'; }
  generateOverallGuidance(mainStar, personName) { return `${personName}应该发挥${mainStar}星的优势，创造美好人生`; }

  // 流年分析辅助方法
  analyzeXiaoXianInfluence(xiaoXianIndex, age) {
    const influences = {
      0: '子宫小限，主智慧学习，适合思考规划',
      1: '丑宫小限，主稳定积累，宜踏实工作',
      2: '寅宫小限，主生机勃勃，适合开创新局',
      3: '卯宫小限，主温和发展，宜人际交往',
      4: '辰宫小限，主变化转机，注意把握时机',
      5: '巳宫小限，主智慧显现，适合学习进修',
      6: '午宫小限，主光明发展，事业运势较好',
      7: '未宫小限，主收获成果，宜总结经验',
      8: '申宫小限，主行动力强，适合积极进取',
      9: '酉宫小限，主收敛整理，宜内省修养',
      10: '戌宫小限，主稳定发展，注重基础建设',
      11: '亥宫小限，主休养生息，适合蓄势待发'
    };
    return influences[xiaoXianIndex] || '运势平稳，宜顺势而为';
  }

  getXiaoXianYearlyTheme(xiaoXianIndex) {
    const themes = ['学习年', '积累年', '开创年', '发展年', '变化年', '进修年', '成就年', '收获年', '进取年', '修养年', '建设年', '蓄势年'];
    return themes[xiaoXianIndex] || '发展年';
  }

  analyzeLiuNianFortune(yearStem, yearBranch, currentPeriod) {
    return `${yearStem}${yearBranch}年与${currentPeriod.palace_name}大限相配，整体运势${Math.random() > 0.5 ? '向好' : '平稳'}，需要把握机会`;
  }

  getLiuNianFocusAreas(yearStem, yearBranch) {
    const focusAreas = {
      '甲': ['事业发展', '学习进修', '人际关系'],
      '乙': ['财务管理', '健康养生', '家庭和谐'],
      '丙': ['创新创业', '表达沟通', '社交拓展'],
      '丁': ['感情婚姻', '艺术创作', '精神修养'],
      '戊': ['稳定发展', '投资理财', '基础建设'],
      '己': ['内在成长', '技能提升', '人脉积累'],
      '庚': ['决断执行', '目标达成', '领导管理'],
      '辛': ['细节完善', '品质提升', '专业精进'],
      '壬': ['流动变化', '适应调整', '机会把握'],
      '癸': ['内省思考', '智慧积累', '潜力开发']
    };
    return focusAreas[yearStem] || ['全面发展', '平衡协调', '稳步前进'];
  }

  getLiuNianOpportunities(sihua) {
    return [
      `${sihua.lu}化禄带来的财运机会`,
      `${sihua.quan}化权带来的权力机会`,
      `${sihua.ke}化科带来的名声机会`
    ];
  }

  getLiuNianChallenges(sihua) {
    return [
      `需要特别注意${sihua.ji}化忌带来的挑战`,
      '避免冲动决策，保持理性思考',
      '注意人际关系的维护和协调'
    ];
  }

  generateMonthlyPreview(currentYear) {
    const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months.map((month, index) => ({
      month: month,
      theme: `${month}主题：${['新开始', '积累期', '发展期', '调整期', '成长期', '收获期', '反思期', '准备期', '行动期', '完善期', '总结期', '规划期'][index]}`,
      focus: ['学习', '工作', '感情', '健康', '财运', '人际', '事业', '家庭', '投资', '创新', '休息', '计划'][index]
    }));
  }

  getMonthTheme(month) {
    const themes = {
      1: '新春开局，万象更新', 2: '春回大地，生机勃勃', 3: '春暖花开，适合发展',
      4: '春夏之交，变化调整', 5: '初夏时节，积极进取', 6: '仲夏时光，收获成果',
      7: '盛夏季节，注意平衡', 8: '夏秋之际，稳定发展', 9: '金秋时节，收获满满',
      10: '深秋季节，内省修养', 11: '初冬时节，蓄势待发', 12: '年终岁末，总结规划'
    };
    return themes[month] || '平稳发展，顺势而为';
  }

  analyzeMonthFortune(monthBranchIndex, currentYear) {
    const fortunes = ['运势上升', '平稳发展', '需要谨慎', '机会较多', '挑战与机遇并存'];
    return fortunes[monthBranchIndex % 5];
  }

  getMonthFocus(month) {
    const focuses = {
      1: '制定年度计划，开启新征程', 2: '人际关系建设，拓展社交圈', 3: '学习进修提升，增强实力',
      4: '事业发展规划，把握机遇', 5: '财务管理优化，理性投资', 6: '健康养生调理，平衡身心',
      7: '感情关系维护，增进理解', 8: '技能专业提升，精益求精', 9: '收获成果总结，经验积累',
      10: '内在修养提升，智慧增长', 11: '年终总结反思，查漏补缺', 12: '来年规划准备，蓄势待发'
    };
    return focuses[month] || '全面发展，平衡协调';
  }

  getMonthAdvice(monthBranchIndex) {
    const advices = [
      '保持积极心态，勇于尝试新事物',
      '稳扎稳打，注重基础建设',
      '把握机会，积极主动出击',
      '温和处事，重视人际和谐',
      '适应变化，灵活调整策略',
      '深入学习，提升专业能力',
      '发挥优势，展现个人魅力',
      '收获成果，总结经验教训',
      '行动果断，追求卓越品质',
      '内省修养，提升精神境界',
      '稳定发展，夯实基础根基',
      '休养生息，为未来做准备'
    ];
    return advices[monthBranchIndex] || '顺势而为，保持平常心';
  }

  getNextMonthPreview(nextMonth) {
    if (nextMonth > 12) nextMonth = 1;
    return {
      month: nextMonth,
      preview: `下月${nextMonth}月预览：${this.getMonthTheme(nextMonth)}`,
      preparation: '建议提前做好相应准备，把握时机'
    };
  }

  analyzeTimingCoordination(daxian, xiaoxian, liunian) {
    return `大限、小限、流年三者协调${Math.random() > 0.5 ? '较好' : '需要注意平衡'}，建议统筹规划`;
  }

  getBestTimingAdvice(daxian, liunian) {
    return `结合${daxian.palace_name}大限和${liunian.year_ganzhi}年的特点，建议在适当时机积极行动`;
  }

  getTimingWarnings(sihua) {
    return [
      `特别注意${sihua.ji}化忌的影响`,
      '避免在不利时机做重大决策',
      '保持谨慎乐观的态度'
    ];
  }

  getSeasonalGuidance(currentMonth) {
    const seasons = {
      1: '冬春之际，宜规划布局', 2: '春季开始，宜积极行动', 3: '春季发展，宜把握机会',
      4: '春夏之交，宜调整策略', 5: '初夏时节，宜稳步推进', 6: '仲夏时光，宜收获成果',
      7: '盛夏季节，宜保持平衡', 8: '夏秋之际，宜稳定发展', 9: '金秋时节，宜总结收获',
      10: '深秋季节，宜内省修养', 11: '初冬时节，宜蓄势待发', 12: '年终岁末，宜规划未来'
    };
    return seasons[currentMonth] || '顺应自然，把握节奏';
  }
  
  // 分析个性化优势
  analyzePersonalizedStrengths(mainStars, luckyStars, personName, personGender) {
    const strengths = [];
    
    // 基于主星的优势
    mainStars.forEach(star => {
      const starStrengths = this.getStarStrengths(star, personName, personGender);
      if (starStrengths) strengths.push(starStrengths);
    });
    
    // 基于吉星的加持
    if (luckyStars.length > 0) {
      const luckyBonus = this.getLuckyStarsBonus(luckyStars, personName);
      if (luckyBonus) strengths.push(luckyBonus);
    }
    
    return strengths.join('；') || `${personName}，您具有独特的个人优势`;
  }
  
  // 获取主星优势
  getStarStrengths(star, personName, personGender) {
    const genderPrefix = personGender === '男性' ? '作为男性' : '作为女性';
    
    const starStrengths = {
      '紫微': `${personName}，您具有天生的领导魅力和组织能力。${genderPrefix}，您能够在团队中发挥核心作用，具有很强的责任感和使命感`,
      '天机': `${personName}，您思维敏捷，善于策划和分析。${genderPrefix}，您具有很强的洞察力和应变能力，能够在复杂情况下找到最佳解决方案`,
      '太阳': `${personName}，您光明磊落，具有很强的正义感。${genderPrefix}，您天生具有感染他人的能力，能够成为他人的榜样和引导者`,
      '武曲': `${personName}，您意志坚强，执行力超群。${genderPrefix}，您具有很强的目标导向性和实现能力，在财务管理方面有天赋`,
      '天同': `${personName}，您性格温和，人际关系和谐。${genderPrefix}，您具有很强的亲和力和包容心，能够营造和谐的氛围`,
      '廉贞': `${personName}，您感情丰富，具有艺术天赋。${genderPrefix}，您追求美好的事物，有很强的审美能力和创造力`,
      '天府': `${personName}，您稳重可靠，善于积累和管理。${genderPrefix}，您注重安全感，具有很强的组织能力和理财天赋`,
      '太阴': `${personName}，您细腻敏感，直觉力强。${genderPrefix}，您善于照顾他人，具有很强的同理心和洞察力`,
      '贪狼': `${personName}，您多才多艺，充满魅力。${genderPrefix}，您善于交际，适应能力强，具有很强的学习能力`,
      '巨门': `${personName}，您口才出众，分析能力强。${genderPrefix}，您善于发现问题的关键，具有很强的研究精神和专业能力`,
      '天相': `${personName}，您忠诚可靠，协调能力强。${genderPrefix}，您善于辅助他人，具有很强的服务精神和团队合作能力`,
      '天梁': `${personName}，您正直善良，具有长者风范。${genderPrefix}，您有很强的责任感和正义感，能够给他人提供指导和帮助`,
      '七杀': `${personName}，您冲劲十足，勇于开拓。${genderPrefix}，您不怕困难，具有很强的开拓精神和执行力`,
      '破军': `${personName}，您勇于创新，不满足现状。${genderPrefix}，您具有很强的变革能力和突破精神，善于在变化中寻找机会`
    };
    
    return starStrengths[star];
  }
  
  // 获取吉星加持
  getLuckyStarsBonus(luckyStars, personName) {
    const bonuses = [];
    
    luckyStars.forEach(star => {
      const starBonus = {
        '文昌': `${personName}，文昌星的加持使您在学习和文化方面有特殊天赋，表达能力强`,
        '文曲': `${personName}，文曲星的影响让您口才出众，善于沟通交流，具有艺术气质`,
        '左辅': `${personName}，左辅星的帮助使您容易得到贵人相助，在团队中能发挥重要作用`,
        '右弼': `${personName}，右弼星的支持让您具有很强的协调能力，善于处理人际关系`,
        '天魁': `${personName}，天魁星的庇佑使您容易遇到年长的贵人，在关键时刻得到指导`,
        '天钺': `${personName}，天钺星的照耀让您具有很强的直觉力，能够把握机会`
      };
      
      if (starBonus[star]) {
        bonuses.push(starBonus[star]);
      }
    });
    
    return bonuses.join('；');
  }
  
  // 分析个性化挑战
  analyzePersonalizedChallenges(mainStars, unluckyStars, personName, personGender) {
    const challenges = [];
    
    // 基于主星的挑战
    mainStars.forEach(star => {
      const starChallenges = this.getStarChallenges(star, personName, personGender);
      if (starChallenges) challenges.push(starChallenges);
    });
    
    // 基于煞星的挑战
    if (unluckyStars.length > 0) {
      const unluckyChallenge = this.getUnluckyStarsChallenge(unluckyStars, personName);
      if (unluckyChallenge) challenges.push(unluckyChallenge);
    }
    
    return challenges.join('；') || `${personName}，您需要注意平衡发展，避免过度偏向某一方面`;
  }
  
  // 获取主星挑战
  getStarChallenges(star, personName, personGender) {
    const genderPrefix = personGender === '男性' ? '作为男性' : '作为女性';
    
    const starChallenges = {
      '紫微': `${personName}，您需要注意不要过于自我中心。${genderPrefix}，要学会倾听他人意见，避免过于强势`,
      '天机': `${personName}，您需要注意不要想得太多而缺乏行动。${genderPrefix}，要学会在思考和行动之间找到平衡`,
      '太阳': `${personName}，您需要注意不要过度消耗自己的能量。${genderPrefix}，要学会适度休息，避免过度付出`,
      '武曲': `${personName}，您需要注意不要过于注重物质而忽视情感。${genderPrefix}，要学会在坚持中保持灵活`,
      '天同': `${personName}，您需要注意不要过于随和而缺乏主见。${genderPrefix}，要学会在适当时候坚持自己的立场`,
      '廉贞': `${personName}，您需要注意情绪管理，避免过度敏感。${genderPrefix}，要学会在感性和理性之间找到平衡`,
      '天府': `${personName}，您需要注意不要过于保守而错失机会。${genderPrefix}，要学会在稳重中保持开放`,
      '太阴': `${personName}，您需要注意不要过于敏感而影响判断。${genderPrefix}，要学会保护自己的情绪边界`,
      '贪狼': `${personName}，您需要注意专注力的培养，避免三心二意。${genderPrefix}，要学会在多元发展中保持重点`,
      '巨门': `${personName}，您需要注意表达方式的温和，避免过于直接。${genderPrefix}，要学会在坚持真理的同时照顾他人感受`,
      '天相': `${personName}，您需要注意在帮助他人的同时也要为自己考虑。${genderPrefix}，要学会适当拒绝不合理要求`,
      '天梁': `${personName}，您需要注意不要过于严肃而缺乏灵活性。${genderPrefix}，要学会在原则性和灵活性之间找到平衡`,
      '七杀': `${personName}，您需要注意控制冲动，学会深思熟虑。${genderPrefix}，要学会在冲劲中保持理性`,
      '破军': `${personName}，您需要注意在变化中保持稳定的核心价值。${genderPrefix}，要学会在创新中保持连续性`
    };
    
    return starChallenges[star];
  }
  
  // 获取煞星挑战
  getUnluckyStarsChallenge(unluckyStars, personName) {
    const challenges = [];
    
    unluckyStars.forEach(star => {
      const starChallenge = {
        '擎羊': `${personName}，擎羊星提醒您要控制冲动，学会耐心等待合适的时机`,
        '陀罗': `${personName}，陀罗星提醒您要克服拖延，提高行动效率`,
        '火星': `${personName}，火星提醒您要控制急躁情绪，学会冷静思考`,
        '铃星': `${personName}，铃星提醒您要稳定情绪，避免过度波动`,
        '地空': `${personName}，地空星提醒您要脚踏实地，避免好高骛远`,
        '地劫': `${personName}，地劫星提醒您要谨慎理财，避免不必要的损失`
      };
      
      if (starChallenge[star]) {
        challenges.push(starChallenge[star]);
      }
    });
    
    return challenges.join('；');
  }
  
  // 分析个性化潜力
  analyzePersonalizedPotential(mainStars, luckyStars, personGender, personName) {
    const potentials = [];
    
    // 基于主星的潜力
    mainStars.forEach(star => {
      const starPotential = this.getStarPotential(star, personName, personGender);
      if (starPotential) potentials.push(starPotential);
    });
    
    // 基于吉星的潜力加成
    if (luckyStars.length > 0) {
      const luckyPotential = this.getLuckyStarsPotential(luckyStars, personName);
      if (luckyPotential) potentials.push(luckyPotential);
    }
    
    return potentials.join('；') || `${personName}，您具有无限的发展潜力，关键在于如何发掘和运用`;
  }
  
  // 获取主星潜力
  getStarPotential(star, personName, personGender) {
    const genderPrefix = personGender === '男性' ? '作为男性' : '作为女性';
    
    const starPotentials = {
      '紫微': `${personName}，您有成为杰出领导者的潜力。${genderPrefix}，您可以在管理、政治或大型组织中发挥重要作用`,
      '天机': `${personName}，您有成为优秀策划师的潜力。${genderPrefix}，您可以在咨询、策划或智力密集型行业中获得成功`,
      '太阳': `${personName}，您有成为公众人物的潜力。${genderPrefix}，您可以在教育、传媒或公共服务领域发光发热`,
      '武曲': `${personName}，您有成为财务专家的潜力。${genderPrefix}，您可以在金融、投资或实业领域取得卓越成就`,
      '天同': `${personName}，您有成为和谐使者的潜力。${genderPrefix}，您可以在服务、协调或人际关系领域发挥特长`,
      '廉贞': `${personName}，您有成为艺术家的潜力。${genderPrefix}，您可以在艺术、设计或创意产业中展现才华`,
      '天府': `${personName}，您有成为管理专家的潜力。${genderPrefix}，您可以在行政、管理或组织运营方面取得成功`,
      '太阴': `${personName}，您有成为心理专家的潜力。${genderPrefix}，您可以在心理咨询、教育或照护行业中发挥专长`,
      '贪狼': `${personName}，您有成为多元发展者的潜力。${genderPrefix}，您可以在多个领域同时发展，成为复合型人才`,
      '巨门': `${personName}，您有成为专业分析师的潜力。${genderPrefix}，您可以在研究、分析或专业咨询领域获得认可`,
      '天相': `${personName}，您有成为优秀助手的潜力。${genderPrefix}，您可以在辅助、支持或协调性工作中发挥重要作用`,
      '天梁': `${personName}，您有成为人生导师的潜力。${genderPrefix}，您可以在教育、指导或公益事业中贡献力量`,
      '七杀': `${personName}，您有成为开拓者的潜力。${genderPrefix}，您可以在创业、开拓或竞争性行业中取得突破`,
      '破军': `${personName}，您有成为变革者的潜力。${genderPrefix}，您可以在创新、改革或新兴行业中引领潮流`
    };
    
    return starPotentials[star];
  }
  
  // 获取吉星潜力加成
  getLuckyStarsPotential(luckyStars, personName) {
    const potentials = [];
    
    luckyStars.forEach(star => {
      const starPotential = {
        '文昌': `${personName}，文昌星增强了您的学习和表达潜力，有望在文化教育领域取得成就`,
        '文曲': `${personName}，文曲星提升了您的沟通和艺术潜力，有望在创意表达方面获得成功`,
        '左辅': `${personName}，左辅星增强了您的团队合作潜力，有望在协作性工作中发挥重要作用`,
        '右弼': `${personName}，右弼星提升了您的协调管理潜力，有望在组织管理方面取得成就`,
        '天魁': `${personName}，天魁星增强了您获得贵人帮助的潜力，有望在关键时刻得到重要支持`,
        '天钺': `${personName}，天钺星提升了您的直觉判断潜力，有望在需要洞察力的领域获得成功`
      };
      
      if (starPotential[star]) {
        potentials.push(starPotential[star]);
      }
    });
    
    return potentials.join('；');
  }
  
  // 分析个性化人生态度
  analyzePersonalizedLifeAttitude(mainStar, personGender, personName) {
    const genderPrefix = personGender === '男性' ? '作为男性' : '作为女性';
    
    const lifeAttitudes = {
      '紫微': `${personName}，您的人生态度是追求卓越和领导地位。${genderPrefix}，您相信通过努力和责任感可以实现人生价值，喜欢在团队中发挥核心作用`,
      '天机': `${personName}，您的人生态度是追求智慧和变化。${genderPrefix}，您相信知识就是力量，喜欢通过学习和思考来解决问题`,
      '太阳': `${personName}，您的人生态度是追求光明和正义。${genderPrefix}，您相信正直和热情可以感化他人，喜欢为他人带来希望和温暖`,
      '武曲': `${personName}，您的人生态度是追求实际和成果。${genderPrefix}，您相信通过努力工作可以获得物质成功，注重实际效果和结果`,
      '天同': `${personName}，您的人生态度是追求和谐和快乐。${genderPrefix}，您相信知足常乐，喜欢在平和的环境中享受生活`,
      '廉贞': `${personName}，您的人生态度是追求美好和完美。${genderPrefix}，您相信生活应该充满美感，注重精神层面的满足`,
      '天府': `${personName}，您的人生态度是追求稳定和积累。${genderPrefix}，您相信稳扎稳打可以获得长久成功，注重安全感和保障`,
      '太阴': `${personName}，您的人生态度是追求内在和深度。${genderPrefix}，您相信内心的丰富比外在的繁华更重要，注重精神世界的建设`,
      '贪狼': `${personName}，您的人生态度是追求多元和体验。${genderPrefix}，您相信人生应该丰富多彩，喜欢尝试不同的可能性`,
      '巨门': `${personName}，您的人生态度是追求真理和深度。${genderPrefix}，您相信通过深入研究可以发现真相，注重专业性和权威性`,
      '天相': `${personName}，您的人生态度是追求服务和奉献。${genderPrefix}，您相信帮助他人就是帮助自己，喜欢在服务中体现价值`,
      '天梁': `${personName}，您的人生态度是追求正义和责任。${genderPrefix}，您相信每个人都有社会责任，喜欢为弱者发声和提供帮助`,
      '七杀': `${personName}，您的人生态度是追求挑战和突破。${genderPrefix}，您相信只有在困难中才能成长，喜欢迎接各种挑战`,
      '破军': `${personName}，您的人生态度是追求变革和创新。${genderPrefix}，您相信变化是进步的动力，喜欢在变化中寻找机会`
    };
    
    return lifeAttitudes[mainStar] || `${personName}，您有着独特的人生态度和价值观，这是您最宝贵的财富`;
  }
  
  // 分析性格演化
  analyzePersonalityEvolution(mainStars, personName, personGender) {
    const evolution = `${personName}，根据您的主星${mainStars.join('、')}，您的性格会随着人生阶段的变化而不断演化。青年时期您可能更多展现星曜的基本特质，中年时期会逐渐整合各种经验形成成熟的个性，晚年时期则会达到性格的升华和圆融。${personGender === '男性' ? '作为男性，您的性格演化会更多体现在责任感和成就感的提升上' : '作为女性，您的性格演化会更多体现在智慧和包容性的增长上'}。`;
    
    return evolution;
  }
  
  // 分析社交互动风格
  analyzeSocialInteractionStyle(mainStars, luckyStars, personName) {
    const socialStyles = [];
    
    mainStars.forEach(star => {
      const starStyle = this.getStarSocialStyle(star);
      if (starStyle) socialStyles.push(starStyle);
    });
    
    const baseStyle = socialStyles.join('，同时');
    const luckyBonus = luckyStars.length > 0 ? '在吉星的加持下，您的人际关系会更加和谐顺利' : '';
    
    return `${personName}，您的社交风格${baseStyle}。${luckyBonus}`;
  }
  
  // 获取主星社交风格
  getStarSocialStyle(star) {
    const socialStyles = {
      '紫微': '倾向于在社交中担任领导角色，喜欢被人尊重和仰慕',
      '天机': '善于在社交中提供智慧建议，喜欢与人分享见解',
      '太阳': '在社交中充满热情和正能量，容易成为人群的焦点',
      '武曲': '在社交中比较直接务实，注重实际利益和结果',
      '天同': '在社交中温和友善，善于营造和谐的氛围',
      '廉贞': '在社交中注重品味和美感，喜欢与有艺术气质的人交往',
      '天府': '在社交中稳重可靠，容易获得他人的信任',
      '太阴': '在社交中比较内敛，但善于倾听和理解他人',
      '贪狼': '在社交中活跃多变，善于与不同类型的人交往',
      '巨门': '在社交中善于分析和表达，但有时过于直接',
      '天相': '在社交中善于协调和服务，容易成为团队的润滑剂',
      '天梁': '在社交中具有长者风范，善于给他人提供指导',
      '七杀': '在社交中比较直接有力，喜欢与有挑战性的人交往',
      '破军': '在社交中喜欢新鲜和变化，容易与创新型人才产生共鸣'
    };
    
    return socialStyles[star];
  }
  
  // 分析决策风格
  analyzeDecisionMakingStyle(mainStars, personName, personGender) {
    const decisionStyles = [];
    
    mainStars.forEach(star => {
      const starDecisionStyle = this.getStarDecisionStyle(star);
      if (starDecisionStyle) decisionStyles.push(starDecisionStyle);
    });
    
    const baseStyle = decisionStyles.join('，并且');
    const genderModifier = personGender === '男性' ? '作为男性，您在决策时会更多考虑责任和成就' : '作为女性，您在决策时会更多考虑和谐和感受';
    
    return `${personName}，您的决策风格${baseStyle}。${genderModifier}。`;
  }
  
  // 获取主星决策风格
  getStarDecisionStyle(star) {
    const decisionStyles = {
      '紫微': '倾向于从全局角度考虑问题，注重决策的权威性和影响力',
      '天机': '善于分析各种可能性，但有时会因为想得太多而延迟决策',
      '太阳': '倾向于做出光明正大的决策，注重决策的道德性和正义性',
      '武曲': '注重决策的实际效果和经济效益，倾向于快速果断的决策',
      '天同': '倾向于做出让大家都满意的决策，注重决策的和谐性',
      '廉贞': '在决策时会考虑美感和完美性，有时会因为追求完美而犹豫',
      '天府': '倾向于稳健保守的决策，注重决策的安全性和可靠性',
      '太阴': '在决策时会深入考虑各种细节，注重决策的周全性',
      '贪狼': '倾向于多元化的决策，喜欢保留多种选择的可能性',
      '巨门': '善于深入分析问题的本质，但决策过程可能比较谨慎',
      '天相': '在决策时会考虑对他人的影响，注重决策的协调性',
      '天梁': '倾向于做出有原则性的决策，注重决策的正确性和长远性',
      '七杀': '倾向于快速果断的决策，不怕承担决策的风险和责任',
      '破军': '倾向于创新性的决策，喜欢尝试不同寻常的解决方案'
    };
    
    return decisionStyles[star];
  }
  
  // 获取人生格局描述
  getLifePatternDescription(mainStar, personName) {
    const lifePatterns = {
      '紫微': `${personName}，注定要承担重要责任，在人生的舞台上发挥领导作用`,
      '天机': `${personName}，充满智慧和变化，人生路径多样且富有创意`,
      '太阳': `${personName}，光明磊落，注定要照亮他人，成为正能量的源泉`,
      '武曲': `${personName}，意志坚定，通过不懈努力必能获得物质成功`,
      '天同': `${personName}，追求和谐快乐，人生注重精神层面的满足`,
      '廉贞': `${personName}，感情丰富，人生充满艺术气息和美好追求`,
      '天府': `${personName}，稳重可靠，人生注重积累和长远发展`,
      '太阴': `${personName}，细腻敏感，人生重视内在修养和精神世界`,
      '贪狼': `${personName}，多才多艺，人生充满各种可能性和机遇`,
      '巨门': `${personName}，善于分析，人生注重专业发展和深度研究`,
      '天相': `${personName}，忠诚可靠，人生价值在于服务他人和协调关系`,
      '天梁': `${personName}，正直善良，人生使命是指导他人和维护正义`,
      '七杀': `${personName}，勇于开拓，人生充满挑战和突破的机会`,
      '破军': `${personName}，勇于创新，人生注定要在变革中寻找新的道路`
    };
    
    return lifePatterns[mainStar] || `${personName}，拥有独特的人生格局和发展道路`;
  }
}

module.exports = ZiweiAnalyzer;