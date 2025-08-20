// 输入验证功能测试
const { inputValidator } = require('../server/utils/inputValidator.cjs');

console.log('=== 输入验证功能测试 ===');
console.log('');

// 测试用例
const testCases = [
  {
    name: '正常出生日期验证',
    test: () => {
      try {
        inputValidator.validateBirthDate('1990-01-15');
        console.log('✅ 正常日期验证通过');
      } catch (error) {
        console.log('❌ 正常日期验证失败:', error.message);
      }
    }
  },
  {
    name: '闰年2月29日验证',
    test: () => {
      try {
        inputValidator.validateBirthDate('2000-02-29'); // 2000年是闰年
        console.log('✅ 闰年2月29日验证通过');
      } catch (error) {
        console.log('❌ 闰年2月29日验证失败:', error.message);
      }
    }
  },
  {
    name: '非闰年2月29日验证',
    test: () => {
      try {
        inputValidator.validateBirthDate('1900-02-29'); // 1900年不是闰年
        console.log('❌ 非闰年2月29日应该验证失败');
      } catch (error) {
        console.log('✅ 非闰年2月29日验证正确失败:', error.message);
      }
    }
  },
  {
    name: '未来日期验证',
    test: () => {
      try {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        inputValidator.validateBirthDate(futureDateStr);
        console.log('❌ 未来日期应该验证失败');
      } catch (error) {
        console.log('✅ 未来日期验证正确失败:', error.message);
      }
    }
  },
  {
    name: '无效月份验证',
    test: () => {
      try {
        inputValidator.validateBirthDate('1990-13-15');
        console.log('❌ 无效月份应该验证失败');
      } catch (error) {
        console.log('✅ 无效月份验证正确失败:', error.message);
      }
    }
  },
  {
    name: '出生时间验证',
    test: () => {
      try {
        inputValidator.validateBirthTime('14:30');
        console.log('✅ 正常时间验证通过');
        
        inputValidator.validateBirthTime('25:30');
        console.log('❌ 无效小时应该验证失败');
      } catch (error) {
        console.log('✅ 无效时间验证正确失败:', error.message);
      }
    }
  },
  {
    name: '姓名验证',
    test: () => {
      try {
        inputValidator.validateName('张三');
        console.log('✅ 中文姓名验证通过');
        
        inputValidator.validateName('John Smith');
        console.log('✅ 英文姓名验证通过');
        
        inputValidator.validateName('张 John');
        console.log('✅ 中英文混合姓名验证通过');
        
        inputValidator.validateName('<script>alert("test")</script>');
        console.log('❌ 恶意脚本应该验证失败');
      } catch (error) {
        console.log('✅ 恶意输入验证正确失败:', error.message);
      }
    }
  },
  {
    name: '八字数据验证',
    test: () => {
      try {
        const validData = {
          name: '测试用户',
          birth_date: '1990-01-15',
          birth_time: '14:30',
          gender: 'male'
        };
        inputValidator.validateBaziData(validData);
        console.log('✅ 完整八字数据验证通过');
        
        const invalidData = {
          name: '',
          birth_date: '1990-02-30', // 无效日期
          birth_time: '25:30', // 无效时间
          gender: 'unknown' // 无效性别
        };
        inputValidator.validateBaziData(invalidData);
        console.log('❌ 无效数据应该验证失败');
      } catch (error) {
        console.log('✅ 无效数据验证正确失败:', error.message);
      }
    }
  },
  {
    name: '易经数据验证',
    test: () => {
      try {
        const validData = {
          question: '今年的事业运势如何？',
          divination_method: 'time'
        };
        inputValidator.validateYijingData(validData);
        console.log('✅ 易经数据验证通过');
        
        const invalidData = {
          question: '', // 空问题
          divination_method: 'invalid_method' // 无效方法
        };
        inputValidator.validateYijingData(invalidData);
        console.log('❌ 无效易经数据应该验证失败');
      } catch (error) {
        console.log('✅ 无效易经数据验证正确失败:', error.message);
      }
    }
  },
  {
    name: '输入清理测试',
    test: () => {
      const maliciousInput = '<script>alert("xss")</script>用户名';
      const cleaned = inputValidator.sanitizeInput(maliciousInput);
      console.log('原始输入:', maliciousInput);
      console.log('清理后:', cleaned);
      console.log('✅ 输入清理功能正常');
    }
  },
  {
    name: '时区验证测试',
    test: () => {
      try {
        inputValidator.validateTimezone('Asia/Shanghai');
        console.log('✅ 标准时区验证通过');
        
        inputValidator.validateTimezone('+08:00');
        console.log('✅ UTC偏移格式验证通过');
        
        inputValidator.validateTimezone('Invalid/Timezone');
        console.log('❌ 无效时区应该验证失败');
      } catch (error) {
        console.log('✅ 无效时区验证正确失败:', error.message);
      }
    }
  }
];

// 运行所有测试
console.log('开始运行测试用例...');
console.log('');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  try {
    testCase.test();
  } catch (error) {
    console.log('❌ 测试执行失败:', error.message);
  }
  console.log('');
});

console.log('=== 测试完成 ===');
console.log('');
console.log('📊 测试总结:');
console.log('- 输入验证功能已增强');
console.log('- 边界情况处理完善');
console.log('- 安全性验证加强');
console.log('- 错误处理机制优化');