// 奇门遁甲核心功能测试
// 测试时间转换、节气计算、起局算法等核心功能

const QimenAnalyzer = require('../server/services/qimenAnalyzer.cjs');
const TimeConverter = require('../server/utils/timeConverter.cjs');
const SolarTerms = require('../server/utils/solarTerms.cjs');

// 测试配置
const TEST_CONFIG = {
  verbose: true,
  testCases: {
    timeConversion: 20,
    solarTerms: 12,
    qimenCalculation: 10
  }
};

class QimenCoreTest {
  constructor() {
    this.qimenAnalyzer = new QimenAnalyzer();
    this.timeConverter = new TimeConverter();
    this.solarTerms = new SolarTerms();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始奇门遁甲核心功能测试\n');
    
    try {
      // 时间转换测试
      await this.testTimeConversion();
      
      // 节气计算测试
      await this.testSolarTermsCalculation();
      
      // 奇门起局测试
      await this.testQimenCalculation();
      
      // 格局识别测试
      await this.testPatternRecognition();
      
      // 用神分析测试
      await this.testYongShenAnalysis();
      
      // 预测生成测试
      await this.testPredictionGeneration();
      
      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
      this.testResults.errors.push({
        test: '测试执行',
        error: error.message
      });
    }
  }

  // 时间转换测试
  async testTimeConversion() {
    console.log('📅 测试时间转换功能...');
    
    const testCases = [
      { date: new Date(2024, 2, 15, 10, 30), desc: '2024年3月15日10:30' },
      { date: new Date(2023, 11, 22, 0, 0), desc: '2023年12月22日0:00（冬至）' },
      { date: new Date(2024, 5, 21, 12, 0), desc: '2024年6月21日12:00（夏至）' },
      { date: new Date(2024, 8, 23, 6, 0), desc: '2024年9月23日6:00（秋分）' },
      { date: new Date(2024, 2, 20, 18, 0), desc: '2024年3月20日18:00（春分）' }
    ];
    
    for (const testCase of testCases) {
      try {
        const fourPillars = this.timeConverter.getFourPillars(testCase.date);
        
        // 验证四柱格式
        this.assert(
          fourPillars.year && fourPillars.year.gan && fourPillars.year.zhi,
          `年柱格式正确 - ${testCase.desc}`
        );
        
        this.assert(
          fourPillars.month && fourPillars.month.gan && fourPillars.month.zhi,
          `月柱格式正确 - ${testCase.desc}`
        );
        
        this.assert(
          fourPillars.day && fourPillars.day.gan && fourPillars.day.zhi,
          `日柱格式正确 - ${testCase.desc}`
        );
        
        this.assert(
          fourPillars.hour && fourPillars.hour.gan && fourPillars.hour.zhi,
          `时柱格式正确 - ${testCase.desc}`
        );
        
        // 验证干支有效性
        this.assert(
          this.timeConverter.isValidGanZhi(fourPillars.year.gan, fourPillars.year.zhi),
          `年柱干支有效 - ${testCase.desc}`
        );
        
        if (TEST_CONFIG.verbose) {
          console.log(`  ✅ ${testCase.desc}: ${fourPillars.yearString} ${fourPillars.monthString} ${fourPillars.dayString} ${fourPillars.hourString}`);
        }
        
      } catch (error) {
        this.recordError('时间转换', testCase.desc, error.message);
      }
    }
  }

  // 节气计算测试
  async testSolarTermsCalculation() {
    console.log('🌸 测试节气计算功能...');
    
    const testYears = [2023, 2024, 2025];
    
    for (const year of testYears) {
      try {
        const solarTerms = this.solarTerms.calculateYearSolarTerms(year);
        
        // 验证节气数量
        this.assert(
          solarTerms.length === 24,
          `${year}年节气数量正确（24个）`
        );
        
        // 验证节气顺序
        for (let i = 1; i < solarTerms.length; i++) {
          this.assert(
            solarTerms[i].timestamp > solarTerms[i-1].timestamp,
            `${year}年节气时间顺序正确`
          );
        }
        
        // 验证特定节气
        const dongzhi = solarTerms.find(term => term.name === '冬至');
        const xiazhi = solarTerms.find(term => term.name === '夏至');
        
        this.assert(
          dongzhi && dongzhi.date.getMonth() === 11, // 12月
          `${year}年冬至在12月`
        );
        
        this.assert(
          xiazhi && xiazhi.date.getMonth() === 5, // 6月
          `${year}年夏至在6月`
        );
        
        // 测试阴阳遁判断
        this.assert(
          !this.solarTerms.isYindunSeason('立春'),
          '立春为阳遁季节'
        );
        
        this.assert(
          this.solarTerms.isYindunSeason('夏至'),
          '夏至为阴遁季节'
        );
        
        if (TEST_CONFIG.verbose) {
          console.log(`  ✅ ${year}年节气计算正确，冬至: ${dongzhi.date.toLocaleDateString()}，夏至: ${xiazhi.date.toLocaleDateString()}`);
        }
        
      } catch (error) {
        this.recordError('节气计算', `${year}年`, error.message);
      }
    }
  }

