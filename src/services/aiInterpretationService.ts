import { getAIConfig, validateAIConfig, getPromptTemplate } from '../config/aiConfig';

// AI解读结果接口
export interface AIInterpretationResult {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  model?: string;
  tokensUsed?: number;
}

// AI解读请求参数
export interface AIInterpretationRequest {
  analysisType: 'bazi' | 'ziwei' | 'yijing';
  analysisContent: string;
  customPrompt?: string;
  onStreamUpdate?: (content: string) => void; // 流式更新回调
}

// 将分析结果转换为Markdown格式
const convertAnalysisToMarkdown = (analysisData: any, analysisType: string): string => {
  try {
    let markdown = `# ${getAnalysisTitle(analysisType)}分析结果\n\n`;
    
    // 根据不同分析类型生成不同的Markdown内容
    switch (analysisType) {
      case 'bazi':
        markdown += generateBaziMarkdown(analysisData);
        break;
      case 'ziwei':
        markdown += generateZiweiMarkdown(analysisData);
        break;
      case 'yijing':
        markdown += generateYijingMarkdown(analysisData);
        break;
      default:
        markdown += JSON.stringify(analysisData, null, 2);
    }
    
    return markdown;
  } catch (error) {
    console.error('转换分析结果为Markdown失败:', error);
    return JSON.stringify(analysisData, null, 2);
  }
};

// 生成八字分析的Markdown
const generateBaziMarkdown = (data: any): string => {
  let markdown = '';
  
  if (data.basic_info) {
    markdown += '## 基本信息\n\n';
    if (data.basic_info.bazi_chart) {
      markdown += '### 八字排盘\n';
      const chart = data.basic_info.bazi_chart;
      markdown += `- 年柱: ${chart.year_pillar?.stem}${chart.year_pillar?.branch}\n`;
      markdown += `- 月柱: ${chart.month_pillar?.stem}${chart.month_pillar?.branch}\n`;
      markdown += `- 日柱: ${chart.day_pillar?.stem}${chart.day_pillar?.branch}\n`;
      markdown += `- 时柱: ${chart.hour_pillar?.stem}${chart.hour_pillar?.branch}\n\n`;
    }
    
    if (data.basic_info.pillar_interpretations) {
      markdown += '### 四柱解释\n';
      const interpretations = data.basic_info.pillar_interpretations;
      markdown += `**年柱**: ${interpretations.year_pillar}\n\n`;
      markdown += `**月柱**: ${interpretations.month_pillar}\n\n`;
      markdown += `**日柱**: ${interpretations.day_pillar}\n\n`;
      markdown += `**时柱**: ${interpretations.hour_pillar}\n\n`;
    }
  }
  
  if (data.geju_analysis) {
    markdown += '## 格局分析\n\n';
    markdown += `${data.geju_analysis.pattern_analysis || ''}\n\n`;
  }
  
  if (data.dayun_analysis) {
    markdown += '## 大运分析\n\n';
    if (data.dayun_analysis.current_dayun) {
      markdown += `**当前大运**: ${data.dayun_analysis.current_dayun.period} (${data.dayun_analysis.current_dayun.age_range})\n`;
      markdown += `${data.dayun_analysis.current_dayun.analysis}\n\n`;
    }
  }
  
  if (data.life_guidance) {
    markdown += '## 人生指导\n\n';
    markdown += `${data.life_guidance.overall_summary || ''}\n\n`;
  }
  
  return markdown;
};

// 生成紫微斗数分析的Markdown
const generateZiweiMarkdown = (data: any): string => {
  let markdown = '';
  
  if (data.basic_chart) {
    markdown += '## 基本命盘\n\n';
    markdown += `${JSON.stringify(data.basic_chart, null, 2)}\n\n`;
  }
  
  if (data.palace_analysis) {
    markdown += '## 宫位分析\n\n';
    markdown += `${data.palace_analysis}\n\n`;
  }
  
  return markdown;
};

