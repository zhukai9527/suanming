// 紫微斗数计算器模块
// 专注于排盘计算逻辑，不包含分析解释

const BaseData = require('../common/BaseData.cjs');
const BaziCalculator = require('./BaziCalculator.cjs');

class ZiweiCalculator {
  constructor() {
    this.baseData = new BaseData();
    this.baziCalculator = new BaziCalculator();
    
    // 十四主星数据
    this.mainStars = {
      1: '紫微', 2: '天机', 3: '太阳', 4: '武曲', 5: '天同',
      6: '廉贞', 7: '天府', 8: '太阴', 9: '贪狼', 10: '巨门',
      11: '天相', 12: '天梁', 13: '七杀', 14: '破军'
    };
    
    // 六吉星
    this.luckyStars = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'];
    
    // 六煞星
    this.unluckyStars = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
    
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
  
  // 计算完整紫微斗数排盘
  calculateZiweiChart(birth_date, birth_time, gender) {
    // 先计算八字
    const baziChart = this.baziCalculator.calculatePreciseBazi(birth_date, birth_time);
    
    // 计算农历信息
    const lunarInfo = this.calculateLunarInfo(birth_date);
    
    // 计算命宫
    const mingGong = this.calculateMingGong(lunarInfo.month, lunarInfo.hour);
    
    // 计算身宫
    const shenGong = this.calculateShenGong(lunarInfo.month, lunarInfo.hour);
    
    // 计算五行局
    const wuxingJu = this.calculateWuxingJu(mingGong.index);
    
    // 安排十四主星
    const mainStarPositions = this.arrangeMainStars(mingGong.index, lunarInfo.day);
    
    // 安排六吉星
    const luckyStarPositions = this.arrangeLuckyStars(baziChart, lunarInfo);
    
    // 安排六煞星
    const unluckyStarPositions = this.arrangeUnluckyStars(baziChart, lunarInfo);
    
    // 计算四化
    const siHua = this.calculateSiHua(baziChart.birth_info.year);
    
    // 生成十二宫位
    const twelvePalaces = this.generateTwelvePalaces(
      mingGong.index, 
      mainStarPositions, 
      luckyStarPositions, 
      unluckyStarPositions
    );
    
    return {
      bazi_info: baziChart,
      lunar_info: lunarInfo,
      ming_gong: mingGong,
      shen_gong: shenGong,
      wuxing_ju: wuxingJu,
      main_star_positions: mainStarPositions,
      lucky_star_positions: luckyStarPositions,
      unlucky_star_positions: unluckyStarPositions,
      si_hua: siHua,
      twelve_palaces: twelvePalaces
    };
  }
  
  // 计算农历信息（简化版）
  calculateLunarInfo(birth_date) {
    const birthDate = new Date(birth_date);
    
    // 简化的农历转换，实际应该使用精确的农历算法
    return {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: this.getHourIndex(birthDate.getHours())
    };
  }
  
  // 获取时辰索引
  getHourIndex(hour) {
    if (hour >= 23 || hour < 1) return 0;  // 子时
    if (hour >= 1 && hour < 3) return 1;   // 丑时
    if (hour >= 3 && hour < 5) return 2;   // 寅时
    if (hour >= 5 && hour < 7) return 3;   // 卯时
    if (hour >= 7 && hour < 9) return 4;   // 辰时
    if (hour >= 9 && hour < 11) return 5;  // 巳时
    if (hour >= 11 && hour < 13) return 6; // 午时
    if (hour >= 13 && hour < 15) return 7; // 未时
    if (hour >= 15 && hour < 17) return 8; // 申时
    if (hour >= 17 && hour < 19) return 9; // 酉时
    if (hour >= 19 && hour < 21) return 10; // 戌时
    if (hour >= 21 && hour < 23) return 11; // 亥时
    return 6; // 默认午时
  }
  
  // 计算命宫
  calculateMingGong(month, hour) {
    // 命宫 = 寅宫 + 月份 - 时辰
    const mingGongIndex = (2 + month - hour + 12) % 12;
    
    return {
      index: mingGongIndex,
      position: this.baseData.getBranchByIndex(mingGongIndex),
      description: `命宫在${this.baseData.getBranchByIndex(mingGongIndex)}`
    };
  }
  
  // 计算身宫
  calculateShenGong(month, hour) {
    // 身宫 = 亥宫 + 月份 + 时辰
    const shenGongIndex = (11 + month + hour) % 12;
    
    return {
      index: shenGongIndex,
      position: this.baseData.getBranchByIndex(shenGongIndex),
      description: `身宫在${this.baseData.getBranchByIndex(shenGongIndex)}`
    };
  }
  
  // 计算五行局
  calculateWuxingJu(mingGongIndex) {
    const wuxingJuTable = {
      0: { name: '水二局', number: 2, element: '水' },  // 子
      1: { name: '土五局', number: 5, element: '土' },  // 丑
      2: { name: '木三局', number: 3, element: '木' },  // 寅
      3: { name: '木三局', number: 3, element: '木' },  // 卯
      4: { name: '土五局', number: 5, element: '土' },  // 辰
      5: { name: '火六局', number: 6, element: '火' },  // 巳
      6: { name: '火六局', number: 6, element: '火' },  // 午
      7: { name: '土五局', number: 5, element: '土' },  // 未
      8: { name: '金四局', number: 4, element: '金' },  // 申
      9: { name: '金四局', number: 4, element: '金' },  // 酉
      10: { name: '土五局', number: 5, element: '土' }, // 戌
      11: { name: '水二局', number: 2, element: '水' }  // 亥
    };
    
    return wuxingJuTable[mingGongIndex] || wuxingJuTable[0];
  }
  
  // 安排十四主星
  arrangeMainStars(mingGongIndex, day) {
    const starPositions = {};
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      starPositions[i] = [];
    }
    
    // 紫微星系的安排（简化版）
    const ziweiPosition = this.calculateZiweiPosition(mingGongIndex, day);
    starPositions[ziweiPosition].push('紫微');
    
    // 天机星在紫微的下一宫
    const tianjixPosition = (ziweiPosition + 1) % 12;
    starPositions[tianjixPosition].push('天机');
    
    // 太阳星的安排
    const taiyangPosition = this.calculateTaiyangPosition(day);
    starPositions[taiyangPosition].push('太阳');
    
    // 武曲星在太阳的对宫
    const wuquPosition = (taiyangPosition + 6) % 12;
    starPositions[wuquPosition].push('武曲');
    
    // 天同星的安排
    const tiantongPosition = this.calculateTiantongPosition(mingGongIndex);
    starPositions[tiantongPosition].push('天同');
    
    // 其他主星的简化安排
    this.arrangeOtherMainStars(starPositions, mingGongIndex, day);
    
    return starPositions;
  }
  