  // 奇门起局测试
  async testQimenCalculation() {
    console.log('🔮 测试奇门起局功能...');
    
    const testCases = [
      { date: new Date(2024, 2, 15, 10, 30), desc: '春分前后' },
      { date: new Date(2024, 5, 21, 12, 0), desc: '夏至时刻' },
      { date: new Date(2024, 8, 23, 6, 0), desc: '秋分时刻' },
      { date: new Date(2024, 11, 22, 0, 0), desc: '冬至时刻' }
    ];
    
    for (const testCase of testCases) {
      try {
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testCase.date);
        
        // 验证基本结构
        this.assert(
          qimenPan.timeInfo && qimenPan.dipan && qimenPan.tianpan,
          `奇门盘基本结构完整 - ${testCase.desc}`
        );
        
        // 验证时间信息
        this.assert(
          qimenPan.timeInfo.jushu >= 1 && qimenPan.timeInfo.jushu <= 9,
          `局数有效（1-9） - ${testCase.desc}`
        );
        
        this.assert(
          typeof qimenPan.timeInfo.yindun === 'boolean',
          `阴阳遁标识正确 - ${testCase.desc}`
        );
        
        // 验证地盘结构
        this.assert(
          qimenPan.dipan.length === 9,
          `地盘九宫结构正确 - ${testCase.desc}`
        );
        
        // 验证天盘结构
        this.assert(
          qimenPan.tianpan.length === 9,
          `天盘九宫结构正确 - ${testCase.desc}`
        );
        
        // 验证值符值使
        this.assert(
          qimenPan.zhifu && qimenPan.zhishi,
          `值符值使存在 - ${testCase.desc}`
        );
        
        // 验证三奇六仪完整性
        const ganzhiSet = new Set();
        const actualGanzhi = [];
        qimenPan.dipan.forEach((item, index) => {
          if (item && item.ganzhi) {
            ganzhiSet.add(item.ganzhi);
            actualGanzhi.push(item.ganzhi);
          } else {
            actualGanzhi.push(null);
          }
        });
        
        const expectedGanzhi = ['戊', '己', '庚', '辛', '壬', '癸', '乙', '丙', '丁'];
        const isComplete = expectedGanzhi.every(gz => ganzhiSet.has(gz));
        
        if (!isComplete && TEST_CONFIG.verbose) {
          console.log(`    调试信息 - ${testCase.desc}:`);
          console.log(`    实际干支: [${actualGanzhi.join(', ')}]`);
          console.log(`    缺失干支: [${expectedGanzhi.filter(gz => !ganzhiSet.has(gz)).join(', ')}]`);
        }
        
        this.assert(
          isComplete,
          `三奇六仪完整 - ${testCase.desc}`
        );
        
        if (TEST_CONFIG.verbose) {
          console.log(`  ✅ ${testCase.desc}: ${qimenPan.timeInfo.yindun ? '阴遁' : '阳遁'}${qimenPan.timeInfo.jushu}局，值符${qimenPan.zhifu}，值使${qimenPan.zhishi}`);
        }
        
      } catch (error) {
        this.recordError('奇门起局', testCase.desc, error.message);
      }
    }
  }

  // 格局识别测试
  async testPatternRecognition() {
    console.log('🎯 测试格局识别功能...');
    
    try {
      // 创建测试用的奇门盘
      const testDate = new Date(2024, 2, 15, 10, 30);
      const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testDate);
      
      // 分析格局
      const patterns = this.qimenAnalyzer.patternAnalyzer.analyzePatterns(qimenPan);
      
      // 验证格局分析结果
      this.assert(
        Array.isArray(patterns),
        '格局分析返回数组'
      );
      
      // 验证格局数据结构
      if (patterns.length > 0) {
        const pattern = patterns[0];
        this.assert(
          pattern.hasOwnProperty('name') && pattern.hasOwnProperty('type'),
          '格局数据结构正确'
        );
      }
      
      if (TEST_CONFIG.verbose) {
        console.log(`  ✅ 识别到 ${patterns.length} 个格局`);
        patterns.slice(0, 3).forEach(pattern => {
          console.log(`    - ${pattern.name || '未知格局'}: ${pattern.level || '未知等级'}`);
        });
      }
      
    } catch (error) {
      this.recordError('格局识别', '基础测试', error.message);
    }
  }

  // 用神分析测试
  async testYongShenAnalysis() {
    console.log('⚡ 测试用神分析功能...');
    
    const testQuestions = [
      { question: '今年的财运如何？', type: '求财' },
      { question: '什么时候能结婚？', type: '婚姻' },
      { question: '身体健康状况如何？', type: '疾病' },
      { question: '工作能否顺利？', type: '求职' }
    ];
    
    for (const testCase of testQuestions) {
      try {
        const testDate = new Date(2024, 2, 15, 10, 30);
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testDate);
        
        // 选择用神
        const yongshen = this.qimenAnalyzer.yongShenAnalyzer.selectYongShen(
          testCase.question,
          null,
          qimenPan
        );
        
        // 验证用神选择
        this.assert(
          typeof yongshen === 'object' && yongshen !== null,
          `用神选择成功 - ${testCase.type}`
        );
        
        // 分析用神
        const analysis = this.qimenAnalyzer.yongShenAnalyzer.analyzeYongShen(
          yongshen,
          qimenPan
        );
        
        // 验证用神分析
        this.assert(
          typeof analysis === 'object' && analysis !== null,
          `用神分析成功 - ${testCase.type}`
        );
        
        if (TEST_CONFIG.verbose) {
          console.log(`  ✅ ${testCase.type}用神分析完成，用神数量: ${Object.keys(yongshen).length}`);
        }
        
      } catch (error) {
        this.recordError('用神分析', testCase.type, error.message);
      }
    }
  }

  // 预测生成测试
  async testPredictionGeneration() {
    console.log('🔮 测试预测生成功能...');
    
    try {
      const testDate = new Date(2024, 2, 15, 10, 30);
      const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testDate);
      const question = '今年的事业发展如何？';
      
      // 选择和分析用神
      const yongshen = this.qimenAnalyzer.yongShenAnalyzer.selectYongShen(
        question,
        null,
        qimenPan
      );
      
      const yongShenAnalysis = this.qimenAnalyzer.yongShenAnalyzer.analyzeYongShen(
        yongshen,
        qimenPan
      );
      
      // 分析格局
      const patterns = this.qimenAnalyzer.patternAnalyzer.analyzePatterns(qimenPan);
      
      // 生成预测
      const prediction = this.qimenAnalyzer.predictionGenerator.generatePrediction(
        qimenPan,
        yongShenAnalysis,
        question,
        patterns
      );
      
      // 验证预测结果
      this.assert(
        prediction && typeof prediction === 'object',
        '预测结果生成成功'
      );
      
      this.assert(
        prediction.overall && typeof prediction.overall === 'string',
        '总体预测存在'
      );
      
      this.assert(
        typeof prediction.probability === 'number' && 
        prediction.probability >= 0 && 
        prediction.probability <= 100,
        '成功概率有效（0-100）'
      );
      
      this.assert(
        Array.isArray(prediction.details),
        '详细分析为数组'
      );
      
      this.assert(
        Array.isArray(prediction.suggestions),
        '建议为数组'
      );
      
      if (TEST_CONFIG.verbose) {
        console.log(`  ✅ 预测生成成功`);
        console.log(`    总体: ${prediction.overall}`);
        console.log(`    概率: ${prediction.probability}%`);
        console.log(`    详情数量: ${prediction.details.length}`);
        console.log(`    建议数量: ${prediction.suggestions.length}`);
      }
      
    } catch (error) {
      this.recordError('预测生成', '基础测试', error.message);
    }
  }

  // 断言方法
  assert(condition, message) {
    if (condition) {
      this.testResults.passed++;
      if (TEST_CONFIG.verbose) {
        // console.log(`    ✅ ${message}`);
      }
    } else {
      this.testResults.failed++;
      console.log(`    ❌ ${message}`);
      this.testResults.errors.push({
        test: message,
        error: '断言失败'
      });
    }
  }

  // 记录错误
  recordError(testType, testCase, errorMessage) {
    this.testResults.failed++;
    this.testResults.errors.push({
      test: `${testType} - ${testCase}`,
      error: errorMessage
    });
    console.log(`    ❌ ${testType} - ${testCase}: ${errorMessage}`);
  }

  // 打印测试结果
  printTestResults() {
    console.log('\n📊 测试结果汇总:');
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    console.log(`📈 成功率: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    console.log('\n🎉 奇门遁甲核心功能测试完成!');
  }
}

// 运行测试
if (require.main === module) {
  const tester = new QimenCoreTest();
  tester.runAllTests().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = QimenCoreTest;