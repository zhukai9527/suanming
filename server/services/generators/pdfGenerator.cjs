/**
 * PDF格式生成器
 * 将分析结果转换为PDF文档
 * 使用puppeteer进行HTML到PDF的转换
 */

const puppeteer = require('puppeteer');
const { generateMarkdown } = require('./markdownGenerator.cjs');

const generatePDF = async (analysisData, analysisType, userName) => {
  let browser;
  try {
    // 生成Markdown内容
    const markdownBuffer = await generateMarkdown(analysisData, analysisType, userName);
    
    // 将Buffer转换为字符串
    const markdownString = Buffer.isBuffer(markdownBuffer) ? markdownBuffer.toString('utf8') : String(markdownBuffer);
    
    // 将Markdown转换为HTML
    const htmlContent = convertMarkdownToHTML(markdownString, analysisType, userName);
    
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
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--run-all-compositor-stages-before-draw',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection'
      ],
      timeout: 30000
    });
    
    const page = await browser.newPage();
    
    // 设置页面内容
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    // 确保返回的是Buffer对象
    if (!Buffer.isBuffer(pdfBuffer)) {
      console.warn('Puppeteer返回的不是Buffer，正在转换:', typeof pdfBuffer);
      return Buffer.from(pdfBuffer);
    }
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('生成PDF失败:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * 将Markdown内容转换为适合PDF的HTML
 */
const convertMarkdownToHTML = (markdownContent, analysisType, userName) => {
  // 预处理：分离表格
  const lines = markdownContent.split('\n');
  let html = '';
  let inTable = false;
  let tableRows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测表格开始
    if (line.includes('|') && line.includes('---')) {
      inTable = true;
      // 添加表格头（前一行）
      if (i > 0 && lines[i-1].includes('|')) {
        const headerCells = lines[i-1].split('|').map(cell => cell.trim()).filter(cell => cell);
        tableRows.push('<tr>' + headerCells.map(cell => `<th>${cell}</th>`).join('') + '</tr>');
      }
      continue;
    }
    
    // 处理表格行
    if (inTable && line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 0) {
        tableRows.push('<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>');
      }
      continue;
    }
    
    // 表格结束
    if (inTable && !line.includes('|')) {
      html += '<table>' + tableRows.join('') + '</table>\n';
      tableRows = [];
      inTable = false;
    }
    
    // 处理非表格行
    if (!inTable) {
      html += line + '\n';
    }
  }
  
  // 处理未结束的表格
  if (tableRows.length > 0) {
    html += '<table>' + tableRows.join('') + '</table>\n';
  }
  
  // Markdown到HTML转换
  html = html
    // 标题转换
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // 加粗文本
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 处理列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 将连续的li包装在ul中
    .replace(/(<li>.*<\/li>\s*)+/gs, (match) => {
      return '<ul>' + match + '</ul>';
    })
    // 水平分割线
    .replace(/^---$/gm, '<hr>')
    // 段落处理
    .replace(/\n\s*\n/g, '</p><p>')
    .replace(/^(?!<[h1-6]|<ul|<table|<hr)(.+)$/gm, '<p>$1</p>')
    // 清理多余的p标签
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[^>]+>)/g, '$1')
    .replace(/(<\/[^>]+>)<\/p>/g, '$1')
    // 换行处理
    .replace(/\n/g, '');
  
  // 包装在完整的HTML文档中
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getAnalysisTypeLabel(analysisType)}分析报告</title>
    <style>
        ${getPDFCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${html}
    </div>
</body>
</html>
  `;
};

/**
 * 生成HTML内容
 */
const generateHTML = (analysisData, analysisType, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getAnalysisTypeLabel(analysisType)}分析报告</title>
    <style>
        ${getCSS()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <h1>神机阁</h1>
                <p>专业命理分析平台</p>
            </div>
            <div class="report-info">
                <h2>${getAnalysisTypeLabel(analysisType)}分析报告</h2>
                <p><strong>姓名：</strong>${userName || '用户'}</p>
                <p><strong>生成时间：</strong>${timestamp}</p>
            </div>
        </header>
        
        <main class="content">
  `;
  
  // 根据分析类型生成不同的HTML内容
  switch (analysisType) {
    case 'bazi':
      html += generateBaziHTML(analysisData);
      break;
    case 'ziwei':
      html += generateZiweiHTML(analysisData);
      break;
    case 'yijing':
      html += generateYijingHTML(analysisData);
      break;
  }
  
  html += `
        </main>
        
        <footer class="footer">
            <div class="disclaimer">
                <p><strong>免责声明：</strong></p>
                <p>本报告由神机阁AI命理分析平台生成，仅供参考，请理性对待。</p>
                <p>命理分析不能替代个人努力和理性决策。</p>
            </div>
            <div class="footer-info">
                <p>生成时间：${timestamp}</p>
                <p>© 2025 神机阁 - AI命理分析平台</p>
            </div>
        </footer>
    </div>
</body>
</html>
  `;
  
  return html;
};