// 生成易经分析的Markdown
const generateYijingMarkdown = (data: any): string => {
  let markdown = '';
  
  // 基本信息
  if (data.basic_info) {
    markdown += '## 占卜基本信息\n\n';
    if (data.basic_info.divination_data) {
      markdown += `**问题**: ${data.basic_info.divination_data.question}\n`;
      markdown += `**占卜方法**: ${data.basic_info.divination_data.method}\n`;
      markdown += `**占卜时间**: ${data.basic_info.divination_data.divination_time}\n\n`;
    }
  }
  
  // 卦象信息
  if (data.basic_info?.hexagram_info) {
    const hexInfo = data.basic_info.hexagram_info;
    markdown += '## 卦象信息\n\n';
    
    // 本卦信息
    markdown += `**本卦**: ${hexInfo.main_hexagram} (第${hexInfo.main_hexagram_number}卦)\n`;
    markdown += `**卦象符号**: ${hexInfo.main_hexagram_symbol}\n`;
    markdown += `**卦辞**: ${hexInfo.hexagram_description}\n`;
    
    // 卦象结构
    if (hexInfo.hexagram_structure) {
      markdown += `**上卦**: ${hexInfo.hexagram_structure.upper_trigram}\n`;
      markdown += `**下卦**: ${hexInfo.hexagram_structure.lower_trigram}\n`;
    }
    
    // 变卦信息
    if (hexInfo.changing_hexagram && hexInfo.changing_hexagram !== '无') {
      markdown += `**变卦**: ${hexInfo.changing_hexagram}\n`;
      markdown += `**变卦符号**: ${hexInfo.changing_hexagram_symbol}\n`;
    } else {
      markdown += `**变卦**: 无变卦\n`;
    }
    
    markdown += '\n';
  }
  
  // 详细分析
  if (data.detailed_analysis) {
    const analysis = data.detailed_analysis;
    
    // 卦象分析
    if (analysis.hexagram_analysis) {
      markdown += '## 卦象分析\n\n';
      markdown += `**主要含义**: ${analysis.hexagram_analysis.primary_meaning}\n`;
      markdown += `**卦辞解释**: ${analysis.hexagram_analysis.judgment}\n`;
      markdown += `**象传**: ${analysis.hexagram_analysis.image}\n`;
      if (analysis.hexagram_analysis.trigram_analysis) {
        markdown += `**卦象分析**: ${analysis.hexagram_analysis.trigram_analysis}\n`;
      }
      markdown += '\n';
    }
    
    // 动爻分析
    if (analysis.changing_lines_analysis) {
      markdown += '## 动爻分析\n\n';
      markdown += `**动爻数量**: ${analysis.changing_lines_analysis.changing_lines_count}爻\n`;
      if (analysis.changing_lines_analysis.changing_line_position) {
        markdown += `**动爻位置**: ${analysis.changing_lines_analysis.changing_line_position}\n`;
      }
      if (analysis.changing_lines_analysis.line_meanings) {
        markdown += `**爻辞含义**: ${analysis.changing_lines_analysis.line_meanings}\n`;
      }
      markdown += '\n';
    }
    
    // 变卦分析
    if (analysis.changing_hexagram_analysis) {
      markdown += '## 变卦分析\n\n';
      markdown += `**变化含义**: ${analysis.changing_hexagram_analysis.meaning}\n`;
      markdown += `**转化洞察**: ${analysis.changing_hexagram_analysis.transformation_insight}\n`;
      markdown += `**指导建议**: ${analysis.changing_hexagram_analysis.guidance}\n`;
      markdown += `**时机把握**: ${analysis.changing_hexagram_analysis.timing}\n`;
      markdown += '\n';
    }
    
    // 高级分析（互卦、错卦、综卦）
    if (analysis.advanced_analysis) {
      markdown += '## 高级卦象分析\n\n';
      
      if (analysis.advanced_analysis.inter_hexagram) {
        markdown += `**互卦**: ${analysis.advanced_analysis.inter_hexagram.name}\n`;
        markdown += `互卦分析: ${analysis.advanced_analysis.inter_hexagram.analysis}\n\n`;
      }
      
      if (analysis.advanced_analysis.opposite_hexagram) {
        markdown += `**错卦**: ${analysis.advanced_analysis.opposite_hexagram.name}\n`;
        markdown += `错卦分析: ${analysis.advanced_analysis.opposite_hexagram.analysis}\n\n`;
      }
      
      if (analysis.advanced_analysis.reverse_hexagram) {
        markdown += `**综卦**: ${analysis.advanced_analysis.reverse_hexagram.name}\n`;
        markdown += `综卦分析: ${analysis.advanced_analysis.reverse_hexagram.analysis}\n\n`;
      }
    }
    
    // 五行分析
    if (analysis.hexagram_analysis?.five_elements) {
      const elements = analysis.hexagram_analysis.five_elements;
      markdown += '## 五行分析\n\n';
      markdown += `**上卦五行**: ${elements.upper_element}\n`;
      markdown += `**下卦五行**: ${elements.lower_element}\n`;
      markdown += `**五行关系**: ${elements.relationship}\n`;
      markdown += `**五行平衡**: ${elements.balance}\n\n`;
    }
  }
  
  // 综合解读
  if (data.comprehensive_interpretation) {
    markdown += '## 综合解读\n\n';
    markdown += `${data.comprehensive_interpretation}\n\n`;
  }
  
  // 实用建议
  if (data.practical_guidance) {
    markdown += '## 实用建议\n\n';
    if (data.practical_guidance.immediate_actions) {
      markdown += `**近期行动**: ${data.practical_guidance.immediate_actions}\n`;
    }
    if (data.practical_guidance.long_term_strategy) {
      markdown += `**长期策略**: ${data.practical_guidance.long_term_strategy}\n`;
    }
    if (data.practical_guidance.timing_advice) {
      markdown += `**时机建议**: ${data.practical_guidance.timing_advice}\n`;
    }
    markdown += '\n';
  }
  
  return markdown;
};

// 获取分析类型标题
const getAnalysisTitle = (analysisType: string): string => {
  const titles = {
    'bazi': '八字命理',
    'ziwei': '紫微斗数',
    'yijing': '易经占卜'
  };
  return titles[analysisType as keyof typeof titles] || '命理';
};

