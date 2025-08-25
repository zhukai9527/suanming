// 奇门遁甲高级算法测试（简化版）
// 测试核心功能的基本运行情况

const QimenAnalyzer = require('../server/services/qimenAnalyzer.cjs');

class QimenAdvancedTest {
  constructor() {
    this.qimenAnalyzer = new QimenAnalyzer();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始奇门遁甲高级算法测试\n');
    
    try {
      // 基础功能测试
      await this.testBasicFunctionality();
      
      // 奇门盘计算测试
      await this.testQimenPanCalculation();
      
      // 用神选择测试
      await this.testYongShenSelection();
      
      // 格局识别测试
      await this.testPatternRecognition();
      
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

  // 基础功能测试
  async testBasicFunctionality() {
    console.log('🔧 测试基础功能...');
    
    try {
      // 测试QimenAnalyzer实例化
      this.assert(
        this.qimenAnalyzer instanceof QimenAnalyzer,
        'QimenAnalyzer实例化成功'
      );
      
      // 测试基础组件存在
      this.assert(
        this.qimenAnalyzer.calculator !== undefined,
        'Calculator组件存在'
      );
      
      this.assert(
        this.qimenAnalyzer.patternAnalyzer !== undefined,
        'PatternAnalyzer组件存在'
      );
      
      this.assert(
        this.qimenAnalyzer.yongShenAnalyzer !== undefined,
        'YongShenAnalyzer组件存在'
      );
      
      this.assert(
        this.qimenAnalyzer.predictionGenerator !== undefined,
        'PredictionGenerator组件存在'
      );
      
      console.log('  ✅ 基础功能测试通过');
      
    } catch (error) {
      this.recordError('基础功能', '组件初始化', error.message);
    }
  }

  // 奇门盘计算测试
  async testQimenPanCalculation() {
    console.log('📊 测试奇门盘计算...');
    
    const testCases = [
      {
        date: new Date(2024, 2, 15, 10, 30),
        desc: '春分时期奇门盘'
      },
      {
        date: new Date(2024, 5, 21, 12, 0),
        desc: '夏至时期奇门盘'
      },
      {
        date: new Date(2024, 8, 23, 6, 0),
        desc: '秋分时期奇门盘'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testCase.date);
        
        // 验证奇门盘基本结构
        this.assert(
          qimenPan && typeof qimenPan === 'object',
          `奇门盘对象存在 - ${testCase.desc}`
        );
        
        this.assert(
          qimenPan.dipan && Array.isArray(qimenPan.dipan),
          `地盘数组存在 - ${testCase.desc}`
        );
        
        this.assert(
          qimenPan.dipan.length === 9,
          `地盘九宫结构 - ${testCase.desc}`
        );
        
        this.assert(
          qimenPan.tianpan && Array.isArray(qimenPan.tianpan),
          `天盘数组存在 - ${testCase.desc}`
        );
        
        this.assert(
          qimenPan.tianpan.length === 9,
          `天盘九宫结构 - ${testCase.desc}`
        );
        
        this.assert(
          qimenPan.timeInfo && typeof qimenPan.timeInfo === 'object',
          `时间信息存在 - ${testCase.desc}`
        );
        
        this.assert(
          typeof qimenPan.jushu === 'number',
          `局数为数字 - ${testCase.desc}`
        );
        
        this.assert(
          typeof qimenPan.yindun === 'boolean',
          `阴阳遁标识存在 - ${testCase.desc}`
        );
        
        console.log(`  ✅ ${testCase.desc}: 局数${qimenPan.jushu}, ${qimenPan.yindun ? '阴遁' : '阳遁'}`);
        
      } catch (error) {
        this.recordError('奇门盘计算', testCase.desc, error.message);
      }
    }
  }

  // 用神选择测试
  async testYongShenSelection() {
    console.log('⚡ 测试用神选择...');
    
    const testCases = [
      {
        question: '今年的婚姻运势如何？',
        birthData: { gender: '男' },
        expectedType: '婚姻',
        desc: '男性婚姻问题'
      },
      {
        question: '投资股票能赚钱吗？',
        birthData: { gender: '女' },
        expectedType: '求财',
        desc: '女性求财问题'
      },
      {
        question: '身体健康状况如何？',
        birthData: { gender: '男' },
        expectedType: '疾病',
        desc: '健康问题'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const testDate = new Date(2024, 2, 15, 10, 30);
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testDate);
        
        // 选择用神
        const yongshen = this.qimenAnalyzer.yongShenAnalyzer.selectYongShen(
          testCase.question,
          testCase.birthData,
          qimenPan
        );
        
        // 验证用神选择结果
        this.assert(
          typeof yongshen === 'object' && yongshen !== null,
          `用神选择成功 - ${testCase.desc}`
        );
        
        this.assert(
          yongshen.questionType === testCase.expectedType,
          `问题类型识别正确 - ${testCase.desc}`
        );
        
        this.assert(
          yongshen.hasOwnProperty('rigan'),
          `日干信息存在 - ${testCase.desc}`
        );
        
        console.log(`  ✅ ${testCase.desc}: 问题类型 ${yongshen.questionType}`);
        
      } catch (error) {
        this.recordError('用神选择', testCase.desc, error.message);
      }
    }
  }