/**
 * 生成八字命理HTML内容
 */
const generateBaziHTML = (analysisData) => {
  let html = '';
  
  // 基本信息
  if (analysisData.basic_info) {
    html += `
        <section class="section">
            <h3 class="section-title">📋 基本信息</h3>
            <div class="info-grid">
    `;
    
    if (analysisData.basic_info.personal_data) {
      const personal = analysisData.basic_info.personal_data;
      html += `
                <div class="info-item">
                    <label>姓名：</label>
                    <span>${personal.name || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>性别：</label>
                    <span>${personal.gender === 'male' ? '男' : personal.gender === 'female' ? '女' : personal.gender || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>出生日期：</label>
                    <span>${personal.birth_date || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>出生时间：</label>
                    <span>${personal.birth_time || '未提供'}</span>
                </div>
      `;
      
      if (personal.birth_place) {
        html += `
                <div class="info-item">
                    <label>出生地点：</label>
                    <span>${personal.birth_place}</span>
                </div>
        `;
      }
    }
    
    html += `
            </div>
    `;
    
    // 八字信息
    if (analysisData.basic_info.bazi_info) {
      const bazi = analysisData.basic_info.bazi_info;
      html += `
            <h4 class="subsection-title">🔮 八字信息</h4>
            <table class="bazi-table">
                <thead>
                    <tr>
                        <th>柱位</th>
                        <th>天干</th>
                        <th>地支</th>
                        <th>纳音</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>年柱</td>
                        <td>${bazi.year?.split('')[0] || '-'}</td>
                        <td>${bazi.year?.split('')[1] || '-'}</td>
                        <td>${bazi.year_nayin || '-'}</td>
                    </tr>
                    <tr>
                        <td>月柱</td>
                        <td>${bazi.month?.split('')[0] || '-'}</td>
                        <td>${bazi.month?.split('')[1] || '-'}</td>
                        <td>${bazi.month_nayin || '-'}</td>
                    </tr>
                    <tr>
                        <td>日柱</td>
                        <td>${bazi.day?.split('')[0] || '-'}</td>
                        <td>${bazi.day?.split('')[1] || '-'}</td>
                        <td>${bazi.day_nayin || '-'}</td>
                    </tr>
                    <tr>
                        <td>时柱</td>
                        <td>${bazi.hour?.split('')[0] || '-'}</td>
                        <td>${bazi.hour?.split('')[1] || '-'}</td>
                        <td>${bazi.hour_nayin || '-'}</td>
                    </tr>
                </tbody>
            </table>
      `;
    }
    
    html += `
        </section>
    `;
  }
  
  // 五行分析
  if (analysisData.wuxing_analysis) {
    html += `
        <section class="section">
            <h3 class="section-title">🌟 五行分析</h3>
    `;
    
    if (analysisData.wuxing_analysis.element_distribution) {
      html += `
            <h4 class="subsection-title">五行分布</h4>
            <table class="element-table">
                <thead>
                    <tr>
                        <th>五行</th>
                        <th>数量</th>
                        <th>占比</th>
                        <th>强度</th>
                    </tr>
                </thead>
                <tbody>
      `;
      
      const elements = analysisData.wuxing_analysis.element_distribution;
      const total = Object.values(elements).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
      
      Object.entries(elements).forEach(([element, count]) => {
        const numCount = typeof count === 'number' ? count : 0;
        const percentage = total > 0 ? Math.round((numCount / total) * 100) : 0;
        const strength = numCount >= 3 ? '旺' : numCount >= 2 ? '中' : '弱';
        html += `
                    <tr>
                        <td class="element-${element}">${element}</td>
                        <td>${numCount}</td>
                        <td>${percentage}%</td>
                        <td class="strength-${strength}">${strength}</td>
                    </tr>
        `;
      });
      
      html += `
                </tbody>
            </table>
      `;
    }
    
    if (analysisData.wuxing_analysis.balance_analysis) {
      html += `
            <div class="analysis-content">
                <h4 class="subsection-title">五行平衡分析</h4>
                <p>${analysisData.wuxing_analysis.balance_analysis}</p>
            </div>
      `;
    }
    
    if (analysisData.wuxing_analysis.suggestions) {
      html += `
            <div class="analysis-content">
                <h4 class="subsection-title">调和建议</h4>
                <p>${analysisData.wuxing_analysis.suggestions}</p>
            </div>
      `;
    }
    
    html += `
        </section>
    `;
  }
  
  // 格局分析
  if (analysisData.pattern_analysis) {
    html += `
        <section class="section">
            <h3 class="section-title">🎯 格局分析</h3>
            <div class="pattern-info">
    `;
    
    if (analysisData.pattern_analysis.main_pattern) {
      html += `
                <div class="info-item">
                    <label>主要格局：</label>
                    <span class="highlight">${analysisData.pattern_analysis.main_pattern}</span>
                </div>
      `;
    }
    
    if (analysisData.pattern_analysis.pattern_strength) {
      const strength = analysisData.pattern_analysis.pattern_strength;
      const strengthLabel = strength === 'strong' ? '强' : strength === 'moderate' ? '中等' : strength === 'fair' ? '一般' : '较弱';
      html += `
                <div class="info-item">
                    <label>格局强度：</label>
                    <span class="strength-${strength}">${strengthLabel}</span>
                </div>
      `;
    }
    
    if (analysisData.pattern_analysis.analysis) {
      html += `
                <div class="analysis-content">
                    <h4 class="subsection-title">格局详解</h4>
                    <p>${analysisData.pattern_analysis.analysis}</p>
                </div>
      `;
    }
    
    html += `
            </div>
        </section>
    `;
  }
  
  // 人生指导
  if (analysisData.life_guidance) {
    html += `
        <section class="section">
            <h3 class="section-title">🌟 人生指导</h3>
    `;
    
    if (analysisData.life_guidance.strengths) {
      html += `
            <div class="guidance-item">
                <h4 class="subsection-title">优势特质</h4>
                <div class="guidance-content">
      `;
      
      if (Array.isArray(analysisData.life_guidance.strengths)) {
        html += '<ul>';
        analysisData.life_guidance.strengths.forEach(strength => {
          html += `<li>${strength}</li>`;
        });
        html += '</ul>';
      } else {
        html += `<p>${analysisData.life_guidance.strengths}</p>`;
      }
      
      html += `
                </div>
            </div>
      `;
    }
    
    if (analysisData.life_guidance.challenges) {
      html += `
            <div class="guidance-item">
                <h4 class="subsection-title">需要注意</h4>
                <div class="guidance-content">
      `;
      
      if (Array.isArray(analysisData.life_guidance.challenges)) {
        html += '<ul>';
        analysisData.life_guidance.challenges.forEach(challenge => {
          html += `<li>${challenge}</li>`;
        });
        html += '</ul>';
      } else {
        html += `<p>${analysisData.life_guidance.challenges}</p>`;
      }
      
      html += `
                </div>
            </div>
      `;
    }
    
    if (analysisData.life_guidance.overall_summary) {
      html += `
            <div class="guidance-item">
                <h4 class="subsection-title">综合总结</h4>
                <div class="guidance-content">
                    <p>${analysisData.life_guidance.overall_summary}</p>
                </div>
            </div>
      `;
    }
    
    html += `
        </section>
    `;
  }
  
  return html;
};

/**
 * 生成紫微斗数HTML内容
 */
const generateZiweiHTML = (analysisData) => {
  let html = '';
  
  // 基本信息
  if (analysisData.basic_info) {
    html += `
        <section class="section">
            <h3 class="section-title">📋 基本信息</h3>
            <div class="info-grid">
    `;
    
    if (analysisData.basic_info.personal_data) {
      const personal = analysisData.basic_info.personal_data;
      html += `
                <div class="info-item">
                    <label>姓名：</label>
                    <span>${personal.name || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>性别：</label>
                    <span>${personal.gender === 'male' ? '男' : personal.gender === 'female' ? '女' : personal.gender || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>出生日期：</label>
                    <span>${personal.birth_date || '未提供'}</span>
                </div>
                <div class="info-item">
                    <label>出生时间：</label>
                    <span>${personal.birth_time || '未提供'}</span>
                </div>
      `;
    }
    
    // 紫微基本信息
    if (analysisData.basic_info.ziwei_info) {
      const ziwei = analysisData.basic_info.ziwei_info;
      if (ziwei.ming_gong) {
        html += `
                <div class="info-item">
                    <label>命宫：</label>
                    <span class="highlight">${ziwei.ming_gong}</span>
                </div>
        `;
      }
      if (ziwei.wuxing_ju) {
        html += `
                <div class="info-item">
                    <label>五行局：</label>
                    <span class="highlight">${ziwei.wuxing_ju}</span>
                </div>
        `;
      }
      if (ziwei.main_stars) {
        html += `
                <div class="info-item">
                    <label>主星：</label>
                    <span class="highlight">${Array.isArray(ziwei.main_stars) ? ziwei.main_stars.join('、') : ziwei.main_stars}</span>
                </div>
        `;
      }
    }
    
    html += `
            </div>
        </section>
    `;
  }
  
  // 星曜分析
  if (analysisData.star_analysis) {
    html += `
        <section class="section">
            <h3 class="section-title">⭐ 星曜分析</h3>
    `;
    
    if (analysisData.star_analysis.main_stars) {
      html += `
            <h4 class="subsection-title">主星分析</h4>
            <div class="star-analysis">
      `;
      
      if (Array.isArray(analysisData.star_analysis.main_stars)) {
        analysisData.star_analysis.main_stars.forEach(star => {
          if (typeof star === 'object') {
            html += `
                    <div class="star-item">
                        <h5>${star.name || star.star}</h5>
            `;
            if (star.brightness) {
              html += `<p><strong>亮度：</strong>${star.brightness}</p>`;
            }
            if (star.influence) {
              html += `<p><strong>影响：</strong>${star.influence}</p>`;
            }
            if (star.description) {
              html += `<p><strong>特质：</strong>${star.description}</p>`;
            }
            html += `
                    </div>
            `;
          }
        });
      } else {
        html += `<p>${analysisData.star_analysis.main_stars}</p>`;
      }
      
      html += `
            </div>
      `;
    }
    
    html += `
        </section>
    `;
  }
  
  return html;
};

/**
 * 生成易经占卜HTML内容
 */
const generateYijingHTML = (analysisData) => {
  let html = '';
  
  // 占卜问题
  if (analysisData.question_analysis) {
    html += `
        <section class="section">
            <h3 class="section-title">❓ 占卜问题</h3>
            <div class="question-info">
    `;
    
    if (analysisData.question_analysis.original_question) {
      html += `
                <div class="info-item">
                    <label>问题：</label>
                    <span class="highlight">${analysisData.question_analysis.original_question}</span>
                </div>
      `;
    }
    
    if (analysisData.question_analysis.question_type) {
      html += `
                <div class="info-item">
                    <label>问题类型：</label>
                    <span>${analysisData.question_analysis.question_type}</span>
                </div>
      `;
    }
    
    html += `
            </div>
        </section>
    `;
  }
  
  // 卦象信息
  if (analysisData.hexagram_info) {
    html += `
        <section class="section">
            <h3 class="section-title">🔮 卦象信息</h3>
    `;
    
    if (analysisData.hexagram_info.main_hexagram) {
      const main = analysisData.hexagram_info.main_hexagram;
      html += `
            <div class="hexagram-item">
                <h4 class="subsection-title">主卦</h4>
                <div class="hexagram-info">
                    <div class="info-item">
                        <label>卦名：</label>
                        <span class="highlight">${main.name || '未知'}</span>
                    </div>
                    <div class="info-item">
                        <label>卦象：</label>
                        <span class="hexagram-symbol">${main.symbol || ''}</span>
                    </div>
      `;
      
      if (main.number) {
        html += `
                    <div class="info-item">
                        <label>卦序：</label>
                        <span>第${main.number}卦</span>
                    </div>
        `;
      }
      
      if (main.meaning) {
        html += `
                    <div class="info-item">
                        <label>含义：</label>
                        <span>${main.meaning}</span>
                    </div>
        `;
      }
      
      html += `
                </div>
            </div>
      `;
    }
    
    html += `
        </section>
    `;
  }
  
  return html;
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
 * 获取PDF专用CSS样式
 */
const getPDFCSS = () => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Microsoft YaHei', '微软雅黑', 'SimSun', '宋体', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: white;
      font-size: 12px;
    }
    
    .container {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    
    h1 {
      font-size: 24px;
      color: #2c3e50;
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }
    
    h2 {
      font-size: 18px;
      color: #34495e;
      margin: 20px 0 10px 0;
      padding: 10px 0;
      border-bottom: 2px solid #3498db;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 16px;
      color: #2980b9;
      margin: 15px 0 8px 0;
      padding-left: 10px;
      border-left: 4px solid #3498db;
      page-break-after: avoid;
    }
    
    h4 {
      font-size: 14px;
      color: #27ae60;
      margin: 12px 0 6px 0;
      page-break-after: avoid;
    }
    
    p {
      margin: 8px 0;
      line-height: 1.6;
      text-align: justify;
    }
    
    strong {
      color: #2c3e50;
      font-weight: bold;
    }
    
    ul, ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    li {
      margin: 4px 0;
      line-height: 1.5;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 11px;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #bdc3c7;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #ecf0f1;
      font-weight: bold;
      color: #2c3e50;
    }
    
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .section {
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
    
    /* 打印优化 */
    @page {
      margin: 20mm 15mm;
      size: A4;
    }
    
    @media print {
      body {
        font-size: 11px;
      }
      
      h1 {
        font-size: 20px;
      }
      
      h2 {
        font-size: 16px;
      }
      
      h3 {
        font-size: 14px;
      }
      
      .section {
        break-inside: avoid;
      }
    }
  `;
};

/**
 * 获取原有CSS样式（保持兼容性）
 */
const getCSS = () => {
  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header .logo h1 {
            font-size: 2.5em;
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .logo p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .header .report-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.3);
        }
        
        .header .report-info h2 {
            font-size: 1.8em;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 1px solid #eee;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            font-size: 1.5em;
            color: #dc2626;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #dc2626;
        }
        
        .subsection-title {
            font-size: 1.2em;
            color: #b91c1c;
            margin: 20px 0 10px 0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .info-item label {
            font-weight: bold;
            margin-right: 10px;
            min-width: 80px;
        }
        
        .highlight {
            color: #dc2626;
            font-weight: bold;
        }
        
        .bazi-table, .element-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .bazi-table th, .bazi-table td,
        .element-table th, .element-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
        }
        
        .bazi-table th, .element-table th {
            background: #dc2626;
            color: white;
            font-weight: bold;
        }
        
        .bazi-table tr:nth-child(even),
        .element-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .element-木 { color: #22c55e; font-weight: bold; }
        .element-火 { color: #ef4444; font-weight: bold; }
        .element-土 { color: #eab308; font-weight: bold; }
        .element-金 { color: #64748b; font-weight: bold; }
        .element-水 { color: #3b82f6; font-weight: bold; }
        
        .strength-旺 { color: #22c55e; font-weight: bold; }
        .strength-中 { color: #eab308; font-weight: bold; }
        .strength-弱 { color: #ef4444; font-weight: bold; }
        
        .strength-strong { color: #22c55e; font-weight: bold; }
        .strength-moderate { color: #eab308; font-weight: bold; }
        .strength-fair { color: #f97316; font-weight: bold; }
        .strength-weak { color: #ef4444; font-weight: bold; }
        
        .analysis-content {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #dc2626;
            border-radius: 0 5px 5px 0;
        }
        
        .guidance-item {
            margin: 20px 0;
            padding: 20px;
            background: #fff7ed;
            border-radius: 8px;
            border: 1px solid #fed7aa;
        }
        
        .guidance-content ul {
            margin-left: 20px;
        }
        
        .guidance-content li {
            margin: 8px 0;
        }
        
        .star-analysis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .star-item {
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .star-item h5 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .hexagram-item {
            margin: 20px 0;
            padding: 20px;
            background: #fef3c7;
            border-radius: 8px;
            border: 1px solid #fbbf24;
        }
        
        .hexagram-symbol {
            font-family: monospace;
            font-size: 1.2em;
            font-weight: bold;
            color: #92400e;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            border-top: 1px solid #eee;
        }
        
        .disclaimer {
            margin-bottom: 20px;
            padding: 20px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
        }
        
        .disclaimer p {
            margin: 5px 0;
        }
        
        .footer-info {
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        .footer-info p {
            margin: 5px 0;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
            }
        }
    `;
};

module.exports = {
  generatePDF
};