// 调用AI API进行解读
export const requestAIInterpretation = async (request: AIInterpretationRequest): Promise<AIInterpretationResult> => {
  const startTime = Date.now();
  
  try {
    // 获取AI配置
    const config = getAIConfig();
    
    // 验证配置
    if (!validateAIConfig(config)) {
      return {
        success: false,
        error: 'AI配置不完整，请检查API Key、API地址和模型名称设置',
        timestamp: new Date().toISOString()
      };
    }
    
    // 转换分析内容为Markdown
    const analysisMarkdown = typeof request.analysisContent === 'string' 
      ? request.analysisContent 
      : convertAnalysisToMarkdown(request.analysisContent, request.analysisType);
    
    console.log('🔄 分析内容转换为Markdown:', {
      originalType: typeof request.analysisContent,
      markdownLength: analysisMarkdown.length,
      preview: analysisMarkdown.substring(0, 200) + '...'
    });
    
    // 获取提示词模板
    const promptTemplate = request.customPrompt || getPromptTemplate(request.analysisType);
    const prompt = promptTemplate.replace('{analysisContent}', analysisMarkdown);
    
    console.log('📝 构建AI提示词:', {
      templateLength: promptTemplate.length,
      finalPromptLength: prompt.length,
      analysisType: request.analysisType
    });
    
    // 构建请求体
    const requestBody = {
      model: config.modelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: config.stream
    };
    
    console.log('🚀 准备发送API请求:', {
      url: config.apiUrl,
      model: config.modelName,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      timeout: config.timeout,
      messageLength: prompt.length,
      timestamp: new Date().toISOString()
    });
    
    // 发送请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ 请求超时，正在中止请求...');
      controller.abort();
    }, config.timeout);
    
    const requestStartTime = Date.now();
    console.log('📡 开始发送HTTP请求...', {
      method: 'POST',
      url: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey.substring(0, 10)}...`
      },
      bodySize: JSON.stringify(requestBody).length
    });
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const requestDuration = Date.now() - requestStartTime;
    
    console.log('📨 收到HTTP响应:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${requestDuration}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ API错误响应:', errorData);
      } catch (parseError) {
        console.log('❌ 无法解析错误响应:', parseError);
        errorData = {};
      }
      
      const errorMessage = `API请求失败: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`;
      console.log('❌ 请求失败:', errorMessage);
      throw new Error(errorMessage);
    }
    
    let content = '';
    let tokensUsed = 0;
    let model = config.modelName;
    
    if (config.stream) {
      // 处理流式响应
      console.log('📡 开始处理流式响应...');
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('📡 流式响应完成');
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留不完整的行
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('📡 收到流式结束标记');
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const delta = parsed.choices[0].delta;
                  if (delta.content) {
                    content += delta.content;
                    // 调用流式更新回调
                    if (request.onStreamUpdate) {
                      request.onStreamUpdate(content);
                    }
                  }
                }
                
                // 获取使用情况和模型信息
                if (parsed.usage) {
                  tokensUsed = parsed.usage.total_tokens;
                }
                if (parsed.model) {
                  model = parsed.model;
                }
              } catch (parseError) {
                console.warn('解析流式数据失败:', parseError, 'data:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      console.log('📄 流式AI解读完成:', {
        contentLength: content.length,
        tokensUsed,
        model,
        totalDuration: `${Date.now() - startTime}ms`
      });
      
    } else {
      // 处理非流式响应
      const data = await response.json();
      
      console.log('✅ AI API成功响应:', {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        usage: data.usage,
        choicesCount: data.choices?.length || 0,
        totalDuration: `${Date.now() - startTime}ms`
      });
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.log('❌ AI响应格式异常:', data);
        throw new Error('AI响应格式异常');
      }
      
      content = data.choices[0].message.content;
      tokensUsed = data.usage?.total_tokens;
      model = data.model || config.modelName;
      
      console.log('📄 AI解读内容:', {
        contentLength: content?.length || 0,
        tokensUsed,
        finishReason: data.choices[0].finish_reason,
        contentPreview: content?.substring(0, 100) + '...'
      });
    }
    
 return {
       success: true,
       content,
       timestamp: new Date().toISOString(),
       model,
       tokensUsed
     };
    
  } catch (error: any) {
    console.error('AI解读请求失败:', error);
    
    let errorMessage = '未知错误';
    if (error.name === 'AbortError') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};

// 保存AI解读结果到本地存储
export const saveAIInterpretation = (analysisId: string, result: AIInterpretationResult): void => {
  try {
    const key = `ai-interpretation-${analysisId}`;
    localStorage.setItem(key, JSON.stringify(result));
  } catch (error) {
    console.error('保存AI解读结果失败:', error);
  }
};

// 从本地存储获取AI解读结果
export const getAIInterpretation = (analysisId: string): AIInterpretationResult | null => {
  try {
    const key = `ai-interpretation-${analysisId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('获取AI解读结果失败:', error);
  }
  return null;
};

// 清除AI解读结果
export const clearAIInterpretation = (analysisId: string): void => {
  try {
    const key = `ai-interpretation-${analysisId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('清除AI解读结果失败:', error);
  }
};