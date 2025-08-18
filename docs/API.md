# API 文档

本文档描述了三算命平台的后端API接口，所有API都基于Supabase Edge Functions实现。

## 基础信息

- **Base URL**: `https://your-project.supabase.co/functions/v1`
- **认证方式**: Bearer Token (Supabase JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "data": {
    "record_id": "uuid",
    "analysis": {
      // 分析结果数据
    }
  }
}
```

### 错误响应
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

## 认证

所有API请求都需要在请求头中包含认证信息：

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## API 接口

### 1. 八字命理分析

**接口地址**: `POST /bazi-analyzer`

**请求参数**:
```json
{
  "user_id": "string",
  "birth_data": {
    "name": "string",
    "birth_date": "YYYY-MM-DD",
    "birth_time": "HH:MM",
    "gender": "male|female",
    "birth_place": "string"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis": {
      "bazi": {
        "year": "甲子",
        "month": "丙寅",
        "day": "戊辰",
        "hour": "庚申"
      },
      "wuxing": {
        "wood": 2,
        "fire": 1,
        "earth": 2,
        "metal": 2,
        "water": 1
      },
      "analysis": {
        "character": "性格分析内容",
        "career": "事业分析内容",
        "wealth": "财运分析内容",
        "health": "健康分析内容",
        "relationships": "感情分析内容"
      }
    }
  }
}
```

### 2. 紫微斗数分析

**接口地址**: `POST /ziwei-analyzer`

**请求参数**:
```json
{
  "user_id": "string",
  "birth_data": {
    "name": "string",
    "birth_date": "YYYY-MM-DD",
    "birth_time": "HH:MM",
    "gender": "male|female",
    "birth_place": "string"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis": {
      "ziwei": {
        "ming_gong": "子",
        "ming_gong_xing": ["紫微", "天机"],
        "shi_er_gong": {
          "命宫": {
            "branch": "子",
            "main_stars": ["紫微", "天机"],
            "interpretation": "命宫解读内容"
          }
          // ... 其他宫位
        },
        "si_hua": {
          "hua_lu": {
            "star": "廉贞",
            "meaning": "财禄亨通，运势顺遂"
          },
          "hua_quan": {
            "star": "破军",
            "meaning": "权力地位，事业有成"
          },
          "hua_ke": {
            "star": "武曲",
            "meaning": "贵人相助，学业有成"
          },
          "hua_ji": {
            "star": "太阳",
            "meaning": "需要谨慎，防范风险"
          }
        }
      },
      "analysis": {
        "character": {
          "overview": "性格概述",
          "personality_traits": "性格特质"
        },
        "career": {
          "suitable_industries": ["行业1", "行业2"],
          "career_advice": "事业建议"
        },
        "wealth": {
          "wealth_pattern": "财富模式"
        },
        "health": {
          "constitution": "体质分析",
          "wellness_advice": "健康建议"
        },
        "relationships": {
          "marriage_fortune": "婚姻运势",
          "spouse_characteristics": "伴侣特质"
        }
      }
    }
  }
}
```

### 3. 易经占卜分析

**接口地址**: `POST /yijing-analyzer`

**请求参数**:
```json
{
  "user_id": "string",
  "divination_data": {
    "question": "string",
    "method": "梅花易数时间起卦法",
    "divination_time": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis": {
      "basic_info": {
        "divination_data": {
          "question": "占卜问题",
          "method": "梅花易数时间起卦法",
          "divination_time": "2024-01-01T12:00:00Z"
        },
        "hexagram_info": {
          "main_hexagram": "乾为天",
          "hexagram_description": "卦辞内容",
          "upper_trigram": "乾",
          "lower_trigram": "乾",
          "detailed_interpretation": "详细解释"
        }
      },
      "detailed_analysis": {
        "hexagram_analysis": {
          "primary_meaning": "主要含义",
          "judgment": "吉凶断语",
          "image": "象辞解释"
        },
        "changing_lines_analysis": {
          "changing_line_position": "六二",
          "line_meaning": "爻辞含义"
        },
        "changing_hexagram": {
          "name": "变卦名称",
          "meaning": "变卦含义",
          "transformation_insight": "变化启示"
        }
      },
      "life_guidance": {
        "overall_fortune": "整体运势",
        "career_guidance": "事业指导",
        "relationship_guidance": "情感指导",
        "wealth_guidance": "财运指导"
      },
      "divination_wisdom": {
        "key_message": "核心信息",
        "action_advice": "行动建议",
        "philosophical_insight": "哲学启示"
      }
    }
  }
}
```

### 4. 五行分析

**接口地址**: `POST /bazi-wuxing-analysis`

**请求参数**:
```json
{
  "user_id": "string",
  "birth_data": {
    "name": "string",
    "birth_date": "YYYY-MM-DD",
    "birth_time": "HH:MM",
    "gender": "male|female"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis": {
      "wuxing_distribution": {
        "wood": 2,
        "fire": 1,
        "earth": 2,
        "metal": 2,
        "water": 1
      },
      "balance_analysis": {
        "dominant_element": "wood",
        "lacking_element": "fire",
        "balance_score": 75
      },
      "recommendations": {
        "colors": ["红色", "橙色"],
        "directions": ["南方"],
        "career_fields": ["文化教育", "艺术创作"],
        "lifestyle_advice": "生活建议内容"
      }
    }
  }
}
```

### 5. 八字详细分析

**接口地址**: `POST /bazi-details`

**请求参数**:
```json
{
  "user_id": "string",
  "birth_data": {
    "name": "string",
    "birth_date": "YYYY-MM-DD",
    "birth_time": "HH:MM",
    "gender": "male|female",
    "birth_place": "string"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": "123e4567-e89b-12d3-a456-426614174000",
    "analysis": {
      "basic_info": {
        "bazi": {
          "year": "甲子",
          "month": "丙寅",
          "day": "戊辰",
          "hour": "庚申"
        },
        "solar_terms": "立春后",
        "lunar_info": {
          "lunar_date": "农历日期",
          "lunar_month": "农历月份"
        }
      },
      "detailed_analysis": {
        "daymaster_analysis": "日主分析",
        "pattern_analysis": "格局分析",
        "useful_god": "用神分析",
        "taboo_god": "忌神分析"
      },
      "life_stages": {
        "childhood": "童年运势",
        "youth": "青年运势",
        "middle_age": "中年运势",
        "old_age": "晚年运势"
      },
      "annual_fortune": [
        {
          "year": 2024,
          "fortune": "年运分析",
          "advice": "建议事项"
        }
      ]
    }
  }
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|---------|------|----------|
| INVALID_JSON | 请求JSON格式错误 | 400 |
| MISSING_PARAMETERS | 缺少必需参数 | 400 |
| INVALID_DATE_FORMAT | 日期格式错误 | 400 |
| INVALID_TIME_FORMAT | 时间格式错误 | 400 |
| UNAUTHORIZED | 未授权访问 | 401 |
| FORBIDDEN | 禁止访问 | 403 |
| ANALYSIS_ERROR | 分析过程错误 | 500 |
| DATABASE_ERROR | 数据库操作错误 | 500 |
| INTERNAL_ERROR | 内部服务器错误 | 500 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// 八字分析示例
async function analyzeBazi(birthData: any) {
  const { data, error } = await supabase.functions.invoke('bazi-analyzer', {
    body: {
      user_id: 'user-uuid',
      birth_data: birthData
    }
  })
  
  if (error) {
    console.error('分析失败:', error)
    return null
  }
  
  return data
}

// 使用示例
const result = await analyzeBazi({
  name: '张三',
  birth_date: '1990-01-01',
  birth_time: '12:00',
  gender: 'male',
  birth_place: '北京市'
})
```

### cURL

```bash
# 八字分析
curl -X POST 'https://your-project.supabase.co/functions/v1/bazi-analyzer' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "user-uuid",
    "birth_data": {
      "name": "张三",
      "birth_date": "1990-01-01",
      "birth_time": "12:00",
      "gender": "male",
      "birth_place": "北京市"
    }
  }'
```

## 注意事项

1. **请求频率限制**: 每个用户每分钟最多50次请求
2. **数据格式**: 所有日期使用ISO 8601格式 (YYYY-MM-DD)
3. **时间格式**: 使用24小时制 (HH:MM)
4. **字符编码**: 所有文本数据使用UTF-8编码
5. **数据安全**: 敏感信息会被加密存储
6. **缓存策略**: 相同参数的分析结果会被缓存24小时

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持八字命理、紫微斗数、易经占卜三大分析功能
- 完整的用户认证和数据存储功能

---

如有疑问或需要技术支持，请通过GitHub Issues联系我们。