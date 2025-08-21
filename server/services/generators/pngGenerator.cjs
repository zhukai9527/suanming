/**
 * PNG图片生成器
 * 将分析结果转换为PNG图片格式
 * 使用Puppeteer将SVG转换为PNG
 */

const puppeteer = require('puppeteer');

const generatePNG = async (analysisData, analysisType, userName) => {
  let browser;
  try {
    // 生成SVG内容
    const svgContent = await generateImageData(analysisData, analysisType, userName);
    
    // 创建包含SVG的HTML页面
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; }
    svg { display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
    
    // 启动puppeteer浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-plugins'
      ],
      timeout: 30000
    });
    
    const page = await browser.newPage();
    
    // 设置页面内容
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // 设置视口大小
    await page.setViewport({ width: 800, height: 1200 });
    
    // 截图生成PNG
    const pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false
    });
    
    // 确保返回的是Buffer对象
    if (!Buffer.isBuffer(pngBuffer)) {
      console.warn('Puppeteer返回的不是Buffer，正在转换:', typeof pngBuffer);
      return Buffer.from(pngBuffer);
    }
    
    return pngBuffer;
    
  } catch (error) {
    console.error('生成PNG失败:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * 生成图片数据（SVG格式）
 */
const generateImageData = async (analysisData, analysisType, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  const analysisTypeLabel = getAnalysisTypeLabel(analysisType);
  
  // 生成SVG内容
  let svg = `
<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${getSVGStyles()}
    </style>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="800" height="1200" fill="#f9f9f9"/>
  
  <!-- 头部 -->
  <rect width="800" height="200" fill="url(#headerGradient)"/>
  
  <!-- 标题 -->
  <text x="400" y="60" class="main-title" text-anchor="middle" fill="white" filter="url(#shadow)">神机阁</text>
  <text x="400" y="90" class="subtitle" text-anchor="middle" fill="white">专业命理分析平台</text>
  
  <!-- 分割线 -->
  <line x1="100" y1="110" x2="700" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  
  <!-- 报告信息 -->
  <text x="400" y="140" class="report-title" text-anchor="middle" fill="white">${analysisTypeLabel}分析报告</text>
  <text x="200" y="170" class="info-text" fill="white">姓名：${userName || '用户'}</text>
  <text x="500" y="170" class="info-text" fill="white">生成时间：${timestamp.split(' ')[0]}</text>
  
  <!-- 内容区域背景 -->
  <rect x="50" y="220" width="700" height="900" fill="white" rx="10" ry="10" filter="url(#shadow)"/>
  
  `;
  
  // 根据分析类型添加不同内容
  let yOffset = 260;
  
  switch (analysisType) {
    case 'bazi':
      yOffset = addBaziContent(svg, analysisData, yOffset);
      break;
    case 'ziwei':
      yOffset = addZiweiContent(svg, analysisData, yOffset);
      break;
    case 'yijing':
      yOffset = addYijingContent(svg, analysisData, yOffset);
      break;
  }
  
  // 页脚
  svg += `
  <!-- 页脚 -->
  <rect x="50" y="1140" width="700" height="50" fill="#f8f9fa" rx="0" ry="0"/>
  <text x="400" y="1160" class="footer-text" text-anchor="middle" fill="#666">本报告由神机阁AI命理分析平台生成，仅供参考</text>
  <text x="400" y="1180" class="footer-text" text-anchor="middle" fill="#666">© 2025 神机阁 - AI命理分析平台</text>
  
</svg>
  `;
  
  return svg;
};

/**
 * 添加八字命理内容
 */
const addBaziContent = (svg, analysisData, yOffset) => {
  let content = '';
  
  // 基本信息
  if (analysisData.basic_info) {
    content += `
    <!-- 基本信息 -->
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">📋 基本信息</text>
    `;
    yOffset += 40;
    
    if (analysisData.basic_info.personal_data) {
      const personal = analysisData.basic_info.personal_data;
      const genderText = personal.gender === 'male' ? '男' : personal.gender === 'female' ? '女' : personal.gender || '未提供';
      
      content += `
      <text x="100" y="${yOffset}" class="info-label" fill="#333">姓名：</text>
      <text x="160" y="${yOffset}" class="info-value" fill="#666">${personal.name || '未提供'}</text>
      <text x="400" y="${yOffset}" class="info-label" fill="#333">性别：</text>
      <text x="460" y="${yOffset}" class="info-value" fill="#666">${genderText}</text>
      `;
      yOffset += 30;
      
      content += `
      <text x="100" y="${yOffset}" class="info-label" fill="#333">出生日期：</text>
      <text x="180" y="${yOffset}" class="info-value" fill="#666">${personal.birth_date || '未提供'}</text>
      `;
      yOffset += 30;
      
      content += `
      <text x="100" y="${yOffset}" class="info-label" fill="#333">出生时间：</text>
      <text x="180" y="${yOffset}" class="info-value" fill="#666">${personal.birth_time || '未提供'}</text>
      `;
      yOffset += 40;
    }
    
    // 八字信息
    if (analysisData.basic_info.bazi_info) {
      const bazi = analysisData.basic_info.bazi_info;
      content += `
      <text x="100" y="${yOffset}" class="subsection-title" fill="#b91c1c">🔮 八字信息</text>
      `;
      yOffset += 30;
      
      // 表格头
      content += `
      <rect x="100" y="${yOffset}" width="600" height="25" fill="#dc2626" rx="3"/>
      <text x="130" y="${yOffset + 17}" class="table-header" fill="white">柱位</text>
      <text x="230" y="${yOffset + 17}" class="table-header" fill="white">天干</text>
      <text x="330" y="${yOffset + 17}" class="table-header" fill="white">地支</text>
      <text x="430" y="${yOffset + 17}" class="table-header" fill="white">纳音</text>
      `;
      yOffset += 25;
      
      // 表格内容
      const pillars = [
        { name: '年柱', data: bazi.year, nayin: bazi.year_nayin },
        { name: '月柱', data: bazi.month, nayin: bazi.month_nayin },
        { name: '日柱', data: bazi.day, nayin: bazi.day_nayin },
        { name: '时柱', data: bazi.hour, nayin: bazi.hour_nayin }
      ];
      
      pillars.forEach((pillar, index) => {
        const bgColor = index % 2 === 0 ? '#f8f9fa' : 'white';
        content += `
        <rect x="100" y="${yOffset}" width="600" height="25" fill="${bgColor}" stroke="#ddd" stroke-width="0.5"/>
        <text x="130" y="${yOffset + 17}" class="table-cell" fill="#333">${pillar.name}</text>
        <text x="230" y="${yOffset + 17}" class="table-cell" fill="#333">${pillar.data?.split('')[0] || '-'}</text>
        <text x="330" y="${yOffset + 17}" class="table-cell" fill="#333">${pillar.data?.split('')[1] || '-'}</text>
        <text x="430" y="${yOffset + 17}" class="table-cell" fill="#333">${pillar.nayin || '-'}</text>
        `;
        yOffset += 25;
      });
      
      yOffset += 20;
    }
  }
  
  // 五行分析
  if (analysisData.wuxing_analysis && yOffset < 1000) {
    content += `
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">🌟 五行分析</text>
    `;
    yOffset += 40;
    
    if (analysisData.wuxing_analysis.element_distribution) {
      const elements = analysisData.wuxing_analysis.element_distribution;
      const total = Object.values(elements).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
      
      content += `
      <text x="100" y="${yOffset}" class="subsection-title" fill="#b91c1c">五行分布</text>
      `;
      yOffset += 30;
      
      // 五行分布图表
      let xOffset = 120;
      Object.entries(elements).forEach(([element, count]) => {
        const numCount = typeof count === 'number' ? count : 0;
        const percentage = total > 0 ? Math.round((numCount / total) * 100) : 0;
        const barHeight = Math.max(numCount * 20, 5);
        const elementColor = getElementColor(element);
        
        // 柱状图
        content += `
        <rect x="${xOffset}" y="${yOffset + 80 - barHeight}" width="30" height="${barHeight}" fill="${elementColor}" rx="2"/>
        <text x="${xOffset + 15}" y="${yOffset + 100}" class="element-label" text-anchor="middle" fill="#333">${element}</text>
        <text x="${xOffset + 15}" y="${yOffset + 115}" class="element-count" text-anchor="middle" fill="#666">${numCount}</text>
        <text x="${xOffset + 15}" y="${yOffset + 130}" class="element-percent" text-anchor="middle" fill="#666">${percentage}%</text>
        `;
        
        xOffset += 100;
      });
      
      yOffset += 150;
    }
    
    if (analysisData.wuxing_analysis.balance_analysis && yOffset < 1000) {
      content += `
      <text x="100" y="${yOffset}" class="subsection-title" fill="#b91c1c">五行平衡分析</text>
      `;
      yOffset += 25;
      
      // 分析内容（截取前200字符）
      const analysisText = analysisData.wuxing_analysis.balance_analysis.substring(0, 200) + (analysisData.wuxing_analysis.balance_analysis.length > 200 ? '...' : '');
      const lines = wrapText(analysisText, 50);
      
      lines.forEach(line => {
        if (yOffset < 1000) {
          content += `
          <text x="120" y="${yOffset}" class="analysis-text" fill="#555">${line}</text>
          `;
          yOffset += 20;
        }
      });
      
      yOffset += 20;
    }
  }
  
  svg += content;
  return yOffset;
};

/**
 * 添加紫微斗数内容
 */
const addZiweiContent = (svg, analysisData, yOffset) => {
  let content = '';
  
  // 基本信息
  if (analysisData.basic_info) {
    content += `
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">📋 基本信息</text>
    `;
    yOffset += 40;
    
    if (analysisData.basic_info.ziwei_info) {
      const ziwei = analysisData.basic_info.ziwei_info;
      
      if (ziwei.ming_gong) {
        content += `
        <text x="100" y="${yOffset}" class="info-label" fill="#333">命宫：</text>
        <text x="160" y="${yOffset}" class="info-highlight" fill="#dc2626">${ziwei.ming_gong}</text>
        `;
        yOffset += 30;
      }
      
      if (ziwei.wuxing_ju) {
        content += `
        <text x="100" y="${yOffset}" class="info-label" fill="#333">五行局：</text>
        <text x="180" y="${yOffset}" class="info-highlight" fill="#dc2626">${ziwei.wuxing_ju}</text>
        `;
        yOffset += 30;
      }
      
      if (ziwei.main_stars) {
        const starsText = Array.isArray(ziwei.main_stars) ? ziwei.main_stars.join('、') : ziwei.main_stars;
        content += `
        <text x="100" y="${yOffset}" class="info-label" fill="#333">主星：</text>
        <text x="160" y="${yOffset}" class="info-highlight" fill="#dc2626">${starsText}</text>
        `;
        yOffset += 40;
      }
    }
  }
  
  // 星曜分析
  if (analysisData.star_analysis && yOffset < 1000) {
    content += `
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">⭐ 星曜分析</text>
    `;
    yOffset += 40;
    
    if (analysisData.star_analysis.main_stars) {
      content += `
      <text x="100" y="${yOffset}" class="subsection-title" fill="#b91c1c">主星分析</text>
      `;
      yOffset += 30;
      
      if (Array.isArray(analysisData.star_analysis.main_stars)) {
        analysisData.star_analysis.main_stars.slice(0, 3).forEach(star => {
          if (typeof star === 'object' && yOffset < 1000) {
            content += `
            <rect x="100" y="${yOffset - 15}" width="600" height="60" fill="#f1f5f9" rx="5" stroke="#3b82f6" stroke-width="2"/>
            <text x="120" y="${yOffset + 5}" class="star-name" fill="#1e40af">${star.name || star.star}</text>
            `;
            
            if (star.brightness) {
              content += `
              <text x="120" y="${yOffset + 25}" class="star-detail" fill="#333">亮度：${star.brightness}</text>
              `;
            }
            
            if (star.influence) {
              const influenceText = star.influence.substring(0, 60) + (star.influence.length > 60 ? '...' : '');
              content += `
              <text x="120" y="${yOffset + 40}" class="star-detail" fill="#555">影响：${influenceText}</text>
              `;
            }
            
            yOffset += 80;
          }
        });
      }
    }
  }
  
  svg += content;
  return yOffset;
};

/**
 * 添加易经占卜内容
 */
const addYijingContent = (svg, analysisData, yOffset) => {
  let content = '';
  
  // 占卜问题
  if (analysisData.question_analysis) {
    content += `
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">❓ 占卜问题</text>
    `;
    yOffset += 40;
    
    if (analysisData.question_analysis.original_question) {
      content += `
      <text x="100" y="${yOffset}" class="info-label" fill="#333">问题：</text>
      `;
      
      const questionText = analysisData.question_analysis.original_question;
      const questionLines = wrapText(questionText, 45);
      
      questionLines.forEach((line, index) => {
        content += `
        <text x="${index === 0 ? 160 : 120}" y="${yOffset}" class="info-highlight" fill="#dc2626">${line}</text>
        `;
        yOffset += 20;
      });
      
      yOffset += 10;
    }
    
    if (analysisData.question_analysis.question_type) {
      content += `
      <text x="100" y="${yOffset}" class="info-label" fill="#333">问题类型：</text>
      <text x="180" y="${yOffset}" class="info-value" fill="#666">${analysisData.question_analysis.question_type}</text>
      `;
      yOffset += 40;
    }
  }
  
  // 卦象信息
  if (analysisData.hexagram_info && yOffset < 1000) {
    content += `
    <text x="80" y="${yOffset}" class="section-title" fill="#dc2626">🔮 卦象信息</text>
    `;
    yOffset += 40;
    
    if (analysisData.hexagram_info.main_hexagram) {
      const main = analysisData.hexagram_info.main_hexagram;
      
      content += `
      <rect x="100" y="${yOffset - 15}" width="600" height="100" fill="#fef3c7" rx="8" stroke="#fbbf24" stroke-width="2"/>
      <text x="120" y="${yOffset + 10}" class="subsection-title" fill="#92400e">主卦</text>
      
      <text x="120" y="${yOffset + 35}" class="info-label" fill="#333">卦名：</text>
      <text x="180" y="${yOffset + 35}" class="hexagram-name" fill="#dc2626">${main.name || '未知'}</text>
      
      <text x="400" y="${yOffset + 35}" class="info-label" fill="#333">卦象：</text>
      <text x="460" y="${yOffset + 35}" class="hexagram-symbol" fill="#92400e">${main.symbol || ''}</text>
      `;
      
      if (main.meaning) {
        const meaningText = main.meaning.substring(0, 50) + (main.meaning.length > 50 ? '...' : '');
        content += `
        <text x="120" y="${yOffset + 60}" class="info-label" fill="#333">含义：</text>
        <text x="180" y="${yOffset + 60}" class="info-value" fill="#666">${meaningText}</text>
        `;
      }
      
      yOffset += 120;
    }
  }
  
  svg += content;
  return yOffset;
};

/**
 * 获取五行颜色
 */
const getElementColor = (element) => {
  const colors = {
    '木': '#22c55e',
    '火': '#ef4444',
    '土': '#eab308',
    '金': '#64748b',
    '水': '#3b82f6'
  };
  return colors[element] || '#666';
};

/**
 * 文本换行处理
 */
const wrapText = (text, maxLength) => {
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < text.length; i++) {
    currentLine += text[i];
    if (currentLine.length >= maxLength || text[i] === '\n') {
      lines.push(currentLine.trim());
      currentLine = '';
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
};

/**
 * 获取分析类型标签
 */
const getAnalysisTypeLabel = (analysisType) => {
  switch (analysisType) {
    case 'bazi': return '八字命理';
    case 'ziwei': return '紫微斗数';
    case 'yijing': return '易经占卜';
    default: return '命理';
  }
};

/**
 * 获取SVG样式
 */
const getSVGStyles = () => {
  return `
    .main-title {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 36px;
      font-weight: bold;
    }
    
    .subtitle {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 16px;
    }
    
    .report-title {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 24px;
      font-weight: bold;
    }
    
    .info-text {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
    }
    
    .section-title {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 20px;
      font-weight: bold;
    }
    
    .subsection-title {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
    }
    
    .info-label {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
    }
    
    .info-value {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
    }
    
    .info-highlight {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
    }
    
    .table-header {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
    }
    
    .table-cell {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 12px;
    }
    
    .element-label {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
    }
    
    .element-count {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 11px;
    }
    
    .element-percent {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 10px;
    }
    
    .analysis-text {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 12px;
    }
    
    .star-name {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
    }
    
    .star-detail {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 11px;
    }
    
    .hexagram-name {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
    }
    
    .hexagram-symbol {
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
    }
    
    .footer-text {
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 10px;
    }
  `;
};

module.exports = {
  generatePNG
};