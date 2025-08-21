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
    if (analysisData.basic_info.bazi_chart) {
      const bazi = analysisData.basic_info.bazi_chart;
      markdown += `\n### 🔮 八字信息\n\n`;
      markdown += `| 柱位 | 天干 | 地支 | 纳音 |\n`;
      markdown += `|------|------|------|------|\n`;
      
      // 处理年柱
      let yearGan = '-', yearZhi = '-', yearNayin = '-';
      if (bazi.year_pillar) {
        if (typeof bazi.year_pillar === 'string' && bazi.year_pillar.length >= 2) {
          yearGan = bazi.year_pillar[0];
          yearZhi = bazi.year_pillar[1];
        } else if (typeof bazi.year_pillar === 'object') {
          yearGan = bazi.year_pillar.gan || bazi.year_pillar.tiangan || '-';
          yearZhi = bazi.year_pillar.zhi || bazi.year_pillar.dizhi || '-';
        }
        yearNayin = bazi.year_nayin || bazi.year_pillar?.nayin || '-';
      }
      
      // 如果从bazi_chart中无法获取，尝试从四柱解释中提取
      if (yearGan === '-' && analysisData.basic_info.pillar_interpretations) {
        const pillars = analysisData.basic_info.pillar_interpretations;
        if (pillars.year_pillar) {
          const yearText = pillars.year_pillar.interpretation || pillars.year_pillar;
          const yearMatch = yearText.match(/年柱([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
          if (yearMatch) {
            yearGan = yearMatch[1];
            yearZhi = yearMatch[2];
          }
          // 提取纳音信息 - 扩展匹配模式
          if (yearNayin === '-') {
            // 尝试多种纳音匹配模式
            let nayinMatch = yearText.match(/纳音[：:]?([^，。\n]+)/);
            if (!nayinMatch) {
              // 尝试匹配常见纳音名称
              nayinMatch = yearText.match(/(海中金|炉中火|大林木|路旁土|剑锋金|山头火|涧下水|城头土|白蜡金|杨柳木|泉中水|屋上土|霹雳火|松柏木|长流水|沙中金|山下火|平地木|壁上土|金箔金|覆灯火|天河水|大驿土|钗钏金|桑柘木|大溪水|沙中土|天上火|石榴木|大海水)/);
            }
            if (nayinMatch) {
              yearNayin = nayinMatch[1].trim();
            } else {
              // 根据干支推算纳音
              const ganZhi = `${yearGan}${yearZhi}`;
              const nayinMap = {
                '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
                '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
                '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
                '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
                '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
                '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
                '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
                '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
                '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
                '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
                '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
                '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
                '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
                '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
                '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
              };
              if (nayinMap[ganZhi]) {
                yearNayin = nayinMap[ganZhi];
              }
            }
          }
        }
      }
      
      markdown += `| 年柱 | ${yearGan} | ${yearZhi} | ${yearNayin} |\n`;
      
      // 处理月柱
      let monthGan = '-', monthZhi = '-', monthNayin = '-';
      if (bazi.month_pillar) {
        if (typeof bazi.month_pillar === 'string' && bazi.month_pillar.length >= 2) {
          monthGan = bazi.month_pillar[0];
          monthZhi = bazi.month_pillar[1];
        } else if (typeof bazi.month_pillar === 'object') {
          monthGan = bazi.month_pillar.gan || bazi.month_pillar.tiangan || '-';
          monthZhi = bazi.month_pillar.zhi || bazi.month_pillar.dizhi || '-';
        }
        monthNayin = bazi.month_nayin || bazi.month_pillar?.nayin || '-';
      }
      
      // 如果从bazi_chart中无法获取，尝试从四柱解释中提取
      if (monthGan === '-' && analysisData.basic_info.pillar_interpretations) {
        const pillars = analysisData.basic_info.pillar_interpretations;
        if (pillars.month_pillar) {
          const monthText = pillars.month_pillar.interpretation || pillars.month_pillar;
          const monthMatch = monthText.match(/月柱([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
          if (monthMatch) {
            monthGan = monthMatch[1];
            monthZhi = monthMatch[2];
          }
          // 提取纳音信息 - 扩展匹配模式
          if (monthNayin === '-') {
            // 尝试多种纳音匹配模式
            let nayinMatch = monthText.match(/纳音[：:]?([^，。\n]+)/);
            if (!nayinMatch) {
              nayinMatch = monthText.match(/(海中金|炉中火|大林木|路旁土|剑锋金|山头火|涧下水|城头土|白蜡金|杨柳木|泉中水|屋上土|霹雳火|松柏木|长流水|沙中金|山下火|平地木|壁上土|金箔金|覆灯火|天河水|大驿土|钗钏金|桑柘木|大溪水|沙中土|天上火|石榴木|大海水)/);
            }
            if (nayinMatch) {
              monthNayin = nayinMatch[1].trim();
            } else {
              // 根据干支推算纳音
              const ganZhi = `${monthGan}${monthZhi}`;
              const nayinMap = {
                '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
                '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
                '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
                '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
                '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
                '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
                '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
                '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
                '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
                '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
                '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
                '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
                '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
                '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
                '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
              };
              if (nayinMap[ganZhi]) {
                monthNayin = nayinMap[ganZhi];
              }
            }
          }
        }
      }
      
      markdown += `| 月柱 | ${monthGan} | ${monthZhi} | ${monthNayin} |\n`;
      
      // 处理日柱
      let dayGan = '-', dayZhi = '-', dayNayin = '-';
      if (bazi.day_pillar) {
        if (typeof bazi.day_pillar === 'string' && bazi.day_pillar.length >= 2) {
          dayGan = bazi.day_pillar[0];
          dayZhi = bazi.day_pillar[1];
        } else if (typeof bazi.day_pillar === 'object') {
          dayGan = bazi.day_pillar.gan || bazi.day_pillar.tiangan || '-';
          dayZhi = bazi.day_pillar.zhi || bazi.day_pillar.dizhi || '-';
        }
        dayNayin = bazi.day_nayin || bazi.day_pillar?.nayin || '-';
      }
      
      // 如果从bazi_chart中无法获取，尝试从四柱解释中提取
      if (dayGan === '-' && analysisData.basic_info.pillar_interpretations) {
        const pillars = analysisData.basic_info.pillar_interpretations;
        if (pillars.day_pillar) {
          const dayText = pillars.day_pillar.interpretation || pillars.day_pillar;
          const dayMatch = dayText.match(/日柱([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
          if (dayMatch) {
            dayGan = dayMatch[1];
            dayZhi = dayMatch[2];
          }
          // 提取纳音信息 - 扩展匹配模式
          if (dayNayin === '-') {
            // 尝试多种纳音匹配模式
            let nayinMatch = dayText.match(/纳音[：:]?([^，。\n]+)/);
            if (!nayinMatch) {
              nayinMatch = dayText.match(/(海中金|炉中火|大林木|路旁土|剑锋金|山头火|涧下水|城头土|白蜡金|杨柳木|泉中水|屋上土|霹雳火|松柏木|长流水|沙中金|山下火|平地木|壁上土|金箔金|覆灯火|天河水|大驿土|钗钏金|桑柘木|大溪水|沙中土|天上火|石榴木|大海水)/);
            }
            if (nayinMatch) {
              dayNayin = nayinMatch[1].trim();
            } else {
              // 根据干支推算纳音
              const ganZhi = `${dayGan}${dayZhi}`;
              const nayinMap = {
                '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
                '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
                '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
                '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
                '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
                '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
                '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
                '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
                '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
                '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
                '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
                '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
                '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
                '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
                '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
              };
              if (nayinMap[ganZhi]) {
                dayNayin = nayinMap[ganZhi];
              }
            }
          }
        }
      }
      
      markdown += `| 日柱 | ${dayGan} | ${dayZhi} | ${dayNayin} |\n`;
      
      // 处理时柱
      let hourGan = '-', hourZhi = '-', hourNayin = '-';
      if (bazi.hour_pillar) {
        if (typeof bazi.hour_pillar === 'string' && bazi.hour_pillar.length >= 2) {
          hourGan = bazi.hour_pillar[0];
          hourZhi = bazi.hour_pillar[1];
        } else if (typeof bazi.hour_pillar === 'object') {
          hourGan = bazi.hour_pillar.gan || bazi.hour_pillar.tiangan || '-';
          hourZhi = bazi.hour_pillar.zhi || bazi.hour_pillar.dizhi || '-';
        }
        hourNayin = bazi.hour_nayin || bazi.hour_pillar?.nayin || '-';
      }
      
      // 如果从bazi_chart中无法获取，尝试从四柱解释中提取
      if (hourGan === '-' && analysisData.basic_info.pillar_interpretations) {
        const pillars = analysisData.basic_info.pillar_interpretations;
        if (pillars.hour_pillar) {
          const hourText = pillars.hour_pillar.interpretation || pillars.hour_pillar;
          const hourMatch = hourText.match(/时柱([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/);
          if (hourMatch) {
            hourGan = hourMatch[1];
            hourZhi = hourMatch[2];
          }
          // 提取纳音信息 - 扩展匹配模式
          if (hourNayin === '-') {
            // 尝试多种纳音匹配模式
            let nayinMatch = hourText.match(/纳音[：:]?([^，。\n]+)/);
            if (!nayinMatch) {
              nayinMatch = hourText.match(/(海中金|炉中火|大林木|路旁土|剑锋金|山头火|涧下水|城头土|白蜡金|杨柳木|泉中水|屋上土|霹雳火|松柏木|长流水|沙中金|山下火|平地木|壁上土|金箔金|覆灯火|天河水|大驿土|钗钏金|桑柘木|大溪水|沙中土|天上火|石榴木|大海水)/);
            }
            if (nayinMatch) {
              hourNayin = nayinMatch[1].trim();
            } else {
              // 根据干支推算纳音
              const ganZhi = `${hourGan}${hourZhi}`;
              const nayinMap = {
                '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
                '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
                '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
                '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
                '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
                '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
                '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
                '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
                '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
                '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
                '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
                '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
                '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
                '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
                '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
              };
              if (nayinMap[ganZhi]) {
                hourNayin = nayinMap[ganZhi];
              }
            }
          }
        }
      }
      
      markdown += `| 时柱 | ${hourGan} | ${hourZhi} | ${hourNayin} |\n`;
      
      markdown += `\n`;
      
      // 日主信息
      if (bazi.day_master) {
        markdown += `**日主：** ${bazi.day_master}\n`;
      }
      if (bazi.day_master_element) {
        markdown += `**日主五行：** ${bazi.day_master_element}\n`;
      }
      if (bazi.strength_analysis) {
        markdown += `**日主强弱：** ${bazi.strength_analysis}\n`;
      }
      markdown += `\n`;
    }
    
    // 四柱解释
    if (analysisData.basic_info.pillar_interpretations) {
      markdown += `### 📖 四柱解释\n\n`;
      const pillars = analysisData.basic_info.pillar_interpretations;
      
      if (pillars.year_pillar) {
        markdown += `#### 年柱 - ${pillars.year_pillar.pillar || ''}\n`;
        markdown += `${pillars.year_pillar.interpretation || pillars.year_pillar}\n\n`;
      }
      
      if (pillars.month_pillar) {
        markdown += `#### 月柱 - ${pillars.month_pillar.pillar || ''}\n`;
        markdown += `${pillars.month_pillar.interpretation || pillars.month_pillar}\n\n`;
      }
      
      if (pillars.day_pillar) {
        markdown += `#### 日柱 - ${pillars.day_pillar.pillar || ''}\n`;
        markdown += `${pillars.day_pillar.interpretation || pillars.day_pillar}\n\n`;
      }
      
      if (pillars.hour_pillar) {
        markdown += `#### 时柱 - ${pillars.hour_pillar.pillar || ''}\n`;
        markdown += `${pillars.hour_pillar.interpretation || pillars.hour_pillar}\n\n`;
      }
    }
    
    // 农历信息 - 增强处理逻辑
    markdown += `### 🌙 农历信息\n\n`;
    
    let hasLunarInfo = false;
    const lunar = analysisData.basic_info?.lunar_info || {};
    const birthDate = new Date(analysisData.basic_info?.birth_date || '');
    
    // 农历日期信息
    if (lunar.lunar_date && lunar.lunar_date !== '农历信息') {
      markdown += `**农历日期：** ${lunar.lunar_date}\n`;
      hasLunarInfo = true;
    } else if (lunar.year && lunar.month && lunar.day) {
      markdown += `**农历日期：** 农历${lunar.year}年${lunar.month}月${lunar.day}日\n`;
      hasLunarInfo = true;
    }
    
    // 农历年份信息
    if (lunar.lunar_year && lunar.lunar_year !== '农历信息') {
      markdown += `**农历年份：** ${lunar.lunar_year}\n`;
      hasLunarInfo = true;
    } else if (analysisData.basic_info?.birth_date) {
      const year = birthDate.getFullYear();
      markdown += `**公历年份：** ${year}年\n`;
      hasLunarInfo = true;
    }
    
    // 生肖信息
    if (lunar.zodiac) {
      markdown += `**生肖：** ${lunar.zodiac}\n`;
      hasLunarInfo = true;
    } else if (analysisData.basic_info?.birth_date) {
      // 根据年份推算生肖
      const year = birthDate.getFullYear();
      const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
      const zodiacIndex = (year - 1900) % 12;
      const zodiac = zodiacAnimals[zodiacIndex];
      markdown += `**生肖：** ${zodiac}\n`;
      hasLunarInfo = true;
    }
    
    // 节气信息
    if (lunar.solar_term && lunar.solar_term !== '节气信息') {
      markdown += `**节气：** ${lunar.solar_term}\n`;
      hasLunarInfo = true;
    } else if (analysisData.basic_info?.birth_date) {
      // 根据出生日期推算节气
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      let solarTerm = '';
      
      // 24节气推算（基于公历日期）
      if (month === 3 && day >= 5 && day <= 6) solarTerm = '惊蛰';
      else if (month === 3 && day >= 20 && day <= 21) solarTerm = '春分';
      else if (month === 4 && day >= 4 && day <= 6) solarTerm = '清明';
      else if (month === 4 && day >= 19 && day <= 21) solarTerm = '谷雨';
      else if (month === 5 && day >= 5 && day <= 7) solarTerm = '立夏';
      else if (month === 5 && day >= 20 && day <= 22) solarTerm = '小满';
      else if (month === 6 && day >= 5 && day <= 7) solarTerm = '芒种';
      else if (month === 6 && day >= 21 && day <= 22) solarTerm = '夏至';
      else if (month === 7 && day >= 6 && day <= 8) solarTerm = '小暑';
      else if (month === 7 && day >= 22 && day <= 24) solarTerm = '大暑';
      else if (month === 8 && day >= 7 && day <= 9) solarTerm = '立秋';
      else if (month === 8 && day >= 22 && day <= 24) solarTerm = '处暑';
      else if (month === 9 && day >= 7 && day <= 9) solarTerm = '白露';
      else if (month === 9 && day >= 22 && day <= 24) solarTerm = '秋分';
      else if (month === 10 && day >= 8 && day <= 9) solarTerm = '寒露';
      else if (month === 10 && day >= 23 && day <= 24) solarTerm = '霜降';
      else if (month === 11 && day >= 7 && day <= 8) solarTerm = '立冬';
      else if (month === 11 && day >= 22 && day <= 23) solarTerm = '小雪';
      else if (month === 12 && day >= 6 && day <= 8) solarTerm = '大雪';
      else if (month === 12 && day >= 21 && day <= 23) solarTerm = '冬至';
      else if (month === 1 && day >= 5 && day <= 7) solarTerm = '小寒';
      else if (month === 1 && day >= 20 && day <= 21) solarTerm = '大寒';
      else if (month === 2 && day >= 3 && day <= 5) solarTerm = '立春';
      else if (month === 2 && day >= 18 && day <= 20) solarTerm = '雨水';
      
      if (solarTerm) {
        markdown += `**节气：** ${solarTerm}\n`;
        hasLunarInfo = true;
      }
    }
    
    // 干支年信息
    if (lunar.ganzhi_year) {
      markdown += `**干支年：** ${lunar.ganzhi_year}\n`;
      hasLunarInfo = true;
    } else if (analysisData.basic_info?.birth_date) {
      // 根据年份推算干支年
      const year = birthDate.getFullYear();
      const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const ganIndex = (year - 4) % 10;
      const zhiIndex = (year - 4) % 12;
      const ganzhiYear = tianGan[ganIndex] + diZhi[zhiIndex];
      
      markdown += `**干支年：** ${ganzhiYear}年\n`;
      hasLunarInfo = true;
    }
    
    if (!hasLunarInfo) {
      markdown += `*农历信息暂无详细数据*\n`;
    }
    
    markdown += `\n`;
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
    
    if (analysisData.wuxing_analysis.personality_traits) {
      markdown += `### 性格特质\n\n`;
      markdown += `${analysisData.wuxing_analysis.personality_traits}\n\n`;
    }
    
    if (analysisData.wuxing_analysis.improvement_suggestions) {
      markdown += `### 改善建议\n\n`;
      markdown += `${analysisData.wuxing_analysis.improvement_suggestions}\n\n`;
    }
    
    if (analysisData.wuxing_analysis.suggestions) {
      markdown += `### 调和建议\n\n`;
      markdown += `${analysisData.wuxing_analysis.suggestions}\n\n`;
    }
  }
  
  // 十神分析（八字专用）
  if (analysisData.ten_gods_analysis || analysisData.basic_info?.bazi_chart?.ten_gods || analysisData.basic_info?.bazi_chart || analysisData.basic_info?.pillar_interpretations) {
    markdown += `## ⚡ 十神分析\n\n`;
    
    // 从四柱解释中提取十神信息
    let extractedTenGods = {};
    if (analysisData.basic_info?.pillar_interpretations) {
      const pillars = analysisData.basic_info.pillar_interpretations;
      
      // 提取年柱十神
      if (pillars.year_pillar) {
        const yearText = pillars.year_pillar.interpretation || pillars.year_pillar;
        const tenGodMatch = yearText.match(/(正印|偏印|正官|七杀|正财|偏财|食神|伤官|比肩|劫财)关系/);
        if (tenGodMatch) {
          extractedTenGods.year_ten_god = tenGodMatch[1];
        }
      }
      
      // 提取月柱十神
      if (pillars.month_pillar) {
        const monthText = pillars.month_pillar.interpretation || pillars.month_pillar;
        const tenGodMatch = monthText.match(/(正印|偏印|正官|七杀|正财|偏财|食神|伤官|比肩|劫财)关系/);
        if (tenGodMatch) {
          extractedTenGods.month_ten_god = tenGodMatch[1];
        }
      }
      
      // 提取时柱十神
      if (pillars.hour_pillar) {
        const hourText = pillars.hour_pillar.interpretation || pillars.hour_pillar;
        const tenGodMatch = hourText.match(/(正印|偏印|正官|七杀|正财|偏财|食神|伤官|比肩|劫财)关系/);
        if (tenGodMatch) {
          extractedTenGods.hour_ten_god = tenGodMatch[1];
        }
      }
    }
    
    // 如果有专门的十神分析
    if (analysisData.ten_gods_analysis) {
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
    
    // 如果十神信息在bazi_chart中
    const baziChart = analysisData.basic_info?.bazi_chart;
    if (baziChart) {
      const tenGods = baziChart.ten_gods || {};
      
      // 显示各柱十神（优先使用提取的信息）
      const yearTenGod = extractedTenGods.year_ten_god || tenGods.year_ten_god || baziChart.year_ten_god;
      const monthTenGod = extractedTenGods.month_ten_god || tenGods.month_ten_god || baziChart.month_ten_god;
      const hourTenGod = extractedTenGods.hour_ten_god || tenGods.hour_ten_god || baziChart.hour_ten_god;
      
      if (yearTenGod || monthTenGod || hourTenGod) {
        markdown += `### 十神配置\n\n`;
        
        if (yearTenGod) {
          markdown += `- **年柱十神：** ${yearTenGod}\n`;
        }
        if (monthTenGod) {
          markdown += `- **月柱十神：** ${monthTenGod}\n`;
        }
        if (hourTenGod) {
          markdown += `- **时柱十神：** ${hourTenGod}\n`;
        }
        
        // 添加十神分析说明
        markdown += `\n### 十神特征分析\n\n`;
        
        if (yearTenGod) {
          markdown += `**${yearTenGod}（年柱）**：代表祖辈、早年环境和成长背景的影响。\n`;
        }
        if (monthTenGod) {
          markdown += `**${monthTenGod}（月柱）**：代表青年时期、事业发展和社会关系的特点。\n`;
        }
        if (hourTenGod) {
          markdown += `**${hourTenGod}（时柱）**：代表晚年运势、子女关系和人生成就。\n`;
        }
        
        markdown += `\n`;
      }
      
      // 如果有十神统计信息
      if (baziChart.ten_gods_count || baziChart.ten_gods_distribution) {
        const distribution = baziChart.ten_gods_count || baziChart.ten_gods_distribution;
        markdown += `### 十神统计\n\n`;
        
        Object.entries(distribution).forEach(([god, count]) => {
          if (count > 0) {
            markdown += `- **${god}：** ${count}个\n`;
          }
        });
        
        markdown += `\n`;
      }
    }
  }
  

  
  // 格局分析（八字专用）
  if (analysisData.geju_analysis) {
    markdown += `## 🎯 格局分析\n\n`;
    
    if (analysisData.geju_analysis.pattern_type) {
      markdown += `### 格局类型\n\n`;
      markdown += `**格局：** ${analysisData.geju_analysis.pattern_type}\n\n`;
    }
    
    if (analysisData.geju_analysis.pattern_strength) {
      const strength = analysisData.geju_analysis.pattern_strength;
      const strengthLabel = strength === 'strong' ? '强' : strength === 'moderate' ? '中等' : strength === 'fair' ? '一般' : '较弱';
      markdown += `**格局强度：** ${strengthLabel}\n\n`;
    }
    
    if (analysisData.geju_analysis.characteristics) {
      markdown += `### 格局特征\n\n`;
      markdown += `${analysisData.geju_analysis.characteristics}\n\n`;
    }
    
    if (analysisData.geju_analysis.career_path) {
      markdown += `### 适合职业\n\n`;
      markdown += `${analysisData.geju_analysis.career_path}\n\n`;
    }
    
    if (analysisData.geju_analysis.life_meaning) {
      markdown += `### 人生意义\n\n`;
      markdown += `${analysisData.geju_analysis.life_meaning}\n\n`;
    }
    
    if (analysisData.geju_analysis.development_strategy) {
      markdown += `### 发展策略\n\n`;
      markdown += `${analysisData.geju_analysis.development_strategy}\n\n`;
    }
  }
  
  // 大运分析（八字专用）
  if (analysisData.dayun_analysis) {
    markdown += `## 📈 大运分析\n\n`;
    
    if (analysisData.dayun_analysis.current_dayun) {
      markdown += `### 当前大运\n\n`;
      
      // 处理大运信息，可能是对象或字符串
       let dayunText = '';
       const currentDayun = analysisData.dayun_analysis.current_dayun;
       const currentAge = analysisData.dayun_analysis.current_age;
       
       if (typeof currentDayun === 'string') {
         dayunText = currentDayun;
       } else if (typeof currentDayun === 'object' && currentDayun !== null) {
         // 如果是对象，尝试提取干支信息
         const gan = currentDayun.gan || currentDayun.tiangan || '';
         const zhi = currentDayun.zhi || currentDayun.dizhi || '';
         const period = currentDayun.period || currentDayun.name || '';
         dayunText = period || `${gan}${zhi}` || '当前大运';
       } else if (typeof currentDayun === 'number' && analysisData.dayun_analysis.dayun_sequence) {
         // 如果是数字索引，从大运序列中查找
         const sequence = analysisData.dayun_analysis.dayun_sequence;
         if (sequence[currentDayun - 1]) {
           const targetDayun = sequence[currentDayun - 1];
           if (typeof targetDayun === 'object' && targetDayun.dayun) {
             if (typeof targetDayun.dayun === 'string') {
               dayunText = targetDayun.dayun;
             } else if (typeof targetDayun.dayun === 'object') {
               const gan = targetDayun.dayun.gan || targetDayun.dayun.tiangan || '';
               const zhi = targetDayun.dayun.zhi || targetDayun.dayun.dizhi || '';
               dayunText = `${gan}${zhi}`;
             }
           } else if (targetDayun.period) {
             dayunText = targetDayun.period;
           }
         }
         
         // 如果还是没找到，根据年龄匹配
         if (!dayunText && currentAge) {
           for (const period of sequence) {
             if (typeof period === 'object' && period.start_age && period.end_age) {
               if (currentAge >= period.start_age && currentAge <= period.end_age) {
                 if (period.dayun) {
                   if (typeof period.dayun === 'string') {
                     dayunText = period.dayun;
                   } else if (typeof period.dayun === 'object') {
                     const gan = period.dayun.gan || period.dayun.tiangan || '';
                     const zhi = period.dayun.zhi || period.dayun.dizhi || '';
                     dayunText = `${gan}${zhi}`;
                   }
                 } else if (period.period) {
                   dayunText = period.period;
                 }
                 break;
               }
             }
           }
         }
       }
       
       if (!dayunText) {
         dayunText = '当前大运';
       }
      
      markdown += `**大运：** ${dayunText}\n`;
      if (analysisData.dayun_analysis.current_age) {
        markdown += `**当前年龄：** ${analysisData.dayun_analysis.current_age}岁\n`;
      }
      if (analysisData.dayun_analysis.start_luck_age) {
        markdown += `**起运年龄：** ${analysisData.dayun_analysis.start_luck_age}岁\n`;
      }
      markdown += `\n`;
    }
    
    if (analysisData.dayun_analysis.dayun_influence) {
      markdown += `### 大运影响\n\n`;
      markdown += `${analysisData.dayun_analysis.dayun_influence}\n\n`;
    }
    
    if (analysisData.dayun_analysis.yearly_fortune) {
      markdown += `### 流年运势\n\n`;
      markdown += `${analysisData.dayun_analysis.yearly_fortune}\n\n`;
    }
    
    if (analysisData.dayun_analysis.future_outlook) {
      markdown += `### 未来展望\n\n`;
      markdown += `${analysisData.dayun_analysis.future_outlook}\n\n`;
    }
    
    if (analysisData.dayun_analysis.dayun_sequence && Array.isArray(analysisData.dayun_analysis.dayun_sequence)) {
      markdown += `### 大运序列\n\n`;
      markdown += `| 年龄段 | 大运 | 运势特点 |\n`;
      markdown += `|--------|------|----------|\n`;
      analysisData.dayun_analysis.dayun_sequence.forEach((period, index) => {
        if (typeof period === 'object' && period !== null) {
          const ageRange = period.age_range || `${period.start_age || '?'}-${period.end_age || '?'}`;
          
          // 处理大运信息
          let dayunText = '';
          if (period.dayun) {
            if (typeof period.dayun === 'string') {
              dayunText = period.dayun;
            } else if (typeof period.dayun === 'object') {
              const gan = period.dayun.gan || period.dayun.tiangan || '';
              const zhi = period.dayun.zhi || period.dayun.dizhi || '';
              dayunText = `${gan}${zhi}`;
            }
          } else if (period.period) {
            dayunText = period.period;
          } else if (period.gan && period.zhi) {
            dayunText = `${period.gan}${period.zhi}`;
          } else {
            dayunText = `第${index + 1}运`;
          }
          
          const description = period.description || period.characteristics || period.analysis || '运势平稳';
          markdown += `| ${ageRange}岁 | ${dayunText} | ${description} |\n`;
        } else {
          // 如果是简单的数字或其他类型，生成基本信息
          const startAge = 11 + index * 10;
          const endAge = startAge + 9;
          markdown += `| ${startAge}-${endAge}岁 | 第${index + 1}运 | 运势待分析 |\n`;
        }
      });
      markdown += `\n`;
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
  
  // 人生指导（八字专用）
  if (analysisData.life_guidance) {
    markdown += `## 🌟 人生指导\n\n`;
    
    if (analysisData.life_guidance.overall_summary) {
      markdown += `### 综合总结\n\n`;
      markdown += `${analysisData.life_guidance.overall_summary}\n\n`;
    }
    
    if (analysisData.life_guidance.career_development) {
      markdown += `### 事业发展\n\n`;
      markdown += `${analysisData.life_guidance.career_development}\n\n`;
    }
    
    if (analysisData.life_guidance.wealth_management) {
      markdown += `### 财富管理\n\n`;
      markdown += `${analysisData.life_guidance.wealth_management}\n\n`;
    }
    
    if (analysisData.life_guidance.marriage_relationships) {
      markdown += `### 婚姻感情\n\n`;
      markdown += `${analysisData.life_guidance.marriage_relationships}\n\n`;
    }
    
    if (analysisData.life_guidance.health_wellness) {
      markdown += `### 健康养生\n\n`;
      markdown += `${analysisData.life_guidance.health_wellness}\n\n`;
    }
    
    if (analysisData.life_guidance.personal_development) {
      markdown += `### 个人发展\n\n`;
      markdown += `${analysisData.life_guidance.personal_development}\n\n`;
    }
    
    // 兼容旧格式
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
  }
  
  // 现代应用建议（八字专用）
  if (analysisData.modern_applications) {
    markdown += `## 💡 现代应用建议\n\n`;
    
    if (analysisData.modern_applications.lifestyle_recommendations) {
      markdown += `### 生活方式建议\n\n`;
      markdown += `${analysisData.modern_applications.lifestyle_recommendations}\n\n`;
    }
    
    if (analysisData.modern_applications.career_strategies) {
      markdown += `### 职业策略\n\n`;
      markdown += `${analysisData.modern_applications.career_strategies}\n\n`;
    }
    
    if (analysisData.modern_applications.relationship_advice) {
      markdown += `### 人际关系建议\n\n`;
      markdown += `${analysisData.modern_applications.relationship_advice}\n\n`;
    }
    
    if (analysisData.modern_applications.decision_making) {
      markdown += `### 决策指导\n\n`;
      markdown += `${analysisData.modern_applications.decision_making}\n\n`;
    }
    
    // 兼容旧格式
    Object.entries(analysisData.modern_applications).forEach(([key, value]) => {
      const keyNames = {
        lifestyle: '生活方式建议',
        career_development: '职业发展建议',
        relationship_advice: '人际关系建议',
        health_maintenance: '健康养生建议',
        financial_planning: '理财规划建议'
      };
      
      if (keyNames[key] && value && ![
        'lifestyle_recommendations',
        'career_strategies', 
        'relationship_advice',
        'decision_making'
      ].includes(key)) {
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
      markdown += `- **性别：** ${personal.gender === 'male' ? '男性' : personal.gender === 'female' ? '女性' : personal.gender || '未提供'}\n`;
      markdown += `- **出生日期：** ${personal.birth_date || '未提供'}\n`;
      markdown += `- **出生时间：** ${personal.birth_time || '未提供'}\n`;
    }
    
    // 八字信息
    if (analysisData.basic_info.bazi_info) {
      markdown += `\n### 🎋 八字信息\n\n`;
      const bazi = analysisData.basic_info.bazi_info;
      markdown += `- **年柱：** ${bazi.year || '未知'}\n`;
      markdown += `- **月柱：** ${bazi.month || '未知'}\n`;
      markdown += `- **日柱：** ${bazi.day || '未知'}\n`;
      markdown += `- **时柱：** ${bazi.hour || '未知'}\n\n`;
    }
    
    // 命宫位置信息
      if (analysisData.basic_info.ming_gong_position || analysisData.ziwei_analysis?.ming_gong_position || analysisData.ziwei_analysis?.twelve_palaces?.命宫) {
        markdown += `### 🏰 命宫位置\n\n`;
        
        // 从多个数据源获取命宫位置信息
        const mingGongPos = analysisData.basic_info.ming_gong_position || analysisData.ziwei_analysis?.ming_gong_position;
        const mingGongPalace = analysisData.ziwei_analysis?.twelve_palaces?.命宫;
        
        // 显示命宫位置
        if (mingGongPos?.position || mingGongPos?.branch) {
          const position = mingGongPos.position || mingGongPos.branch;
          markdown += `**命宫位置：** ${position}\n`;
          markdown += `命宫在${position}宫\n\n`;
        } else if (analysisData.basic_info?.ming_gong || analysisData.basic_info?.life_palace) {
          const position = analysisData.basic_info.ming_gong || analysisData.basic_info.life_palace;
          markdown += `**命宫位置：** ${position}\n`;
          markdown += `命宫在${position}宫\n\n`;
        }
        
        // 显示命宫位置详解
        const position = mingGongPos?.position || mingGongPos?.branch || analysisData.basic_info?.ming_gong || analysisData.basic_info?.life_palace;
        const description = mingGongPos?.description || mingGongPos?.detailed_analysis;
        
        // 检查description是否为有效的详细解释（不是简单的"命宫在X宫"格式）
        const isDetailedDescription = description && description.length > 10 && !description.match(/^命宫在.{1,2}宫$/);
        
        if (isDetailedDescription) {
          markdown += `**命宫位置详解：**\n`;
          markdown += `${description}\n\n`;
        } else if (position) {
          // 提供默认的宫位解释
          const palaceExplanations = {
            '子': '子宫属水，代表智慧和流动，使您思维敏捷，适应能力强，善于在变化中寻找机会。',
            '丑': '丑宫属土，代表稳重和积累，使您性格踏实，做事有条理，善于积累财富和经验。',
            '寅': '寅宫属木，代表生长和创新，使您充满活力，勇于开拓，具有很强的进取心。',
            '卯': '卯宫属木，代表温和和艺术，使您性格温和，具有艺术天赋，善于与人相处。',
            '辰': '辰宫属土，代表智慧和储藏，使您善于学习和积累知识，在专业领域能够达到很高的水平。',
            '巳': '巳宫属火，代表智慧和变化，使您聪明机智，善于思考，但有时过于多虑。',
            '午': '午宫属火，代表光明和热情，使您性格开朗，热情大方，具有很强的表现力。',
            '未': '未宫属土，代表包容和服务，使您具有很强的服务精神，善于照顾他人。',
            '申': '申宫属金，代表果断和执行，使您做事果断，执行力强，善于处理实务。',
            '酉': '酉宫属金，代表精细和完美，使您注重细节，追求完美，具有很强的审美能力。',
            '戌': '戌宫属土，代表忠诚和责任，使您忠诚可靠，责任感强，善于辅助他人。',
            '亥': '亥宫属水，代表智慧和包容，使您心胸宽广，具有很强的包容心和同情心。'
          };
          
          const explanation = palaceExplanations[position] || `${position}宫是您命宫所在的位置，影响着您的性格特质和人生发展方向。`;
          markdown += `**命宫位置详解：**\n`;
          markdown += `${explanation}\n\n`;
        }
      }
     
     // 五行局详解
     if (analysisData.basic_info.wuxing_ju) {
       markdown += `### 🌟 五行局详解\n\n`;
       const wuxingJu = analysisData.basic_info.wuxing_ju;
      
      if (wuxingJu.type) {
        markdown += `**五行局类型：** ${wuxingJu.type}\n\n`;
      }
      
      if (wuxingJu.description) {
        markdown += `**五行局说明：** ${wuxingJu.description}\n\n`;
      }
      
      // 纳音五行分析
      if (wuxingJu.nayin) {
        markdown += `#### 🔥 纳音五行分析\n\n`;
        markdown += `**纳音五行：** ${wuxingJu.nayin}\n\n`;
        
        // 纳音五行详细解释
        const nayinExplanations = {
          '海中金': '如深海珍宝般内敛珍贵，性格深沉内敛，不轻易显露才华，但一旦时机成熟便能展现惊人的能力。',
          '剑锋金': '锋利而坚韧，具有果断的决策能力和强烈的进取心，适合在竞争激烈的环境中发展。',
          '白蜡金': '纯净温润，具有很强的适应能力和协调能力，适合通过人际关系和团队合作来实现目标。',
          '砂中金': '需要淘洗显现，成功需要经过磨练和积累，通过不断努力最终能获得丰厚回报。',
          '金箔金': '薄而广泛，具有灵活多变的特质，适合在多元化发展中寻找机会。',
          '钗钏金': '精美实用，注重品质和细节，适合在精品化路线上发展。',
          '大林木': '如参天大树，具有强大的成长潜力和包容能力，适合长期规划和稳步发展。',
          '杨柳木': '柔韧优美，具有很强的适应性和创造力，适合在变化中寻找发展机会。',
          '松柏木': '坚韧不屈，具有顽强的意志力和持久的耐力，虽有波折但最终能够获得成功。',
          '平地木': '广阔包容，具有很强的团队协作能力，适合在团队中发挥领导作用。',
          '桑柘木': '实用有价值，注重实际效果和长远价值，适合在实业中发展。',
          '石榴木': '多子多福，具有旺盛的生命力和创造力，适合在人际交往中发展事业。',
          '涧下水': '清澈持续，具有纯净的品格和坚持的精神，适合在专业领域深耕发展。',
          '泉中水': '源源不断，具有丰富的创造力和持续的动力，适合在新兴领域发展。',
          '长流水': '绵延不绝，具有持久的发展能力，适合长期投资和积累。',
          '天河水': '高远广阔，具有远大的志向和宏观的视野，适合在高层次平台发展。',
          '大溪水': '奔腾有力，具有强大的行动力和进取心，适合在变化中把握机遇。',
          '大海水': '深邃包容，具有深厚的智慧和广阔的胸怀，适合在国际化平台发展。',
          '炉中火': '热烈专注，具有专业的精神和热情的态度，适合在技术领域深入钻研。',
          '山头火': '明亮显眼，具有出众的表现力和领导魅力，适合在公众平台发展。',
          '霹雳火': '迅猛有力，具有快速的反应能力和强烈的爆发力，适合在快节奏环境中发展。',
          '山下火': '温暖持久，具有温和的性格和持续的服务精神，适合在服务行业发展。',
          '覆灯火': '温馨照明，具有照顾他人的天性和温暖的人格魅力，适合在关怀性行业发展。',
          '天上火': '光明高远，具有正直的品格和崇高的理想，适合在公正性行业发展。',
          '路旁土': '承载包容，具有踏实的品格和支持他人的能力，适合在基础性行业发展。',
          '城头土': '坚固防护，具有强烈的责任感和保护意识，适合在防护性行业发展。',
          '屋上土': '实用温馨，注重家庭和谐与实际效果，适合在家庭相关行业发展。',
          '壁上土': '装饰美化，具有艺术天赋和美化能力，适合在美化性行业发展。',
          '大驿土': '连接沟通，具有很强的组织协调能力，适合在协调性行业发展。',
          '沙中土': '细腻广泛，具有细致入微的观察力和周到的处事能力，适合在精细化行业发展。'
        };
        
        const nayinDesc = nayinExplanations[wuxingJu.nayin] || `您的纳音五行为${wuxingJu.nayin}，这是您天生的五行本质和能量特征。`;
         markdown += `**纳音特质：** ${nayinDesc}\n\n`;
         
         markdown += `**纳音在紫微斗数中的应用：**\n`;
         markdown += `- 🏰 **五行局确定**：年柱纳音直接决定五行局类型，影响紫微星的定位和整个命盘的格局\n`;
         markdown += `- ⏰ **大限推算**：五行局数决定大限的起始年龄和每步大限的年数，是推算运程的基础\n`;
         markdown += `- 🌟 **性格分析**：纳音五行体现了深层的性格特质，与主星配合形成完整的性格画像\n`;
      }
    }
  }
  
  // 详细分析 - 紫微斗数的核心内容
  if (analysisData.detailed_analysis) {
    const detailed = analysisData.detailed_analysis;
    
    // 个性分析
    if (detailed.personality_analysis) {
      markdown += `\n## 🎭 个性分析\n\n`;
      const personality = detailed.personality_analysis;
      
      if (personality.overview) {
        markdown += `### 性格概述\n\n`;
        markdown += `${personality.overview}\n\n`;
      }
      
      if (personality.core_traits) {
        markdown += `### 核心特质\n\n`;
        markdown += `${personality.core_traits}\n\n`;
      }
      
      if (personality.strengths) {
        markdown += `### 优势特质\n\n`;
        markdown += `${personality.strengths}\n\n`;
      }
      
      if (personality.challenges) {
        markdown += `### 需要注意\n\n`;
        markdown += `${personality.challenges}\n\n`;
      }
      
      if (personality.development_potential) {
        markdown += `### 发展潜力\n\n`;
        markdown += `${personality.development_potential}\n\n`;
      }
    }
    
    // 事业分析
    if (detailed.career_analysis) {
      markdown += `\n## 💼 事业分析\n\n`;
      const career = detailed.career_analysis;
      
      if (career.career_potential) {
        markdown += `### 事业潜力\n\n`;
        markdown += `${career.career_potential}\n\n`;
      }
      
      if (career.suitable_industries) {
        markdown += `### 适合行业\n\n`;
        markdown += `${career.suitable_industries}\n\n`;
      }
      
      if (career.leadership_style) {
        markdown += `### 领导风格\n\n`;
        markdown += `${career.leadership_style}\n\n`;
      }
      
      if (career.success_strategies) {
        markdown += `### 成功策略\n\n`;
        markdown += `${career.success_strategies}\n\n`;
      }
      
      if (career.modern_career_advice) {
        markdown += `### 现代事业建议\n\n`;
        markdown += `${career.modern_career_advice}\n\n`;
      }
    }
    
    // 财富分析
    if (detailed.wealth_analysis) {
      markdown += `\n## 💰 财富分析\n\n`;
      const wealth = detailed.wealth_analysis;
      
      if (wealth.wealth_potential) {
        markdown += `### 财运潜力\n\n`;
        markdown += `${wealth.wealth_potential}\n\n`;
      }
      
      if (wealth.earning_style) {
        markdown += `### 赚钱方式\n\n`;
        markdown += `${wealth.earning_style}\n\n`;
      }
      
      if (wealth.investment_tendency) {
        markdown += `### 投资倾向\n\n`;
        markdown += `${wealth.investment_tendency}\n\n`;
      }
      
      if (wealth.financial_planning) {
        markdown += `### 理财规划建议\n\n`;
        markdown += `${wealth.financial_planning}\n\n`;
      }
    }
    
    // 感情分析
    if (detailed.relationship_analysis) {
      markdown += `\n## 💕 感情分析\n\n`;
      const relationship = detailed.relationship_analysis;
      
      if (relationship.marriage_fortune) {
        markdown += `### 婚姻运势\n\n`;
        markdown += `${relationship.marriage_fortune}\n\n`;
      }
      
      if (relationship.spouse_characteristics) {
        markdown += `### 配偶特质\n\n`;
        markdown += `${relationship.spouse_characteristics}\n\n`;
      }
      
      if (relationship.relationship_pattern) {
        markdown += `### 感情模式\n\n`;
        markdown += `${relationship.relationship_pattern}\n\n`;
      }
      
      if (relationship.relationship_advice) {
        markdown += `### 感情建议\n\n`;
        markdown += `${relationship.relationship_advice}\n\n`;
      }
    }
    
    // 健康分析
    if (detailed.health_analysis) {
      markdown += `\n## 🏥 健康分析\n\n`;
      const health = detailed.health_analysis;
      
      if (health.constitution_analysis) {
        markdown += `### 体质分析\n\n`;
        markdown += `${health.constitution_analysis}\n\n`;
      }
      
      if (health.health_tendencies) {
        markdown += `### 健康倾向\n\n`;
        markdown += `${health.health_tendencies}\n\n`;
      }
      
      if (health.vulnerable_areas) {
        markdown += `### 需要注意的部位\n\n`;
        markdown += `${health.vulnerable_areas}\n\n`;
      }
      
      if (health.health_maintenance) {
        markdown += `### 养生建议\n\n`;
        markdown += `${health.health_maintenance}\n\n`;
      }
    }
    
    // 流年分析
    if (detailed.timing_analysis) {
      markdown += `\n## 📅 流年分析\n\n`;
      const timing = detailed.timing_analysis;
      
      if (timing.liu_nian_analysis) {
        const liuNian = timing.liu_nian_analysis;
        markdown += `### 年度运势\n\n`;
        
        if (liuNian.year_overview) {
          markdown += `**年度概述：** ${liuNian.year_overview}\n\n`;
        }
        
        if (liuNian.year_opportunities && Array.isArray(liuNian.year_opportunities)) {
          markdown += `**发展机遇：**\n`;
          liuNian.year_opportunities.forEach(opportunity => {
            markdown += `- ${opportunity}\n`;
          });
          markdown += `\n`;
        }
        
        if (liuNian.year_challenges && Array.isArray(liuNian.year_challenges)) {
          markdown += `**注意事项：**\n`;
          liuNian.year_challenges.forEach(challenge => {
            markdown += `- ${challenge}\n`;
          });
          markdown += `\n`;
        }
        
        if (liuNian.year_focus_areas && Array.isArray(liuNian.year_focus_areas)) {
          markdown += `**重点领域：** ${liuNian.year_focus_areas.join('、')}\n\n`;
        }
      }
    }
    
    // 人生指导
    if (detailed.life_guidance) {
      markdown += `\n## 🌟 人生指导\n\n`;
      const guidance = detailed.life_guidance;
      
      if (guidance.life_philosophy) {
        markdown += `### 人生哲学\n\n`;
        markdown += `${guidance.life_philosophy}\n\n`;
      }
      
      if (guidance.development_suggestions) {
        markdown += `### 发展建议\n\n`;
        markdown += `${guidance.development_suggestions}\n\n`;
      }
      
      if (guidance.life_priorities) {
        markdown += `### 人生重点\n\n`;
        markdown += `${guidance.life_priorities}\n\n`;
      }
      
      if (guidance.spiritual_growth) {
        markdown += `### 精神成长\n\n`;
        markdown += `${guidance.spiritual_growth}\n\n`;
      }
      
      if (guidance.overall_summary) {
        markdown += `### 综合总结\n\n`;
        markdown += `${guidance.overall_summary}\n\n`;
      }
    }
  }
  
  // 十二宫位分析（紫微斗数专用）
  if (analysisData.ziwei_analysis?.twelve_palaces) {
    markdown += `\n## 🏛️ 十二宫位详解\n\n`;
    
    markdown += `紫微斗数将人生分为十二个宫位，每个宫位代表不同的人生领域。\n\n`;
    
    // 星曜强度等级说明
    markdown += `### ⭐ 星曜强度等级说明\n\n`;
    markdown += `| 强度等级 | 说明 | 影响 |\n`;
    markdown += `|----------|------|------|\n`;
    markdown += `| **旺** | 最强 | 星曜力量最强，相关人生领域发展顺利 |\n`;
    markdown += `| **得地** | 较强 | 星曜力量较强，发展较为顺利 |\n`;
    markdown += `| **平** | 中等 | 星曜力量中等，需要努力发展 |\n`;
    markdown += `| **不得地** | 较弱 | 星曜力量较弱，需要更多努力 |\n`;
    markdown += `| **陷** | 最弱 | 星曜力量最弱，发展较为困难 |\n\n`;
    
    const palaces = analysisData.ziwei_analysis.twelve_palaces;
    const palaceNames = {
      '命宫': { name: '命宫', desc: '主导人生格局、性格特质和整体运势' },
      '兄弟宫': { name: '兄弟宫', desc: '手足关系、朋友交往和团队合作' },
      '夫妻宫': { name: '夫妻宫', desc: '婚姻感情、配偶特质和感情运势' },
      '子女宫': { name: '子女宫', desc: '子女缘分、创造力和部属关系' },
      '财帛宫': { name: '财帛宫', desc: '财富状况、赚钱能力和理财方式' },
      '疾厄宫': { name: '疾厄宫', desc: '健康状况、体质特征和疾病倾向' },
      '迁移宫': { name: '迁移宫', desc: '外出运势、环境适应和人际关系' },
      '奴仆宫': { name: '奴仆宫', desc: '朋友部属、社交能力和人脉关系' },
      '官禄宫': { name: '官禄宫', desc: '事业发展、工作能力和社会地位' },
      '田宅宫': { name: '田宅宫', desc: '不动产、家庭环境和居住状况' },
      '福德宫': { name: '福德宫', desc: '精神享受、兴趣爱好和福报' },
      '父母宫': { name: '父母宫', desc: '父母关系、长辈缘分和学习能力' }
    };
    
    Object.entries(palaces).forEach(([palaceName, palace]) => {
      const palaceInfo = palaceNames[palaceName] || { name: palaceName, desc: '人生重要领域' };
      markdown += `### ${palaceInfo.name} - ${palaceInfo.desc}\n\n`;
      
      if (typeof palace === 'object') {
        // 主星信息
         if (palace.main_stars && palace.main_stars.length > 0) {
           markdown += `**主星配置：**\n`;
           palace.main_stars.forEach(star => {
             if (typeof star === 'object') {
               markdown += `- **${star.name}**`;
               if (star.brightness) {
                 markdown += ` (${star.brightness})`;
               }
               if (star.description) {
                 markdown += `：${star.description}`;
               }
               markdown += `\n`;
             } else {
               markdown += `- ${star}\n`;
             }
           });
           markdown += `\n`;
         }
         
         // 吉星信息
         if (palace.lucky_stars && palace.lucky_stars.length > 0) {
           const luckyStars = Array.isArray(palace.lucky_stars) ? palace.lucky_stars.join('、') : palace.lucky_stars;
           markdown += `**吉星：** ${luckyStars}\n`;
         }
         
         // 煞星信息
         if (palace.unlucky_stars && palace.unlucky_stars.length > 0) {
           const unluckyStars = Array.isArray(palace.unlucky_stars) ? palace.unlucky_stars.join('、') : palace.unlucky_stars;
           markdown += `**煞星：** ${unluckyStars}\n`;
         }
         
         // 宫位强度
         if (palace.strength) {
           markdown += `**宫位强度：** ${palace.strength}\n`;
         }
         
         // 详细分析
         if (palace.analysis || palace.interpretation) {
           markdown += `**详细分析：** ${palace.analysis || palace.interpretation}\n`;
         }
         
         // 发展建议
         if (palace.suggestions) {
           markdown += `**发展建议：** ${palace.suggestions}\n`;
         }
         
         markdown += `\n`; // 宫位之间只保留一个空行
      } else {
        markdown += `${palace}\n\n`;
      }
    });
  }
  
  // 四化飞星分析（紫微斗数专用）
  if (analysisData.ziwei_analysis?.si_hua) {
    markdown += `\n## ✨ 四化飞星\n\n`;
    
    const sihua = analysisData.ziwei_analysis.si_hua;
    
    // 四化概述
    markdown += `四化飞星是紫微斗数的核心理论，由${sihua.year_stem || '年干'}年干所化出。四化分别是化禄（财禄）、化权（权力）、化科（名声）、化忌（阻碍），它们会影响相应星曜的能量表现，是判断吉凶和时机的重要依据。\n\n`;
    
    // 化禄详解
     if (sihua.hua_lu) {
       markdown += `### 💰 化禄 - ${sihua.hua_lu.star || sihua.hua_lu}\n\n`;
       markdown += `**概念：** 化禄是四化之首，主财禄、享受、缘分\n`;
       markdown += `**影响：** 增强星曜的正面能量，带来财运、人缘和享受，代表得到、收获和满足\n`;
       markdown += `**应用：** 化禄星所在宫位通常是您的幸运领域，容易获得成功和满足感\n`;
       markdown += `**时机：** 大限或流年遇化禄，主该时期财运亨通，事业顺利，人际关系和谐\n`;
       
       if (sihua.hua_lu.palace) {
         markdown += `**所在宫位：** ${sihua.hua_lu.palace}\n`;
       }
       if (sihua.hua_lu.analysis) {
         markdown += `**详细分析：** ${sihua.hua_lu.analysis}\n`;
       }
       markdown += `\n`;
     }
     
     // 化权详解
     if (sihua.hua_quan) {
       markdown += `### 👑 化权 - ${sihua.hua_quan.star || sihua.hua_quan}\n\n`;
       markdown += `**概念：** 化权主权力、地位、能力的发挥\n`;
       markdown += `**影响：** 增强星曜的权威性和主导力，带来领导机会、权力地位和成就感\n`;
       markdown += `**应用：** 化权星所在宫位是您容易掌控和发挥影响力的领域\n`;
       markdown += `**时机：** 大限或流年遇化权，主该时期权力增长，地位提升，能力得到认可\n`;
       
       if (sihua.hua_quan.palace) {
         markdown += `**所在宫位：** ${sihua.hua_quan.palace}\n`;
       }
       if (sihua.hua_quan.analysis) {
         markdown += `**详细分析：** ${sihua.hua_quan.analysis}\n`;
       }
       markdown += `\n`;
     }
     
     // 化科详解
     if (sihua.hua_ke) {
       markdown += `### 🌟 化科 - ${sihua.hua_ke.star || sihua.hua_ke}\n\n`;
       markdown += `**概念：** 化科主名声、学业、贵人和文书\n`;
       markdown += `**影响：** 增强星曜的声誉和学习能力，带来名声、考试运和贵人相助\n`;
       markdown += `**应用：** 化科星所在宫位是您容易获得名声和学习成就的领域\n`;
       markdown += `**时机：** 大限或流年遇化科，主该时期名声远播，学业有成，贵人运旺\n`;
       
       if (sihua.hua_ke.palace) {
         markdown += `**所在宫位：** ${sihua.hua_ke.palace}\n`;
       }
       if (sihua.hua_ke.analysis) {
         markdown += `**详细分析：** ${sihua.hua_ke.analysis}\n`;
       }
       markdown += `\n`;
     }
     
     // 化忌详解
     if (sihua.hua_ji) {
       markdown += `### ⚠️ 化忌 - ${sihua.hua_ji.star || sihua.hua_ji}\n\n`;
       markdown += `**概念：** 化忌主阻碍、困扰、执着和变化\n`;
       markdown += `**影响：** 增强星曜的负面特质，带来阻碍、烦恼，但也促使变化和成长\n`;
       markdown += `**应用：** 化忌星所在宫位需要特别注意，容易遇到挫折，但也是成长的机会\n`;
       markdown += `**时机：** 大限或流年遇化忌，主该时期需要谨慎行事，化解阻碍，转危为安\n`;
       
       if (sihua.hua_ji.palace) {
         markdown += `**所在宫位：** ${sihua.hua_ji.palace}\n`;
       }
       if (sihua.hua_ji.analysis) {
         markdown += `**详细分析：** ${sihua.hua_ji.analysis}\n`;
       }
       markdown += `\n`;
     }
    
    // 四化互动分析
    if (sihua.enhanced_sihua?.interaction_analysis) {
      markdown += `### 🔄 四化互动效应\n\n`;
      const interaction = sihua.enhanced_sihua.interaction_analysis;
      
      if (interaction.conflicts && interaction.conflicts.length > 0) {
        markdown += `**四化冲突：**\n`;
        interaction.conflicts.forEach(conflict => {
          markdown += `- **${conflict.type}：** ${conflict.impact}\n`;
        });
        markdown += `\n`;
      }
      
      if (interaction.enhancements && interaction.enhancements.length > 0) {
        markdown += `**四化增强：**\n`;
        interaction.enhancements.forEach(enhancement => {
          markdown += `- **${enhancement.type}：** ${enhancement.impact}\n`;
        });
        markdown += `\n`;
      }
      
      if (interaction.overall_harmony) {
        markdown += `**整体和谐度：** ${interaction.overall_harmony}\n\n`;
      }
      
      if (interaction.recommendations && interaction.recommendations.length > 0) {
        markdown += `**四化建议：**\n`;
        interaction.recommendations.forEach(rec => {
          markdown += `- ${rec}\n`;
        });
        markdown += `\n`;
      }
    }
    
    // 四化综合分析
    if (sihua.analysis || sihua.interpretation) {
      markdown += `### 📊 四化综合分析\n\n`;
      markdown += `${sihua.analysis || sihua.interpretation}\n\n`;
    }
  }
  
  // 14主星详解
  markdown += `\n## ⭐ 14主星详解\n\n`;
  
  markdown += `紫微斗数以14颗主星为核心，每颗主星都有其独特的性格特质和影响力。以下是14主星的详细解析：\n\n`;
  
  const starExplanations = {
    '紫微': {
      nature: '帝星，主尊贵和领导',
      personality: '天生具有领导气质，自尊心强，喜欢被人尊重，有组织能力和统御才华',
      career: '适合管理、政治、大企业经营等需要领导能力的工作',
      fortune: '财运与地位相关，通过权力和地位获得财富，晚年富贵'
    },
    '天机': {
      nature: '智星，主智慧和变化',
      personality: '聪明机智，善于思考和分析，但有时过于多虑和善变',
      career: '适合策划、咨询、教育、科技等需要智慧的工作',
      fortune: '财运变化较大，需要通过智慧和技能获得财富'
    },
    '太阳': {
      nature: '贵星，主光明和博爱',
      personality: '性格开朗，热情大方，喜欢帮助他人，但有时过于直接和冲动',
      career: '适合公关、外交、教育、公益等需要与人接触的工作',
      fortune: '财运与人际关系相关，通过服务他人获得财富'
    },
    '武曲': {
      nature: '财星，主财富和决断',
      personality: '性格刚毅，做事果断，有很强的执行力，但有时过于严厉和固执',
      career: '适合金融、军警、工程、制造等需要执行力的工作',
      fortune: '天生财星，善于理财和投资，财运较佳'
    },
    '天同': {
      nature: '福星，主和谐和享受',
      personality: '性格温和，追求和谐，喜欢享受生活，但有时过于安逸和缺乏进取心',
      career: '适合服务、娱乐、艺术、餐饮等需要亲和力的工作',
      fortune: '财运平稳，通过服务和合作获得财富'
    },
    '廉贞': {
      nature: '囚星，主变化和桃花',
      personality: '性格复杂，善于交际，有艺术天赋，但有时过于情绪化和不稳定',
      career: '适合艺术、娱乐、公关、销售等需要魅力的工作',
      fortune: '财运起伏较大，需要通过人际关系获得财富'
    },
    '天府': {
      nature: '库星，主保守和储藏',
      personality: '性格稳重，善于管理和储蓄，有很强的责任感，但有时过于保守和固执',
      career: '适合管理、财务、银行、房地产等需要稳重的工作',
      fortune: '财运稳定，善于积累和保存财富'
    },
    '太阴': {
      nature: '富星，主柔和和内敛',
      personality: '性格温柔，心思细腻，善于照顾他人，但有时过于敏感和消极',
      career: '适合护理、教育、家政、美容等需要细心的工作',
      fortune: '财运与女性或家庭相关，通过细心服务获得财富'
    },
    '贪狼': {
      nature: '桃花星，主欲望和多才',
      personality: '多才多艺，善于交际，有很强的欲望和野心，但有时过于贪心和不专一',
      career: '适合销售、娱乐、艺术、投资等需要多元能力的工作',
      fortune: '财运变化很大，需要通过多元发展获得财富'
    },
    '巨门': {
      nature: '暗星，主口才和是非',
      personality: '口才出众，善于表达，但有时过于直言和招惹是非',
      career: '适合律师、记者、教师、演说等需要口才的工作',
      fortune: '财运与口才相关，通过言语和沟通获得财富'
    },
    '天相': {
      nature: '印星，主辅助和服务',
      personality: '忠诚可靠，善于辅助他人，有很强的服务精神，但有时过于依赖和缺乏主见',
      career: '适合秘书、助理、服务、协调等需要辅助能力的工作',
      fortune: '财运与服务相关，通过辅助他人获得财富'
    },
    '天梁': {
      nature: '寿星，主正直和长者风范',
      personality: '正直善良，有长者风范，喜欢帮助他人，具有很强的责任感',
      career: '适合教育、公益、医疗、宗教等需要奉献精神的工作',
      fortune: '财运与德行相关，通过正当途径获得财富，晚年富足'
    },
    '七杀': {
      nature: '将星，主冲劲和开拓',
      personality: '冲劲十足，勇于开拓，不怕困难，但有时过于冲动和急躁',
      career: '适合军警、体育、创业、销售等需要冲劲的工作',
      fortune: '财运起伏较大，需要通过努力奋斗获得财富'
    },
    '破军': {
      nature: '耗星，主变化和创新',
      personality: '喜欢变化，勇于创新，不满足现状，但有时过于冲动和破坏性',
      career: '适合创新、改革、艺术、科技等需要突破的工作',
      fortune: '财运变化很大，需要通过创新获得财富，晚年较佳'
    }
  };
  
  Object.entries(starExplanations).forEach(([starName, explanation]) => {
     markdown += `### ${starName}星\n\n`;
     markdown += `**星曜性质：** ${explanation.nature}\n`;
     markdown += `**性格特质：** ${explanation.personality}\n`;
     markdown += `**事业发展：** ${explanation.career}\n`;
     markdown += `**财运特点：** ${explanation.fortune}\n`;
     markdown += `\n`; // 每个主星之间只保留一个空行
   });
  
  // 星曜分析（保留原有逻辑作为补充）
  if (analysisData.star_analysis) {
    markdown += `\n## 🌟 个人星曜配置\n\n`;
    
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
 * 将卦象符号转换为ASCII字符组合
 */
const convertHexagramSymbol = (symbol) => {
  // 卦象符号到ASCII的映射表（竖向排列，从上到下）
  const symbolMap = {
    '䷀': '___\n___\n___\n___\n___\n___', // 乾卦（六阳爻）
    '䷁': '_ _\n_ _\n_ _\n_ _\n_ _\n_ _', // 坤卦（六阴爻）
    '䷂': '_ _\n_ _\n_ _\n___\n_ _\n___', // 屯卦
    '䷃': '___\n_ _\n___\n_ _\n_ _\n_ _', // 蒙卦
    '䷄': '_ _\n_ _\n___\n___\n___\n___', // 需卦
    '䷅': '___\n___\n___\n_ _\n___\n_ _', // 讼卦
    '䷆': '_ _\n_ _\n_ _\n_ _\n___\n_ _', // 师卦
    '䷇': '_ _\n___\n_ _\n_ _\n_ _\n_ _', // 比卦
    '䷈': '___\n___\n___\n_ _\n___\n___', // 小畜卦
    '䷉': '_ _\n___\n___\n___\n___\n___', // 履卦
    '䷊': '_ _\n_ _\n_ _\n___\n___\n___', // 泰卦
    '䷋': '___\n___\n___\n_ _\n_ _\n_ _', // 否卦
    '䷌': '_ _\n_ _\n___\n___\n___\n___', // 同人卦
    '䷍': '___\n___\n___\n___\n_ _\n___', // 大有卦
    '䷎': '_ _\n_ _\n_ _\n___\n_ _\n_ _', // 谦卦
    '䷏': '_ _\n_ _\n___\n_ _\n_ _\n_ _', // 豫卦
    '䷐': '_ _\n_ _\n___\n___\n_ _\n___', // 随卦
    '䷑': '___\n_ _\n___\n___\n_ _\n_ _', // 蛊卦
    '䷒': '_ _\n_ _\n_ _\n_ _\n___\n___', // 临卦
    '䷓': '___\n___\n_ _\n_ _\n_ _\n_ _', // 观卦
    '䷔': '___\n_ _\n___\n_ _\n___\n_ _', // 噬嗑卦
    '䷕': '___\n_ _\n___\n___\n_ _\n___', // 贲卦
    '䷖': '___\n_ _\n_ _\n_ _\n_ _\n_ _', // 剥卦
    '䷗': '_ _\n_ _\n_ _\n_ _\n_ _\n___', // 复卦
    '䷘': '___\n_ _\n_ _\n___\n___\n___', // 无妄卦
    '䷙': '___\n___\n___\n_ _\n_ _\n___', // 大畜卦
    '䷚': '___\n_ _\n_ _\n_ _\n_ _\n___', // 颐卦
    '䷛': '_ _\n___\n___\n___\n___\n_ _', // 大过卦
    '䷜': '_ _\n___\n_ _\n_ _\n___\n_ _', // 坎卦
    '䷝': '___\n_ _\n___\n___\n_ _\n___', // 离卦
    '䷞': '_ _\n_ _\n___\n___\n___\n___', // 咸卦
    '䷟': '___\n___\n___\n___\n_ _\n_ _', // 恒卦
    '䷠': '_ _\n_ _\n___\n___\n___\n___', // 遁卦
    '䷡': '___\n___\n___\n___\n___\n___', // 大壮卦
    '䷢': '___\n___\n___\n___\n_ _\n___', // 晋卦
    '䷣': '___\n_ _\n___\n_ _\n_ _\n_ _', // 明夷卦
    '䷤': '___\n_ _\n___\n_ _\n___\n___', // 家人卦
    '䷥': '___\n_ _\n___\n___\n_ _\n___', // 睽卦
    '䷦': '_ _\n___\n_ _\n_ _\n_ _\n___', // 蹇卦
    '䷧': '___\n_ _\n_ _\n_ _\n___\n_ _', // 解卦
    '䷨': '___\n_ _\n___\n_ _\n_ _\n___', // 损卦
    '䷩': '___\n_ _\n_ _\n___\n_ _\n___', // 益卦
    '䷪': '___\n___\n___\n___\n___\n_ _', // 夬卦
    '䷫': '_ _\n___\n___\n___\n___\n___', // 姤卦
    '䷬': '_ _\n_ _\n_ _\n___\n___\n___', // 萃卦
    '䷭': '_ _\n_ _\n_ _\n___\n___\n___', // 升卦
    '䷮': '_ _\n___\n_ _\n_ _\n_ _\n___', // 困卦
    '䷯': '___\n_ _\n_ _\n_ _\n___\n___', // 井卦
    '䷰': '_ _\n___\n___\n___\n_ _\n___', // 革卦
    '䷱': '___\n_ _\n___\n___\n___\n_ _', // 鼎卦
    '䷲': '_ _\n_ _\n___\n_ _\n_ _\n___', // 震卦
    '䷳': '___\n_ _\n_ _\n___\n_ _\n_ _', // 艮卦
    '䷴': '_ _\n_ _\n___\n___\n_ _\n___', // 渐卦
    '䷵': '___\n_ _\n___\n___\n_ _\n_ _', // 归妹卦
    '䷶': '___\n_ _\n___\n___\n_ _\n___', // 丰卦
    '䷷': '___\n_ _\n___\n_ _\n_ _\n___', // 旅卦
    '䷸': '_ _\n___\n___\n_ _\n___\n___', // 巽卦
    '䷹': '_ _\n___\n___\n_ _\n___\n___', // 兑卦
    '䷺': '_ _\n___\n_ _\n_ _\n___\n___', // 涣卦
    '䷻': '_ _\n___\n___\n_ _\n_ _\n___', // 节卦
    '䷼': '_ _\n___\n___\n_ _\n___\n___', // 中孚卦
    '䷽': '_ _\n_ _\n___\n___\n_ _\n_ _', // 小过卦
    '䷾': '___\n_ _\n___\n_ _\n___\n_ _', // 既济卦
    '䷿': '_ _\n___\n_ _\n___\n_ _\n___' // 未济卦
  };
  
  return symbolMap[symbol] || symbol || '___\n___\n___\n___\n___\n___';
};

/**
 * 生成易经占卜Markdown文档
 */
const generateYijingMarkdown = (analysisData, userName) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  
  let markdown = `# 易经占卜分析报告\n\n`;
  // 从userName中提取实际姓名，去掉"占卜_"前缀
  const actualUserName = userName ? userName.replace(/^占卜_/, '') : '用户';
  markdown += `**占卜者：** ${actualUserName}\n`;
  markdown += `**生成时间：** ${timestamp}\n`;
  markdown += `**分析类型：** 易经占卜\n\n`;
  
  markdown += `---\n\n`;
  
  // 占卜问题 - 适配实际数据结构
  if (analysisData.basic_info?.divination_data) {
    markdown += `## ❓ 占卜问题\n\n`;
    const divination = analysisData.basic_info.divination_data;
    if (divination.question) {
      markdown += `**问题：** ${divination.question}\n\n`;
    }
    if (divination.method) {
      markdown += `**起卦方法：** ${divination.method}\n\n`;
    }
    if (divination.divination_time) {
      const time = new Date(divination.divination_time).toLocaleString('zh-CN');
      markdown += `**占卜时间：** ${time}\n\n`;
    }
    
    // 添加问题分析信息
    if (analysisData.dynamic_guidance?.question_analysis) {
      const questionAnalysis = analysisData.dynamic_guidance.question_analysis;
      if (questionAnalysis.type) {
        markdown += `**问题类型：** ${questionAnalysis.type}\n\n`;
      }
      if (questionAnalysis.focus) {
        markdown += `**关注重点：** ${questionAnalysis.focus}\n\n`;
      }
    }
  }
  
  // 卦象信息 - 适配实际数据结构
  if (analysisData.basic_info?.hexagram_info) {
    markdown += `## 🔮 卦象信息\n\n`;
    const hexInfo = analysisData.basic_info.hexagram_info;
    
    // 主卦信息
      if (hexInfo.main_hexagram) {
        markdown += `### 主卦\n\n`;
        markdown += `**卦名：** ${hexInfo.main_hexagram}\n`;
        if (hexInfo.main_hexagram_symbol) {
          markdown += `**卦象：**\n${convertHexagramSymbol(hexInfo.main_hexagram_symbol)}\n`;
        }
        if (hexInfo.main_hexagram_number) {
          markdown += `**卦序：** 第${hexInfo.main_hexagram_number}卦\n`;
        }
        markdown += `\n`;
      }
      
      // 变卦信息
      if (hexInfo.changing_hexagram && hexInfo.changing_hexagram !== '无') {
        markdown += `### 变卦\n\n`;
        markdown += `**卦名：** ${hexInfo.changing_hexagram}\n`;
        if (hexInfo.changing_hexagram_symbol && hexInfo.changing_hexagram_symbol !== '无') {
          markdown += `**卦象：**\n${convertHexagramSymbol(hexInfo.changing_hexagram_symbol)}\n`;
        }
        markdown += `\n`;
      }
    
    // 八卦结构
    if (hexInfo.hexagram_structure) {
      markdown += `### 八卦结构\n\n`;
      const structure = hexInfo.hexagram_structure;
      if (structure.upper_trigram) {
        markdown += `**上卦：** ${structure.upper_trigram.name} (${structure.upper_trigram.nature})\n`;
      }
      if (structure.lower_trigram) {
        markdown += `**下卦：** ${structure.lower_trigram.name} (${structure.lower_trigram.nature})\n`;
      }
      markdown += `\n`;
    }
    
    // 动爻信息
    if (hexInfo.changing_lines && hexInfo.changing_lines.length > 0) {
      markdown += `### 动爻\n\n`;
      markdown += `**动爻位置：** ${hexInfo.changing_lines.join('、')}爻\n\n`;
    }
  }
  
  // 卦辞分析 - 适配实际数据结构
  if (analysisData.detailed_analysis?.hexagram_analysis) {
    markdown += `## 📜 卦辞分析\n\n`;
    const hexAnalysis = analysisData.detailed_analysis.hexagram_analysis;
    
    if (hexAnalysis.primary_meaning) {
      markdown += `### 卦象含义\n\n`;
      markdown += `${hexAnalysis.primary_meaning}\n\n`;
    }
    
    if (hexAnalysis.judgment) {
      markdown += `### 彖传\n\n`;
      markdown += `> ${hexAnalysis.judgment}\n\n`;
    }
    
    if (hexAnalysis.image) {
      markdown += `### 象传\n\n`;
      markdown += `> ${hexAnalysis.image}\n\n`;
    }
    
    if (hexAnalysis.trigram_analysis) {
      markdown += `### 八卦组合分析\n\n`;
      markdown += `${hexAnalysis.trigram_analysis}\n\n`;
    }
    
    if (hexAnalysis.five_elements) {
      markdown += `### 五行分析\n\n`;
      if (typeof hexAnalysis.five_elements === 'object') {
        Object.entries(hexAnalysis.five_elements).forEach(([key, value]) => {
          markdown += `**${key}：** ${value}\n`;
        });
      } else {
        markdown += `${hexAnalysis.five_elements}\n`;
      }
      markdown += `\n`;
    }
  }
  
  // 动爻分析
  if (analysisData.detailed_analysis?.changing_lines_analysis) {
    markdown += `## 🔄 动爻分析\n\n`;
    const changingAnalysis = analysisData.detailed_analysis.changing_lines_analysis;
    
    if (changingAnalysis.changing_lines_count) {
      markdown += `**动爻数量：** ${changingAnalysis.changing_lines_count}爻\n\n`;
    }
    
    if (typeof changingAnalysis === 'object' && changingAnalysis.analysis) {
      markdown += `${changingAnalysis.analysis}\n\n`;
    } else if (typeof changingAnalysis === 'string') {
      markdown += `${changingAnalysis}\n\n`;
    }
  }
  
  // 变卦分析
  if (analysisData.detailed_analysis?.changing_hexagram_analysis) {
    markdown += `## 🔀 变卦分析\n\n`;
    const changingHexAnalysis = analysisData.detailed_analysis.changing_hexagram_analysis;
    
    if (changingHexAnalysis.meaning) {
      markdown += `### 变卦含义\n\n`;
      markdown += `${changingHexAnalysis.meaning}\n\n`;
    }
    
    if (changingHexAnalysis.transformation_insight) {
      markdown += `### 转化洞察\n\n`;
      markdown += `${changingHexAnalysis.transformation_insight}\n\n`;
    }
    
    if (changingHexAnalysis.guidance) {
      markdown += `### 变化指导\n\n`;
      markdown += `${changingHexAnalysis.guidance}\n\n`;
    }
    
    if (changingHexAnalysis.timing) {
      markdown += `### 时机把握\n\n`;
      markdown += `${changingHexAnalysis.timing}\n\n`;
    }
    
    // 兼容旧格式
    if (typeof changingHexAnalysis === 'object' && changingHexAnalysis.analysis) {
      markdown += `${changingHexAnalysis.analysis}\n\n`;
    } else if (typeof changingHexAnalysis === 'string') {
      markdown += `${changingHexAnalysis}\n\n`;
    }
  }
  
  // 高级分析（互卦、错卦、综卦）
  if (analysisData.detailed_analysis?.advanced_analysis) {
    markdown += `## 🔍 高级分析\n\n`;
    const advanced = analysisData.detailed_analysis.advanced_analysis;
    
    if (advanced.inter_hexagram) {
        markdown += `### 互卦 - ${advanced.inter_hexagram.name}\n\n`;
        markdown += `**卦象：**\n${convertHexagramSymbol(advanced.inter_hexagram.symbol)}\n`;
        markdown += `**含义：** ${advanced.inter_hexagram.meaning}\n`;
        if (advanced.inter_hexagram.analysis) {
          markdown += `**分析：** ${advanced.inter_hexagram.analysis}\n`;
        }
        markdown += `\n`;
      }
      
      if (advanced.opposite_hexagram) {
        markdown += `### 错卦 - ${advanced.opposite_hexagram.name}\n\n`;
        markdown += `**卦象：**\n${convertHexagramSymbol(advanced.opposite_hexagram.symbol)}\n`;
        markdown += `**含义：** ${advanced.opposite_hexagram.meaning}\n`;
        if (advanced.opposite_hexagram.analysis) {
          markdown += `**分析：** ${advanced.opposite_hexagram.analysis}\n`;
        }
        markdown += `\n`;
      }
      
      if (advanced.reverse_hexagram) {
         markdown += `### 综卦 - ${advanced.reverse_hexagram.name}\n\n`;
         markdown += `**卦象：**\n${convertHexagramSymbol(advanced.reverse_hexagram.symbol)}\n`;
         markdown += `**含义：** ${advanced.reverse_hexagram.meaning}\n`;
         if (advanced.reverse_hexagram.analysis) {
           markdown += `**分析：** ${advanced.reverse_hexagram.analysis}\n`;
         }
         markdown += `\n`;
       }
     
     // 四卦综合洞察
     if (advanced.comprehensive_insight) {
       markdown += `### 四卦综合洞察\n\n`;
       markdown += `${advanced.comprehensive_insight}\n\n`;
     }
   }
  
  // 象数分析 - 适配实际数据结构
  if (analysisData.detailed_analysis?.numerology_analysis) {
    markdown += `## 🔢 象数分析\n\n`;
    const numerology = analysisData.detailed_analysis.numerology_analysis;
    
    if (numerology.upper_trigram_analysis || numerology.upper_trigram_number) {
      markdown += `### 上卦数理\n\n`;
      const upper = numerology.upper_trigram_analysis || numerology.upper_trigram_number;
      if (upper.number) {
        markdown += `**数字：** ${upper.number}\n`;
      }
      if (upper.personalized_meaning || upper.meaning) {
        markdown += `**含义：** ${upper.personalized_meaning || upper.meaning}\n`;
      }
      if (upper.environmental_influence || upper.influence) {
        markdown += `**影响：** ${upper.environmental_influence || upper.influence}\n`;
      }
      markdown += `\n`;
    }
    
    if (numerology.lower_trigram_analysis || numerology.lower_trigram_number) {
      markdown += `### 下卦数理\n\n`;
      const lower = numerology.lower_trigram_analysis || numerology.lower_trigram_number;
      if (lower.number) {
        markdown += `**数字：** ${lower.number}\n`;
      }
      if (lower.personalized_meaning || lower.meaning) {
        markdown += `**含义：** ${lower.personalized_meaning || lower.meaning}\n`;
      }
      if (lower.environmental_influence || lower.influence) {
        markdown += `**影响：** ${lower.environmental_influence || lower.influence}\n`;
      }
      markdown += `\n`;
    }
    
    if (numerology.combined_energy) {
       markdown += `### 组合能量\n\n`;
       const combined = numerology.combined_energy;
       if (combined.total_number || combined.total) {
         markdown += `**总数：** ${combined.total_number || combined.total}\n`;
       }
       if (combined.interpretation) {
         markdown += `**解释：** ${combined.interpretation}\n`;
       }
       if (combined.harmony_analysis?.description || combined.harmony) {
         markdown += `**和谐度：** ${combined.harmony_analysis?.description || combined.harmony}\n`;
       }
       markdown += `\n`;
     }
     
     // 时间共振分析
     if (numerology.time_space_resonance || numerology.time_resonance) {
       markdown += `### 时间共振\n\n`;
       const timeResonance = numerology.time_space_resonance || numerology.time_resonance;
       if (timeResonance.number_time_harmony?.level || timeResonance.resonance_number) {
         markdown += `**共振等级：** ${timeResonance.number_time_harmony?.level || timeResonance.resonance_number}\n`;
       }
       if (timeResonance.time_energy?.description || timeResonance.meaning) {
         markdown += `**时间能量：** ${timeResonance.time_energy?.description || timeResonance.meaning}\n`;
       }
       if (timeResonance.optimal_action_time || timeResonance.interpretation) {
         markdown += `**最佳时机：** ${timeResonance.optimal_action_time || timeResonance.interpretation}\n`;
       }
       markdown += `\n`;
     }
   }
   
   // 五行分析 - 详细内容
   if (analysisData.detailed_analysis?.hexagram_analysis?.five_elements) {
     markdown += `## 🧭 五行分析\n\n`;
     const fiveElements = analysisData.detailed_analysis.hexagram_analysis.five_elements;
     
     markdown += `### 五行属性\n\n`;
     if (fiveElements.upper_element) {
       markdown += `**上卦五行：** ${fiveElements.upper_element}\n`;
     }
     if (fiveElements.lower_element) {
       markdown += `**下卦五行：** ${fiveElements.lower_element}\n`;
     }
     markdown += `\n`;
     
     if (fiveElements.relationship) {
       markdown += `### 五行关系\n\n`;
       markdown += `**相互作用：** ${fiveElements.relationship}\n`;
     }
     if (fiveElements.balance) {
       markdown += `**平衡状态：** ${fiveElements.balance}\n`;
     }
     markdown += `\n`;
   }
   
   // 时间分析
   if (analysisData.dynamic_guidance?.time_analysis) {
     markdown += `## ⏰ 时间分析\n\n`;
     const timeAnalysis = analysisData.dynamic_guidance.time_analysis;
     
     if (timeAnalysis.seasonal_energy) {
       markdown += `### 季节能量\n\n`;
       if (timeAnalysis.seasonal_energy.season) {
         markdown += `**当前季节：** ${timeAnalysis.seasonal_energy.season}\n`;
       }
       if (timeAnalysis.seasonal_energy.energy) {
         markdown += `**季节能量：** ${timeAnalysis.seasonal_energy.energy}\n`;
       }
       if (timeAnalysis.seasonal_energy.advice) {
         markdown += `**季节建议：** ${timeAnalysis.seasonal_energy.advice}\n`;
       }
       markdown += `\n`;
     }
     
     if (timeAnalysis.lunar_phase) {
       markdown += `### 月相影响\n\n`;
       if (timeAnalysis.lunar_phase.phase) {
         markdown += `**月相：** ${timeAnalysis.lunar_phase.phase}\n`;
       }
       if (timeAnalysis.lunar_phase.energy) {
         markdown += `**月相能量：** ${timeAnalysis.lunar_phase.energy}\n`;
       }
       if (timeAnalysis.lunar_phase.advice) {
         markdown += `**月相建议：** ${timeAnalysis.lunar_phase.advice}\n`;
       }
       markdown += `\n`;
     }
     
     if (timeAnalysis.energy_state) {
       markdown += `### 能量状态\n\n`;
       if (timeAnalysis.energy_state.overall) {
         markdown += `**整体状态：** ${timeAnalysis.energy_state.overall}\n`;
       }
       if (timeAnalysis.energy_state.recommendation) {
         markdown += `**能量建议：** ${timeAnalysis.energy_state.recommendation}\n`;
       }
       markdown += `\n`;
     }
   }
   
   // 针对性指导
   if (analysisData.dynamic_guidance?.targeted_guidance) {
     markdown += `## 🎯 针对性指导\n\n`;
     markdown += `### 专业分析\n\n`;
     markdown += `${analysisData.dynamic_guidance.targeted_guidance}\n\n`;
   }
  
  // 动态指导 - 整合所有动态指导内容
  if (analysisData.dynamic_guidance) {
    markdown += `## 🎯 动态指导\n\n`;
    const guidance = analysisData.dynamic_guidance;
    
    if (guidance.current_situation_analysis) {
      markdown += `### 当前状况分析\n\n`;
      markdown += `${guidance.current_situation_analysis}\n\n`;
    }
    
    if (guidance.development_trend) {
      markdown += `### 发展趋势\n\n`;
      markdown += `${guidance.development_trend}\n\n`;
    }
    
    if (guidance.practical_advice) {
      markdown += `### 实用建议\n\n`;
      markdown += `${guidance.practical_advice}\n\n`;
    }
    
    if (guidance.timing_guidance) {
      markdown += `### 时机把握\n\n`;
      markdown += `${guidance.timing_guidance}\n\n`;
    }
  }
  
  // 易经智慧
  if (analysisData.divination_wisdom) {
    markdown += `## 🌟 易经智慧\n\n`;
    const wisdom = analysisData.divination_wisdom;
    
    if (wisdom.key_message) {
      markdown += `### 核心信息\n\n`;
      markdown += `${wisdom.key_message}\n\n`;
    }
    
    if (wisdom.action_advice) {
      markdown += `### 行动建议\n\n`;
      markdown += `${wisdom.action_advice}\n\n`;
    }
    
    if (wisdom.timing_guidance) {
      markdown += `### 时机把握\n\n`;
      markdown += `${wisdom.timing_guidance}\n\n`;
    }
  }
  
  // 哲学洞察 - 独立章节
  if (analysisData.divination_wisdom?.philosophical_insight) {
    markdown += `## 📖 哲学洞察\n\n`;
    markdown += `${analysisData.divination_wisdom.philosophical_insight}\n\n`;
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