  // 计算紫微星位置
  calculateZiweiPosition(mingGongIndex, day) {
    // 简化的紫微星安排公式
    const ziweiTable = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
      11: 11, 12: 0, 13: 1, 14: 2, 15: 3, 16: 4, 17: 5, 18: 6, 19: 7, 20: 8,
      21: 9, 22: 10, 23: 11, 24: 0, 25: 1, 26: 2, 27: 3, 28: 4, 29: 5, 30: 6
    };
    
    return ziweiTable[day] || 0;
  }
  
  // 计算太阳星位置
  calculateTaiyangPosition(day) {
    // 太阳星按日期安排
    return (day - 1) % 12;
  }
  
  // 计算天同星位置
  calculateTiantongPosition(mingGongIndex) {
    // 天同星相对命宫的位置
    return (mingGongIndex + 4) % 12;
  }
  
  // 安排其他主星
  arrangeOtherMainStars(starPositions, mingGongIndex, day) {
    // 简化的其他主星安排
    const otherStars = ['廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
    
    otherStars.forEach((star, index) => {
      const position = (mingGongIndex + index + 2) % 12;
      starPositions[position].push(star);
    });
  }
  
  // 安排六吉星
  arrangeLuckyStars(baziChart, lunarInfo) {
    const starPositions = {};
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      starPositions[i] = [];
    }
    
    // 文昌文曲的安排
    const wenchang = this.calculateWenchangPosition(lunarInfo.hour);
    const wenqu = this.calculateWenquPosition(lunarInfo.hour);
    
    starPositions[wenchang].push('文昌');
    starPositions[wenqu].push('文曲');
    
    // 左辅右弼的安排
    const zuofu = this.calculateZuofuPosition(lunarInfo.month);
    const youbi = this.calculateYoubiPosition(lunarInfo.month);
    
    starPositions[zuofu].push('左辅');
    starPositions[youbi].push('右弼');
    
    // 天魁天钺的安排
    const tiankui = this.calculateTiankuiPosition(baziChart.year_pillar.stem);
    const tianyue = this.calculateTianyuePosition(baziChart.year_pillar.stem);
    
    starPositions[tiankui].push('天魁');
    starPositions[tianyue].push('天钺');
    
    return starPositions;
  }
  
  // 计算文昌位置
  calculateWenchangPosition(hour) {
    const wenchangTable = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    return wenchangTable[hour] || 0;
  }
  
  // 计算文曲位置
  calculateWenquPosition(hour) {
    const wenquTable = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4];
    return wenquTable[hour] || 0;
  }
  
  // 计算左辅位置
  calculateZuofuPosition(month) {
    return (month + 1) % 12;
  }
  
  // 计算右弼位置
  calculateYoubiPosition(month) {
    return (13 - month) % 12;
  }
  
  // 计算天魁位置
  calculateTiankuiPosition(yearStem) {
    const tiankuiTable = {
      '甲': 1, '乙': 0, '丙': 11, '丁': 10, '戊': 1,
      '己': 0, '庚': 9, '辛': 8, '壬': 7, '癸': 6
    };
    return tiankuiTable[yearStem] || 0;
  }
  
  // 计算天钺位置
  calculateTianyuePosition(yearStem) {
    const tianyueTable = {
      '甲': 7, '乙': 6, '丙': 5, '丁': 4, '戊': 7,
      '己': 6, '庚': 3, '辛': 2, '壬': 1, '癸': 0
    };
    return tianyueTable[yearStem] || 0;
  }
  
  // 安排六煞星
  arrangeUnluckyStars(baziChart, lunarInfo) {
    const starPositions = {};
    
    // 初始化所有宫位
    for (let i = 0; i < 12; i++) {
      starPositions[i] = [];
    }
    
    // 擎羊陀罗的安排
    const qingyang = this.calculateQingyangPosition(baziChart.year_pillar.branch);
    const tuoluo = this.calculateTuoluoPosition(baziChart.year_pillar.branch);
    
    starPositions[qingyang].push('擎羊');
    starPositions[tuoluo].push('陀罗');
    
    // 火星铃星的安排
    const huoxing = this.calculateHuoxingPosition(lunarInfo.year, lunarInfo.hour);
    const lingxing = this.calculateLingxingPosition(lunarInfo.year, lunarInfo.hour);
    
    starPositions[huoxing].push('火星');
    starPositions[lingxing].push('铃星');
    
    // 地空地劫的安排
    const dikong = this.calculateDikongPosition(lunarInfo.hour);
    const dijie = this.calculateDijiePosition(lunarInfo.hour);
    
    starPositions[dikong].push('地空');
    starPositions[dijie].push('地劫');
    
    return starPositions;
  }
  
  // 计算擎羊位置
  calculateQingyangPosition(yearBranch) {
    const branchIndex = this.baseData.getBranchIndex(yearBranch);
    return (branchIndex + 1) % 12;
  }
  
  // 计算陀罗位置
  calculateTuoluoPosition(yearBranch) {
    const branchIndex = this.baseData.getBranchIndex(yearBranch);
    return (branchIndex - 1 + 12) % 12;
  }
  
  // 计算火星位置
  calculateHuoxingPosition(year, hour) {
    const yearBranchIndex = (year - 4) % 12;
    return (yearBranchIndex + hour) % 12;
  }
  
  // 计算铃星位置
  calculateLingxingPosition(year, hour) {
    const yearBranchIndex = (year - 4) % 12;
    return (yearBranchIndex - hour + 12) % 12;
  }
  
  // 计算地空位置
  calculateDikongPosition(hour) {
    return (11 - hour + 12) % 12;
  }
  
  // 计算地劫位置
  calculateDijiePosition(hour) {
    return (hour + 1) % 12;
  }
  
  // 计算四化
  calculateSiHua(year) {
    const yearStemIndex = (year - 4) % 10;
    const yearStem = this.baseData.getStemByIndex(yearStemIndex);
    const siHua = this.sihuaTable[yearStem] || this.sihuaTable['甲'];
    
    return {
      year_stem: yearStem,
      hua_lu: { star: siHua.lu, meaning: '化禄主财禄，增强星曜的正面能量' },
      hua_quan: { star: siHua.quan, meaning: '化权主权力，增强星曜的权威性' },
      hua_ke: { star: siHua.ke, meaning: '化科主名声，增强星曜的声誉' },
      hua_ji: { star: siHua.ji, meaning: '化忌主阻碍，需要特别注意的星曜' }
    };
  }
  
  // 生成十二宫位
  generateTwelvePalaces(mingGongIndex, mainStarPositions, luckyStarPositions, unluckyStarPositions) {
    const palaceNames = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'];
    const palaces = {};
    
    for (let i = 0; i < 12; i++) {
      const palaceIndex = (mingGongIndex + i) % 12;
      const palaceName = palaceNames[i];
      
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
        position: this.baseData.getBranchByIndex(palaceIndex),
        palace_index: palaceIndex,
        all_stars: allStars,
        main_stars: mainStars,
        lucky_stars: luckyStars,
        unlucky_stars: unluckyStars,
        star_count: allStars.length
      };
    }
    
    return palaces;
  }
  
  // 计算大限（基于五行局）
  calculateMajorPeriods(mingGongIndex, gender, wuxingJu, birthYear) {
    const periods = [];
    const startAge = wuxingJu.number;
    const direction = gender === 'male' ? 1 : -1;
    
    for (let i = 0; i < 12; i++) {
      const palaceIndex = (mingGongIndex + direction * i + 12) % 12;
      const startAgeForPeriod = startAge + i * 10;
      
      periods.push({
        sequence: i + 1,
        palace_name: this.getPalaceNameByIndex(palaceIndex, mingGongIndex),
        position: this.baseData.getBranchByIndex(palaceIndex),
        start_age: startAgeForPeriod,
        end_age: startAgeForPeriod + 9,
        start_year: birthYear + startAgeForPeriod,
        end_year: birthYear + startAgeForPeriod + 9
      });
    }
    
    return periods;
  }
  
  // 根据索引获取宫位名称
  getPalaceNameByIndex(palaceIndex, mingGongIndex) {
    const palaceNames = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'];
    const relativeIndex = (palaceIndex - mingGongIndex + 12) % 12;
    return palaceNames[relativeIndex];
  }
}

module.exports = ZiweiCalculator;