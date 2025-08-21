/**
 * Markdown格式生成器
 * 将分析结果转换为结构化的Markdown文档
 */

const generateMarkdown = async (analysisData, analysisType, userName) => {
  try {
    let markdown = '';
    
    // 根据分析类型生成不同的Markdown内容
    switch (analysisType) {
      case 'bazi':
        markdown = generateBaziMarkdown(analysisData, userName);
        break;
      case 'ziwei':
        markdown = generateZiweiMarkdown(analysisData, userName);
        break;
      case 'yijing':
        markdown = generateYijingMarkdown(analysisData, userName);
        break;
      default:
        throw new Error(`不支持的分析类型: ${analysisType}`);
    }
    
    return Buffer.from(markdown, 'utf8');
  } catch (error) {
    console.error('生成Markdown失败:', error);
    throw error;
  }
};

/**
 * 生成八字命理Markdown文档
 */
const generateBaziMarkdown = (analysisData, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let markdown = `# 八字命理分析报告\n\n`;
  markdown += `**姓名：** ${userName || '用户'}\n`;
  markdown += `**生成时间：** ${timestamp}\n`;
  markdown += `**分析类型：** 八字命理\n\n`;
  
  markdown += `---\n\n`;
  
  // 基本信息
  if (analysisData.basic_info) {
    markdown += `## 📋 基本信息\n\n`;
    
    if (analysisData.basic_info.personal_data) {
      const personal = analysisData.basic_info.personal_data;
      markdown += `- **姓名：** ${personal.name || '未提供'}\n`;
      markdown += `- **性别：** ${personal.gender === 'male' ? '男' : personal.gender === 'female' ? '女' : personal.gender || '未提供'}\n`;
      markdown += `- **出生日期：** ${personal.birth_date || '未提供'}\n`;
      markdown += `- **出生时间：** ${personal.birth_time || '未提供'}\n`;
      if (personal.birth_place) {
        markdown += `- **出生地点：** ${personal.birth_place}\n`;
      }
    }
    
    // 八字信息
    if (analysisData.basic_info.bazi_info) {
      const bazi = analysisData.basic_info.bazi_info;
      markdown += `\n### 🔮 八字信息\n\n`;
      markdown += `| 柱位 | 天干 | 地支 | 纳音 |\n`;
      markdown += `|------|------|------|------|\n`;
      markdown += `| 年柱 | ${bazi.year?.split('')[0] || '-'} | ${bazi.year?.split('')[1] || '-'} | ${bazi.year_nayin || '-'} |\n`;
      markdown += `| 月柱 | ${bazi.month?.split('')[0] || '-'} | ${bazi.month?.split('')[1] || '-'} | ${bazi.month_nayin || '-'} |\n`;
      markdown += `| 日柱 | ${bazi.day?.split('')[0] || '-'} | ${bazi.day?.split('')[1] || '-'} | ${bazi.day_nayin || '-'} |\n`;
      markdown += `| 时柱 | ${bazi.hour?.split('')[0] || '-'} | ${bazi.hour?.split('')[1] || '-'} | ${bazi.hour_nayin || '-'} |\n\n`;
    }
  }
  
  // 五行分析
  if (analysisData.wuxing_analysis) {
    markdown += `## 🌟 五行分析\n\n`;
    
    if (analysisData.wuxing_analysis.element_distribution) {
      markdown += `### 五行分布\n\n`;
      const elements = analysisData.wuxing_analysis.element_distribution;
      const total = Object.values(elements).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
      
      markdown += `| 五行 | 数量 | 占比 | 强度 |\n`;
      markdown += `|------|------|------|------|\n`;
      
      Object.entries(elements).forEach(([element, count]) => {
        const numCount = typeof count === 'number' ? count : 0;
        const percentage = total > 0 ? Math.round((numCount / total) * 100) : 0;
        const strength = numCount >= 3 ? '旺' : numCount >= 2 ? '中' : '弱';
        markdown += `| ${element} | ${numCount} | ${percentage}% | ${strength} |\n`;
      });
      
      markdown += `\n`;
    }
    
    if (analysisData.wuxing_analysis.balance_analysis) {
      markdown += `### 五行平衡分析\n\n`;
      markdown += `${analysisData.wuxing_analysis.balance_analysis}\n\n`;
    }
    
    if (analysisData.wuxing_analysis.suggestions) {
      markdown += `### 调和建议\n\n`;
      markdown += `${analysisData.wuxing_analysis.suggestions}\n\n`;
    }
  }
  
  // 十神分析
  if (analysisData.ten_gods_analysis) {
    markdown += `## ⚡ 十神分析\n\n`;
    
    if (analysisData.ten_gods_analysis.distribution) {
      markdown += `### 十神分布\n\n`;
      Object.entries(analysisData.ten_gods_analysis.distribution).forEach(([god, info]) => {
        markdown += `#### ${god}\n`;
        if (typeof info === 'object' && info.count !== undefined) {
          markdown += `- **数量：** ${info.count}\n`;
          if (info.description) {
            markdown += `- **含义：** ${info.description}\n`;
          }
        } else {
          markdown += `- **数量：** ${info}\n`;
        }
        markdown += `\n`;
      });
    }
    
    if (analysisData.ten_gods_analysis.analysis) {
      markdown += `### 十神综合分析\n\n`;
      markdown += `${analysisData.ten_gods_analysis.analysis}\n\n`;
    }
  }
  
  // 格局分析
  if (analysisData.pattern_analysis) {
    markdown += `## 🎯 格局分析\n\n`;
    
    if (analysisData.pattern_analysis.main_pattern) {
      markdown += `### 主要格局\n\n`;
      markdown += `**格局类型：** ${analysisData.pattern_analysis.main_pattern}\n\n`;
    }
    
    if (analysisData.pattern_analysis.pattern_strength) {
      const strength = analysisData.pattern_analysis.pattern_strength;
      const strengthLabel = strength === 'strong' ? '强' : strength === 'moderate' ? '中等' : strength === 'fair' ? '一般' : '较弱';
      markdown += `**格局强度：** ${strengthLabel}\n\n`;
    }
    
    if (analysisData.pattern_analysis.analysis) {
      markdown += `### 格局详解\n\n`;
      markdown += `${analysisData.pattern_analysis.analysis}\n\n`;
    }
  }
  
  // 运势分析
  if (analysisData.fortune_analysis) {
    markdown += `## 🔮 运势分析\n\n`;
    
    ['career', 'wealth', 'relationship', 'health'].forEach(aspect => {
      if (analysisData.fortune_analysis[aspect]) {
        const aspectNames = {
          career: '事业运势',
          wealth: '财运分析',
          relationship: '感情运势',
          health: '健康运势'
        };
        
        markdown += `### ${aspectNames[aspect]}\n\n`;
        markdown += `${analysisData.fortune_analysis[aspect]}\n\n`;
      }
    });
  }
  
  // 人生指导
  if (analysisData.life_guidance) {
    markdown += `## 🌟 人生指导\n\n`;
    
    if (analysisData.life_guidance.strengths) {
      markdown += `### 优势特质\n\n`;
      if (Array.isArray(analysisData.life_guidance.strengths)) {
        analysisData.life_guidance.strengths.forEach(strength => {
          markdown += `- ${strength}\n`;
        });
      } else {
        markdown += `${analysisData.life_guidance.strengths}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.life_guidance.challenges) {
      markdown += `### 需要注意\n\n`;
      if (Array.isArray(analysisData.life_guidance.challenges)) {
        analysisData.life_guidance.challenges.forEach(challenge => {
          markdown += `- ${challenge}\n`;
        });
      } else {
        markdown += `${analysisData.life_guidance.challenges}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.life_guidance.suggestions) {
      markdown += `### 发展建议\n\n`;
      if (Array.isArray(analysisData.life_guidance.suggestions)) {
        analysisData.life_guidance.suggestions.forEach(suggestion => {
          markdown += `- ${suggestion}\n`;
        });
      } else {
        markdown += `${analysisData.life_guidance.suggestions}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.life_guidance.overall_summary) {
      markdown += `### 综合总结\n\n`;
      markdown += `${analysisData.life_guidance.overall_summary}\n\n`;
    }
  }
  
  // 现代应用建议
  if (analysisData.modern_applications) {
    markdown += `## 💡 现代应用建议\n\n`;
    
    Object.entries(analysisData.modern_applications).forEach(([key, value]) => {
      const keyNames = {
        lifestyle: '生活方式建议',
        career_development: '职业发展建议',
        relationship_advice: '人际关系建议',
        health_maintenance: '健康养生建议',
        financial_planning: '理财规划建议'
      };
      
      if (keyNames[key] && value) {
        markdown += `### ${keyNames[key]}\n\n`;
        markdown += `${value}\n\n`;
      }
    });
  }
  
  // 页脚
  markdown += `---\n\n`;
  markdown += `*本报告由神机阁AI命理分析平台生成*\n`;
  markdown += `*生成时间：${timestamp}*\n`;
  markdown += `*仅供参考，请理性对待*\n`;
  
  return markdown;
};

/**
 * 生成紫微斗数Markdown文档
 */
const generateZiweiMarkdown = (analysisData, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let markdown = `# 紫微斗数分析报告\n\n`;
  markdown += `**姓名：** ${userName || '用户'}\n`;
  markdown += `**生成时间：** ${timestamp}\n`;
  markdown += `**分析类型：** 紫微斗数\n\n`;
  
  markdown += `---\n\n`;
  
  // 基本信息
  if (analysisData.basic_info) {
    markdown += `## 📋 基本信息\n\n`;
    
    if (analysisData.basic_info.personal_data) {
      const personal = analysisData.basic_info.personal_data;
      markdown += `- **姓名：** ${personal.name || '未提供'}\n`;
      markdown += `- **性别：** ${personal.gender === 'male' ? '男' : personal.gender === 'female' ? '女' : personal.gender || '未提供'}\n`;
      markdown += `- **出生日期：** ${personal.birth_date || '未提供'}\n`;
      markdown += `- **出生时间：** ${personal.birth_time || '未提供'}\n`;
    }
    
    // 紫微基本信息
    if (analysisData.basic_info.ziwei_info) {
      const ziwei = analysisData.basic_info.ziwei_info;
      markdown += `\n### 🌟 紫微基本信息\n\n`;
      if (ziwei.ming_gong) {
        markdown += `- **命宫：** ${ziwei.ming_gong}\n`;
      }
      if (ziwei.wuxing_ju) {
        markdown += `- **五行局：** ${ziwei.wuxing_ju}\n`;
      }
      if (ziwei.main_stars) {
        markdown += `- **主星：** ${Array.isArray(ziwei.main_stars) ? ziwei.main_stars.join('、') : ziwei.main_stars}\n`;
      }
    }
  }
  
  // 星曜分析
  if (analysisData.star_analysis) {
    markdown += `\n## ⭐ 星曜分析\n\n`;
    
    if (analysisData.star_analysis.main_stars) {
      markdown += `### 主星分析\n\n`;
      if (Array.isArray(analysisData.star_analysis.main_stars)) {
        analysisData.star_analysis.main_stars.forEach(star => {
          if (typeof star === 'object') {
            markdown += `#### ${star.name || star.star}\n`;
            if (star.brightness) {
              markdown += `- **亮度：** ${star.brightness}\n`;
            }
            if (star.influence) {
              markdown += `- **影响：** ${star.influence}\n`;
            }
            if (star.description) {
              markdown += `- **特质：** ${star.description}\n`;
            }
            markdown += `\n`;
          }
        });
      } else {
        markdown += `${analysisData.star_analysis.main_stars}\n\n`;
      }
    }
    
    if (analysisData.star_analysis.auxiliary_stars) {
      markdown += `### 辅星分析\n\n`;
      markdown += `${analysisData.star_analysis.auxiliary_stars}\n\n`;
    }
  }
  
  // 十二宫位分析
  if (analysisData.palace_analysis) {
    markdown += `## 🏛️ 十二宫位分析\n\n`;
    
    const palaceNames = {
      ming: '命宫',
      xiong: '兄弟宫',
      fu: '夫妻宫',
      zi: '子女宫',
      cai: '财帛宫',
      ji: '疾厄宫',
      qian: '迁移宫',
      nu: '奴仆宫',
      guan: '官禄宫',
      tian: '田宅宫',
      fu_de: '福德宫',
      fu_mu: '父母宫'
    };
    
    Object.entries(analysisData.palace_analysis).forEach(([palace, analysis]) => {
      const palaceName = palaceNames[palace] || palace;
      markdown += `### ${palaceName}\n\n`;
      if (typeof analysis === 'object') {
        if (analysis.stars) {
          markdown += `**星曜：** ${Array.isArray(analysis.stars) ? analysis.stars.join('、') : analysis.stars}\n`;
        }
        if (analysis.analysis) {
          markdown += `**分析：** ${analysis.analysis}\n`;
        }
        if (analysis.fortune) {
          markdown += `**运势：** ${analysis.fortune}\n`;
        }
      } else {
        markdown += `${analysis}\n`;
      }
      markdown += `\n`;
    });
  }
  
  // 四化分析
  if (analysisData.sihua_analysis) {
    markdown += `## 🔄 四化分析\n\n`;
    
    const sihuaNames = {
      lu: '化禄',
      quan: '化权',
      ke: '化科',
      ji: '化忌'
    };
    
    Object.entries(analysisData.sihua_analysis).forEach(([sihua, analysis]) => {
      const sihuaName = sihuaNames[sihua] || sihua;
      markdown += `### ${sihuaName}\n\n`;
      markdown += `${analysis}\n\n`;
    });
  }
  
  // 大运分析
  if (analysisData.major_periods) {
    markdown += `## 📅 大运分析\n\n`;
    
    if (Array.isArray(analysisData.major_periods)) {
      analysisData.major_periods.forEach((period, index) => {
        markdown += `### 第${index + 1}大运 (${period.age_range || period.years || '年龄段'})\n\n`;
        if (period.main_star) {
          markdown += `**主星：** ${period.main_star}\n`;
        }
        if (period.fortune) {
          markdown += `**运势：** ${period.fortune}\n`;
        }
        if (period.analysis) {
          markdown += `**分析：** ${period.analysis}\n`;
        }
        if (period.advice) {
          markdown += `**建议：** ${period.advice}\n`;
        }
        markdown += `\n`;
      });
    }
  }
  
  // 综合分析
  if (analysisData.comprehensive_analysis) {
    markdown += `## 🎯 综合分析\n\n`;
    
    ['personality', 'career', 'wealth', 'relationship', 'health'].forEach(aspect => {
      if (analysisData.comprehensive_analysis[aspect]) {
        const aspectNames = {
          personality: '性格特质',
          career: '事业发展',
          wealth: '财运分析',
          relationship: '感情婚姻',
          health: '健康状况'
        };
        
        markdown += `### ${aspectNames[aspect]}\n\n`;
        markdown += `${analysisData.comprehensive_analysis[aspect]}\n\n`;
      }
    });
  }
  
  // 页脚
  markdown += `---\n\n`;
  markdown += `*本报告由神机阁AI命理分析平台生成*\n`;
  markdown += `*生成时间：${timestamp}*\n`;
  markdown += `*仅供参考，请理性对待*\n`;
  
  return markdown;
};

/**
 * 生成易经占卜Markdown文档
 */
const generateYijingMarkdown = (analysisData, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let markdown = `# 易经占卜分析报告\n\n`;
  markdown += `**占卜者：** ${userName || '用户'}\n`;
  markdown += `**生成时间：** ${timestamp}\n`;
  markdown += `**分析类型：** 易经占卜\n\n`;
  
  markdown += `---\n\n`;
  
  // 占卜问题
  if (analysisData.question_analysis) {
    markdown += `## ❓ 占卜问题\n\n`;
    if (analysisData.question_analysis.original_question) {
      markdown += `**问题：** ${analysisData.question_analysis.original_question}\n\n`;
    }
    if (analysisData.question_analysis.question_type) {
      markdown += `**问题类型：** ${analysisData.question_analysis.question_type}\n\n`;
    }
    if (analysisData.question_analysis.analysis_focus) {
      markdown += `**分析重点：** ${analysisData.question_analysis.analysis_focus}\n\n`;
    }
  }
  
  // 卦象信息
  if (analysisData.hexagram_info) {
    markdown += `## 🔮 卦象信息\n\n`;
    
    if (analysisData.hexagram_info.main_hexagram) {
      const main = analysisData.hexagram_info.main_hexagram;
      markdown += `### 主卦\n\n`;
      markdown += `**卦名：** ${main.name || '未知'}\n`;
      markdown += `**卦象：** ${main.symbol || ''}\n`;
      if (main.number) {
        markdown += `**卦序：** 第${main.number}卦\n`;
      }
      if (main.element) {
        markdown += `**五行：** ${main.element}\n`;
      }
      if (main.meaning) {
        markdown += `**含义：** ${main.meaning}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.hexagram_info.changing_hexagram) {
      const changing = analysisData.hexagram_info.changing_hexagram;
      markdown += `### 变卦\n\n`;
      markdown += `**卦名：** ${changing.name || '未知'}\n`;
      markdown += `**卦象：** ${changing.symbol || ''}\n`;
      if (changing.meaning) {
        markdown += `**含义：** ${changing.meaning}\n`;
      }
      markdown += `\n`;
    }
  }
  
  // 卦辞分析
  if (analysisData.hexagram_analysis) {
    markdown += `## 📜 卦辞分析\n\n`;
    
    if (analysisData.hexagram_analysis.gua_ci) {
      markdown += `### 卦辞\n\n`;
      markdown += `> ${analysisData.hexagram_analysis.gua_ci}\n\n`;
    }
    
    if (analysisData.hexagram_analysis.gua_ci_interpretation) {
      markdown += `### 卦辞解释\n\n`;
      markdown += `${analysisData.hexagram_analysis.gua_ci_interpretation}\n\n`;
    }
    
    if (analysisData.hexagram_analysis.yao_ci) {
      markdown += `### 爻辞分析\n\n`;
      if (Array.isArray(analysisData.hexagram_analysis.yao_ci)) {
        analysisData.hexagram_analysis.yao_ci.forEach((yao, index) => {
          markdown += `#### ${yao.position || `第${index + 1}爻`}\n`;
          if (yao.text) {
            markdown += `**爻辞：** ${yao.text}\n`;
          }
          if (yao.interpretation) {
            markdown += `**解释：** ${yao.interpretation}\n`;
          }
          markdown += `\n`;
        });
      }
    }
  }
  
  // 象数分析
  if (analysisData.numerology_analysis) {
    markdown += `## 🔢 象数分析\n\n`;
    
    if (analysisData.numerology_analysis.upper_trigram_number) {
      markdown += `### 上卦数理\n\n`;
      const upper = analysisData.numerology_analysis.upper_trigram_number;
      markdown += `**数字：** ${upper.number || upper}\n`;
      if (upper.meaning) {
        markdown += `**含义：** ${upper.meaning}\n`;
      }
      if (upper.influence) {
        markdown += `**影响：** ${upper.influence}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.numerology_analysis.lower_trigram_number) {
      markdown += `### 下卦数理\n\n`;
      const lower = analysisData.numerology_analysis.lower_trigram_number;
      markdown += `**数字：** ${lower.number || lower}\n`;
      if (lower.meaning) {
        markdown += `**含义：** ${lower.meaning}\n`;
      }
      if (lower.influence) {
        markdown += `**影响：** ${lower.influence}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.numerology_analysis.combined_energy) {
      markdown += `### 组合能量\n\n`;
      const combined = analysisData.numerology_analysis.combined_energy;
      markdown += `**总数：** ${combined.total_number || combined.total || combined}\n`;
      if (combined.interpretation) {
        markdown += `**解释：** ${combined.interpretation}\n`;
      }
      if (combined.harmony) {
        markdown += `**和谐度：** ${combined.harmony}\n`;
      }
      markdown += `\n`;
    }
  }
  
  // 综合解读
  if (analysisData.comprehensive_interpretation) {
    markdown += `## 🎯 综合解读\n\n`;
    
    if (analysisData.comprehensive_interpretation.current_situation) {
      markdown += `### 当前状况\n\n`;
      markdown += `${analysisData.comprehensive_interpretation.current_situation}\n\n`;
    }
    
    if (analysisData.comprehensive_interpretation.development_trend) {
      markdown += `### 发展趋势\n\n`;
      markdown += `${analysisData.comprehensive_interpretation.development_trend}\n\n`;
    }
    
    if (analysisData.comprehensive_interpretation.action_advice) {
      markdown += `### 行动建议\n\n`;
      if (Array.isArray(analysisData.comprehensive_interpretation.action_advice)) {
        analysisData.comprehensive_interpretation.action_advice.forEach(advice => {
          markdown += `- ${advice}\n`;
        });
      } else {
        markdown += `${analysisData.comprehensive_interpretation.action_advice}\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.comprehensive_interpretation.timing_guidance) {
      markdown += `### 时机指导\n\n`;
      markdown += `${analysisData.comprehensive_interpretation.timing_guidance}\n\n`;
    }
  }
  
  // 注意事项
  if (analysisData.precautions) {
    markdown += `## ⚠️ 注意事项\n\n`;
    if (Array.isArray(analysisData.precautions)) {
      analysisData.precautions.forEach(precaution => {
        markdown += `- ${precaution}\n`;
      });
    } else {
      markdown += `${analysisData.precautions}\n`;
    }
    markdown += `\n`;
  }
  
  // 页脚
  markdown += `---\n\n`;
  markdown += `*本报告由神机阁AI命理分析平台生成*\n`;
  markdown += `*生成时间：${timestamp}*\n`;
  markdown += `*仅供参考，请理性对待*\n`;
  
  return markdown;
};

module.exports = {
  generateMarkdown
};