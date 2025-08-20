// 共享基础数据类
// 统一天干地支、五行等基础数据结构，消除重复定义

class BaseData {
  constructor() {
    // 天干
    this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    
    // 地支
    this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 五行
    this.wuxing = ['木', '火', '土', '金', '水'];
    
    // 天干五行对应
    this.stemElements = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火', 
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    // 地支五行对应
    this.branchElements = {
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '辰': '土', '戌': '土', '丑': '土', '未': '土'
    };
    
    // 地支藏干表
    this.branchHiddenStems = {
      '子': ['癸'],
      '丑': ['己', '癸', '辛'],
      '寅': ['甲', '丙', '戊'],
      '卯': ['乙'],
      '辰': ['戊', '乙', '癸'],
      '巳': ['丙', '庚', '戊'],
      '午': ['丁', '己'],
      '未': ['己', '丁', '乙'],
      '申': ['庚', '壬', '戊'],
      '酉': ['辛'],
      '戌': ['戊', '辛', '丁'],
      '亥': ['壬', '甲']
    };
    
    // 五行相生关系
    this.wuxingGenerate = {
      '木': '火',
      '火': '土', 
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    // 五行相克关系
    this.wuxingOvercome = {
      '木': '土',
      '火': '金',
      '土': '水', 
      '金': '木',
      '水': '火'
    };
    
    // 天干阴阳属性
    this.stemYinYang = {
      '甲': '阳', '乙': '阴',
      '丙': '阳', '丁': '阴',
      '戊': '阳', '己': '阴', 
      '庚': '阳', '辛': '阴',
      '壬': '阳', '癸': '阴'
    };
    
    // 地支阴阳属性
    this.branchYinYang = {
      '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴',
      '辰': '阳', '巳': '阴', '午': '阳', '未': '阴',
      '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
    };
    
    // 十二生肖
    this.zodiacAnimals = {
      '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
      '辰': '龙', '巳': '蛇', '午': '马', '未': '羊', 
      '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
    };
    
    // 时辰对应表
    this.hourBranches = {
      23: '子', 1: '丑', 3: '寅', 5: '卯',
      7: '辰', 9: '巳', 11: '午', 13: '未',
      15: '申', 17: '酉', 19: '戌', 21: '亥'
    };
  }
  
  // 获取天干五行
  getStemElement(stem) {
    return this.stemElements[stem] || null;
  }
  
  // 获取地支五行
  getBranchElement(branch) {
    return this.branchElements[branch] || null;
  }
  
  // 获取地支藏干
  getBranchHiddenStems(branch) {
    return this.branchHiddenStems[branch] || [];
  }
  
  // 获取天干阴阳
  getStemYinYang(stem) {
    return this.stemYinYang[stem] || null;
  }
  
  // 获取地支阴阳
  getBranchYinYang(branch) {
    return this.branchYinYang[branch] || null;
  }
  
  // 获取生肖
  getZodiacAnimal(branch) {
    return this.zodiacAnimals[branch] || null;
  }
  
  // 根据时辰获取地支
  getHourBranch(hour) {
    // 处理时辰范围
    if (hour >= 23 || hour < 1) return '子';
    if (hour >= 1 && hour < 3) return '丑';
    if (hour >= 3 && hour < 5) return '寅';
    if (hour >= 5 && hour < 7) return '卯';
    if (hour >= 7 && hour < 9) return '辰';
    if (hour >= 9 && hour < 11) return '巳';
    if (hour >= 11 && hour < 13) return '午';
    if (hour >= 13 && hour < 15) return '未';
    if (hour >= 15 && hour < 17) return '申';
    if (hour >= 17 && hour < 19) return '酉';
    if (hour >= 19 && hour < 21) return '戌';
    if (hour >= 21 && hour < 23) return '亥';
    return '子';
  }
  
  // 判断五行相生关系
  isWuxingGenerate(element1, element2) {
    return this.wuxingGenerate[element1] === element2;
  }
  
  // 判断五行相克关系
  isWuxingOvercome(element1, element2) {
    return this.wuxingOvercome[element1] === element2;
  }
  
  // 获取天干索引
  getStemIndex(stem) {
    return this.heavenlyStems.indexOf(stem);
  }
  
  // 获取地支索引
  getBranchIndex(branch) {
    return this.earthlyBranches.indexOf(branch);
  }
  
  // 根据索引获取天干
  getStemByIndex(index) {
    return this.heavenlyStems[index % 10];
  }
  
  // 根据索引获取地支
  getBranchByIndex(index) {
    return this.earthlyBranches[index % 12];
  }
}

module.exports = BaseData;