// 集成测试 - 测试前后端主要功能
const fetch = require('node-fetch');
const assert = require('assert');

// 测试配置
const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// 测试数据 - 使用随机邮箱避免冲突
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'test123456',
  full_name: '测试用户'
};

console.log('使用测试邮箱:', testUser.email);

const testBirthData = {
  name: '张三',
  birth_date: '1990-05-15',
  birth_time: '14:30',
  gender: 'male',
  location: '北京'
};

let authToken = null;
let userId = null;

// 辅助函数
async function makeRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  const data = await response.json();
  return { response, data };
}

// 测试套件
async function runTests() {
  console.log('🚀 开始集成测试...');
  
  try {
    // 1. 测试健康检查
    await testHealthCheck();
    
    // 2. 测试用户注册
    await testUserRegistration();
    
    // 3. 测试用户登录
    await testUserLogin();
    
    // 4. 测试获取用户信息
    await testGetUserInfo();
    
    // 5. 测试八字分析
    await testBaziAnalysis();
    
    // 6. 测试紫微分析
    await testZiweiAnalysis();
    
    // 7. 测试易经分析
    await testYijingAnalysis();
    
    // 8. 测试历史记录
    await testHistoryRecords();
    
    // 9. 测试用户档案
    await testUserProfile();
    
    // 10. 测试用户登出
    await testUserLogout();
    
    console.log('✅ 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 测试健康检查
async function testHealthCheck() {
  console.log('📋 测试健康检查...');
  
  const { response, data } = await makeRequest('/health');
  
  assert.strictEqual(response.status, 200, '健康检查应该返回 200');
  assert.strictEqual(data.status, 'healthy', '健康状态应该为 healthy');
  
  console.log('✅ 健康检查通过');
}

// 测试用户注册
async function testUserRegistration() {
  console.log('📋 测试用户注册...');
  
  const { response, data } = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (response.status === 409 || (response.status === 400 && data.error && data.error.code === 'EMAIL_EXISTS')) {
    console.log('⚠️ 用户已存在，跳过注册测试');
    return;
  }
  
  if (response.status !== 200 && response.status !== 201) {
    console.error('注册失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`注册应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(data.data && data.data.user, '应该返回用户信息');
  assert(data.data && data.data.token, '应该返回认证令牌');
  
  authToken = data.data.token;
  userId = data.data.user.id;
  
  console.log('✅ 用户注册通过');
}

// 测试用户登录
async function testUserLogin() {
  console.log('📋 测试用户登录...');
  
  const { response, data } = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (response.status !== 200) {
    console.error('登录失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`登录应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(data.data && data.data.user, '应该返回用户信息');
  assert(data.data && data.data.token, '应该返回认证令牌');
  
  authToken = data.data.token;
  userId = data.data.user.id;
  
  console.log('✅ 用户登录通过');
}

// 测试获取用户信息
async function testGetUserInfo() {
  console.log('📋 测试获取用户信息...');
  
  const { response, data } = await makeRequest('/auth/me');
  
  assert.strictEqual(response.status, 200, '获取用户信息应该成功');
  assert(data.data.user, '应该返回用户信息');
  assert.strictEqual(data.data.user.email, testUser.email, '邮箱应该匹配');
  
  console.log('✅ 获取用户信息通过');
}

// 测试八字分析
async function testBaziAnalysis() {
  console.log('📋 测试八字分析...');
  
  const { response, data } = await makeRequest('/analysis/bazi', {
    method: 'POST',
    body: JSON.stringify({ birth_data: testBirthData })
  });
  
  if (response.status !== 200) {
    console.error('八字分析失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`八字分析应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(data.data && data.data.analysis, '应该返回分析结果');
  // 注意：八字分析不存储历史记录，所以没有 record_id
  
  console.log('✅ 八字分析通过');
}

// 测试紫微分析
async function testZiweiAnalysis() {
  console.log('📋 测试紫微分析...');
  
  const { response, data } = await makeRequest('/analysis/ziwei', {
    method: 'POST',
    body: JSON.stringify({ birth_data: testBirthData })
  });
  
  if (response.status !== 200) {
    console.error('紫微分析失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`紫微分析应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(data.data && data.data.analysis, '应该返回分析结果');
  // 注意：紫微分析不存储历史记录，所以没有 record_id
  
  console.log('✅ 紫微分析通过');
}

// 测试易经分析
async function testYijingAnalysis() {
  console.log('📋 测试易经分析...');
  
  const yijingData = {
    question: '今年运势如何？',
    method: 'coin',
    hexagram: '111111'
  };
  
  const { response, data } = await makeRequest('/analysis/yijing', {
    method: 'POST',
    body: JSON.stringify(yijingData)
  });
  
  if (response.status !== 200) {
    console.error('易经分析失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`易经分析应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(data.data && data.data.analysis, '应该返回分析结果');
  // 注意：易经分析不存储历史记录，所以没有 record_id
  
  console.log('✅ 易经分析通过');
}

// 测试历史记录
async function testHistoryRecords() {
  console.log('📋 测试历史记录...');
  
  const { response, data } = await makeRequest('/history');
  
  if (response.status !== 200) {
    console.error('获取历史记录失败，状态码:', response.status);
    console.error('错误信息:', data);
    throw new Error(`获取历史记录应该成功，但返回状态码 ${response.status}`);
  }
  
  assert(Array.isArray(data.data), '应该返回数组');
  // 注意：由于分析功能不自动存储历史记录，可能没有历史记录
  console.log('历史记录数量:', data.data.length);
  
  console.log('✅ 历史记录通过');
}

// 测试用户档案
async function testUserProfile() {
  console.log('📋 测试用户档案...');
  
  // 获取档案
  const { response: getResponse, data: getData } = await makeRequest('/profile');
  
  assert.strictEqual(getResponse.status, 200, '获取用户档案应该成功');
  
  // 更新档案
  const profileUpdateData = {
    full_name: '更新的测试用户',
    bio: '这是一个测试用户的简介'
  };
  
  const { response: updateResponse, data: updateResult } = await makeRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileUpdateData)
  });
  
  assert.strictEqual(updateResponse.status, 200, '更新用户档案应该成功');
  
  console.log('✅ 用户档案通过');
}

// 测试用户登出
async function testUserLogout() {
  console.log('📋 测试用户登出...');
  
  const { response, data } = await makeRequest('/auth/logout', {
    method: 'POST'
  });
  
  assert.strictEqual(response.status, 200, '登出应该成功');
  
  // 清除认证令牌
  authToken = null;
  
  console.log('✅ 用户登出通过');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };