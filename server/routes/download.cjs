const express = require('express');
const { authenticate } = require('../middleware/auth.cjs');
const { dbManager } = require('../database/index.cjs');

// 临时注释生成器导入，先测试路由基本功能
// const { generateMarkdown } = require('../services/generators/markdownGenerator.cjs');
// const { generatePDF } = require('../services/generators/pdfGenerator.cjs');
// const { generatePNG } = require('../services/generators/pngGenerator.cjs');

const router = express.Router();

/**
 * 下载分析结果
 * POST /api/download
 * 支持格式：markdown, pdf, png
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { analysisData, analysisType, format, userName } = req.body;
    const userId = req.user.id;

    // 验证必需参数
    if (!analysisData || !analysisType || !format) {
      return res.status(400).json({
        error: '缺少必需参数',
        details: 'analysisData, analysisType, format 都是必需的'
      });
    }

    // 验证格式类型
    const supportedFormats = ['markdown', 'pdf', 'png'];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({
        error: '不支持的格式',
        supportedFormats
      });
    }

    // 验证分析类型
    const supportedAnalysisTypes = ['bazi', 'ziwei', 'yijing'];
    if (!supportedAnalysisTypes.includes(analysisType)) {
      return res.status(400).json({
        error: '不支持的分析类型',
        supportedAnalysisTypes
      });
    }

    let fileBuffer;
    let contentType;
    let fileExtension;
    let filename;

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const analysisTypeLabel = {
      'bazi': '八字命理',
      'ziwei': '紫微斗数',
      'yijing': '易经占卜'
    }[analysisType];
    
    const baseFilename = `${analysisTypeLabel}_${userName || 'user'}_${timestamp}`;

    try {
      switch (format) {
        case 'markdown':
          // 临时简单实现
          const markdownContent = `# ${analysisTypeLabel}分析报告\n\n**姓名：** ${userName || '用户'}\n**生成时间：** ${new Date().toLocaleString('zh-CN')}\n\n## 分析结果\n\n这是一个测试文件。\n\n---\n\n*本报告由神机阁AI命理分析平台生成*`;
          fileBuffer = Buffer.from(markdownContent, 'utf8');
          contentType = 'text/markdown';
          fileExtension = 'md';
          filename = `${baseFilename}.md`;
          break;

        case 'pdf':
          // 临时返回HTML内容
          const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${analysisTypeLabel}分析报告</title></head><body><h1>${analysisTypeLabel}分析报告</h1><p><strong>姓名：</strong>${userName || '用户'}</p><p><strong>生成时间：</strong>${new Date().toLocaleString('zh-CN')}</p><h2>分析结果</h2><p>这是一个测试文件。</p></body></html>`;
          fileBuffer = Buffer.from(htmlContent, 'utf8');
          contentType = 'text/html';
          fileExtension = 'html';
          filename = `${baseFilename}.html`;
          break;

        case 'png':
          // 临时返回SVG内容
          const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f9f9f9"/><text x="200" y="50" text-anchor="middle" font-size="24" fill="#dc2626">${analysisTypeLabel}分析报告</text><text x="200" y="100" text-anchor="middle" font-size="16" fill="#333">姓名：${userName || '用户'}</text><text x="200" y="130" text-anchor="middle" font-size="14" fill="#666">生成时间：${new Date().toLocaleString('zh-CN')}</text><text x="200" y="180" text-anchor="middle" font-size="16" fill="#333">这是一个测试文件</text></svg>`;
          fileBuffer = Buffer.from(svgContent, 'utf8');
          contentType = 'image/svg+xml';
          fileExtension = 'svg';
          filename = `${baseFilename}.svg`;
          break;
      }
    } catch (generationError) {
      console.error(`生成${format}文件失败:`, generationError);
      return res.status(500).json({
        error: `生成${format}文件失败`,
        details: generationError.message
      });
    }

    // 记录下载历史（可选）
    try {
      const db = dbManager.getDb();
      const stmt = db.prepare(`
        INSERT INTO download_history (user_id, analysis_type, format, filename, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      stmt.run(userId, analysisType, format, filename);
    } catch (dbError) {
      // 下载历史记录失败不影响文件下载
      console.warn('记录下载历史失败:', dbError);
    }

    // 设置响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    // 发送文件
    res.send(fileBuffer);

  } catch (error) {
    console.error('下载API错误:', error);
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
});

/**
 * 获取用户下载历史
 * GET /api/download/history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const db = dbManager.getDb();
    
    // 获取总数
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM download_history WHERE user_id = ?');
    const { total } = countStmt.get(userId);
    
    // 获取分页数据
    const offset = (page - 1) * limit;
    const stmt = db.prepare(`
      SELECT analysis_type, format, filename, created_at
      FROM download_history 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const downloads = stmt.all(userId, limit, offset);
    
    res.json({
      downloads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('获取下载历史失败:', error);
    res.status(500).json({
      error: '获取下载历史失败',
      details: error.message
    });
  }
});

/**
 * 获取支持的格式和分析类型
 * GET /api/download/formats
 */
router.get('/formats', (req, res) => {
  res.json({
    supportedFormats: [
      {
        format: 'markdown',
        label: 'Markdown文档',
        description: '结构化文本格式，便于编辑',
        mimeType: 'text/markdown',
        extension: 'md'
      },
      {
        format: 'pdf',
        label: 'PDF文档',
        description: '专业格式，便于打印和分享',
        mimeType: 'application/pdf',
        extension: 'pdf'
      },
      {
        format: 'png',
        label: 'PNG图片',
        description: '高清图片格式，便于保存',
        mimeType: 'image/png',
        extension: 'png'
      }
    ],
    supportedAnalysisTypes: [
      {
        type: 'bazi',
        label: '八字命理',
        description: '基于传统八字学说的命理分析'
      },
      {
        type: 'ziwei',
        label: '紫微斗数',
        description: '通过星曜排布分析命运走向'
      },
      {
        type: 'yijing',
        label: '易经占卜',
        description: '运用梅花易数解读卦象含义'
      }
    ]
  });
});

module.exports = router;