  // 格局识别测试
  async testPatternRecognition() {
    console.log('🎯 测试格局识别...');
    
    const testCases = [
      {
        date: new Date(2024, 2, 15, 10, 30),
        desc: '春分格局识别'
      },
      {
        date: new Date(2024, 5, 21, 12, 0),
        desc: '夏至格局识别'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testCase.date);
        const patterns = this.qimenAnalyzer.patternAnalyzer.analyzePatterns(qimenPan);
        
        // 验证格局识别结果
        this.assert(
          Array.isArray(patterns),
          `格局识别返回数组 - ${testCase.desc}`
        );
        
        // 验证格局数据结构
        if (patterns.length > 0) {
          const pattern = patterns[0];
          this.assert(
            pattern.hasOwnProperty('name') && 
            pattern.hasOwnProperty('type') && 
            pattern.hasOwnProperty('score'),
            `格局数据结构完整 - ${testCase.desc}`
          );
          
          this.assert(
            typeof pattern.score === 'number',
            `格局评分为数字 - ${testCase.desc}`
          );
        }
        
        console.log(`  ✅ ${testCase.desc}: 识别到 ${patterns.length} 个格局`);
        
      } catch (error) {
        this.recordError('格局识别', testCase.desc, error.message);
      }
    }
  }

  // 预测生成测试
  async testPredictionGeneration() {
    console.log('🔮 测试预测生成...');
    
    const testCases = [
      {
        date: new Date(2024, 2, 15, 10, 30),
        question: '今年能升职加薪吗？',
        birthData: { gender: '男' },
        desc: '事业发展预测'
      },
      {
        date: new Date(2024, 5, 21, 14, 0),
        question: '这次投资能成功吗？',
        birthData: { gender: '女' },
        desc: '投资成功预测'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const qimenPan = this.qimenAnalyzer.calculator.calculateQimenPan(testCase.date);
        
        // 选择和分析用神
        const yongshen = this.qimenAnalyzer.yongShenAnalyzer.selectYongShen(
          testCase.question,
          testCase.birthData,
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
          testCase.question,
          patterns
        );
        
        // 验证预测结果
        this.assert(
          prediction && typeof prediction === 'object',
          `预测结果存在 - ${testCase.desc}`
        );
        
        this.assert(
          prediction.hasOwnProperty('overall') && 
          prediction.hasOwnProperty('probability'),
          `预测核心信息完整 - ${testCase.desc}`
        );
        
        this.assert(
          typeof prediction.probability === 'number' &&
          prediction.probability >= 0 &&
          prediction.probability <= 100,
          `成功概率有效 - ${testCase.desc}`
        );
        
        console.log(`  ✅ ${testCase.desc}: 概率 ${prediction.probability}%`);
        
      } catch (error) {
        this.recordError('预测生成', testCase.desc, error.message);
      }
    }
  }

  // 断言方法
  assert(condition, message) {
    if (condition) {
      this.testResults.passed++;
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
    console.log('\n📊 高级算法测试结果汇总:');
    console.log(`✅ 通过: ${this.testResults.passed}`);
    console.log(`❌ 失败: ${this.testResults.failed}`);
    
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(2) : 0;
    console.log(`📈 成功率: ${successRate}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ 错误详情:');
      this.testResults.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
      
      if (this.testResults.errors.length > 10) {
        console.log(`... 还有 ${this.testResults.errors.length - 10} 个错误`);
      }
    }
    
    console.log('\n🎉 奇门遁甲高级算法测试完成!');
    
    // 性能评估
    if (successRate >= 95) {
      console.log('🏆 算法质量: 优秀');
    } else if (successRate >= 90) {
      console.log('🥇 算法质量: 良好');
    } else if (successRate >= 80) {
      console.log('🥈 算法质量: 合格');
    } else {
      console.log('🥉 算法质量: 需要改进');
    }
    
    console.log('\n📈 测试统计:');
    console.log(`总测试数: ${totalTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`错误数: ${this.testResults.errors.length}`);
  }
}

// 运行测试
if (require.main === module) {
  const tester = new QimenAdvancedTest();
  tester.runAllTests().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = QimenAdvancedTest;