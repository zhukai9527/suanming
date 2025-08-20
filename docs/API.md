# API 文档

本文档描述了三算命平台的后端API接口，基于Node.js Express框架实现。

## 基础信息

- **Base URL**: `http://localhost:3001/api` (开发环境)
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8
- **架构特点**: 分析计算与历史记录存储分离

## 通用响应格式

### 分析接口成功响应
```json
{
  "data": {
    "analysis": {
      // 分析结果数据
    }
  }
}
```

### 历史记录存储成功响应
```json
{
  "data": {
    "record_id": "number",
    "message": "历史记录保存成功"
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

**接口地址**: `POST /analysis/bazi`

**功能说明**: 纯分析接口，只返回分析结果，不存储历史记录

**请求参数**:
```json
{
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
    "analysis": {
      "basic_info": {
        "personal_data": {
          "name": "张三",
          "birth_date": "1990-01-01",
          "birth_time": "12:00",
          "gender": "男性"
        },
        "bazi_chart": {
          "year_pillar": { "stem": "庚", "branch": "午" },
          "month_pillar": { "stem": "戊", "branch": "寅" },
          "day_pillar": { "stem": "甲", "branch": "子" },
          "hour_pillar": { "stem": "丙", "branch": "寅" },
          "day_master": "甲",
          "day_master_element": "木"
        }
      },
      "detailed_analysis": {
        "character_analysis": "性格分析内容",
        "career_analysis": "事业分析内容",
        "wealth_analysis": "财运分析内容",
        "health_analysis": "健康分析内容",
        "relationship_analysis": "感情分析内容"
      },
      "analysis_date": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 2. 紫微斗数分析

**接口地址**: `POST /analysis/ziwei`

**功能说明**: 纯分析接口，只返回分析结果，不存储历史记录

**请求参数**:
```json
{
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
    "analysis": {
      "basic_info": {
        "personal_data": {
          "name": "张三",
          "birth_date": "1990-01-01",
          "birth_time": "12:00",
          "gender": "男性"
        },
        "ziwei_chart": {
          "ming_gong": "子",
          "ming_gong_stars": ["紫微", "天机"],
          "twelve_palaces": {
            "命宫": {
              "branch": "子",
              "main_stars": ["紫微", "天机"],
              "interpretation": "命宫解读内容"
            }
            // ... 其他宫位
          },
          "four_transformations": {
            "hua_lu": { "star": "廉贞", "meaning": "财禄亨通" },
            "hua_quan": { "star": "破军", "meaning": "权力地位" },
            "hua_ke": { "star": "武曲", "meaning": "贵人相助" },
            "hua_ji": { "star": "太阳", "meaning": "需要谨慎" }
          }
        }
      },
      "detailed_analysis": {
         "character_analysis": "性格分析内容",
         "career_analysis": "事业分析内容",
         "wealth_analysis": "财运分析内容",
         "health_analysis": "健康分析内容",
         "relationship_analysis": "感情分析内容"
       },
       "analysis_date": "2024-01-01T12:00:00.000Z"
     }
   }
 }
```

### 3. 易经占卜分析

**接口地址**: `POST /analysis/yijing`

**功能说明**: 纯分析接口，只返回分析结果，不存储历史记录

**请求参数**:
```json
{
  "question": "string",
  "user_id": "string",
  "divination_method": "time",
  "user_timezone": "string (可选)",
  "local_time": "string (可选)"
}
```

**时区处理说明**:
- `user_timezone`: 用户时区标识符（如 "Asia/Shanghai", "America/New_York"）
- `local_time`: 用户当地时间的ISO字符串格式
- 优先级：local_time > user_timezone > 服务器时间
- 时间起卦法依赖准确的当地时间，建议前端传递用户时区信息

**响应示例**:
```json
{
  "data": {
    "analysis": {
      "basic_info": {
        "divination_data": {
          "question": "事业发展如何？",
          "method": "梅花易数时间起卦法",
          "divination_time": "2024-01-01T12:00:00.000Z"
        },
        "hexagram_info": {
          "main_hexagram": {
            "name": "乾为天",
            "number": 1,
            "description": "元亨利贞"
          },
          "changing_hexagram": {
            "name": "天风姤",
            "number": 44
          }
        }
      },
      "detailed_analysis": {
        "hexagram_analysis": {
          "judgment": "大吉大利",
          "image": "天行健，君子以自强不息",
          "interpretation": "详细解释内容"
        },
        "changing_lines": [
          {
            "position": "初九",
            "line_text": "潜龙勿用",
            "meaning": "时机未到，需要等待"
          }
        ]
      },
      "dynamic_guidance": {
        "overall_fortune": "整体运势良好",
        "specific_advice": "具体建议内容",
        "timing_analysis": "时机分析"
      },
      "divination_wisdom": {
        "key_message": "核心启示",
        "philosophical_insight": "哲学思考"
      },
      "analysis_date": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 4. 历史记录存储

**接口地址**: `POST /analysis/save-history`

**功能说明**: 专门用于保存分析结果到历史记录

**请求参数**:
```json
{
  "analysis_type": "bazi|ziwei|yijing",
  "analysis_data": {
    // 完整的分析结果数据
  },
  "input_data": {
    // 原始输入数据（可选）
    "name": "string",
    "birth_date": "YYYY-MM-DD",
    "birth_time": "HH:MM",
    "gender": "male|female",
    "question": "string",
    "divination_method": "string"
  }
}
```

**响应示例**:
```json
{
  "data": {
    "record_id": 123,
    "message": "历史记录保存成功"
  }
}
```

### 5. 五行分析

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
// API客户端配置
const API_BASE_URL = 'http://localhost:3001/api'
const authToken = 'your-jwt-token'

// 八字分析示例
async function analyzeBazi(birthData: any) {
  // 第一步：获取分析结果
  const analysisResponse = await fetch(`${API_BASE_URL}/analysis/bazi`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ birth_data: birthData })
  })
  
  if (!analysisResponse.ok) {
    throw new Error('分析失败')
  }
  
  const analysisResult = await analysisResponse.json()
  
  // 第二步：保存历史记录
  try {
    await fetch(`${API_BASE_URL}/analysis/save-history`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analysis_type: 'bazi',
        analysis_data: analysisResult.data.analysis,
        input_data: birthData
      })
    })
  } catch (error) {
    console.warn('历史记录保存失败:', error)
    // 不影响分析结果的返回
  }
  
  return analysisResult
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
# 第一步：八字分析
curl -X POST 'http://localhost:3001/api/analysis/bazi' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "birth_data": {
      "name": "张三",
      "birth_date": "1990-01-01",
      "birth_time": "12:00",
      "gender": "male",
      "birth_place": "北京市"
    }
  }'

# 第二步：保存历史记录
curl -X POST 'http://localhost:3001/api/analysis/save-history' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "analysis_type": "bazi",
    "analysis_data": {
      // 从第一步获取的完整分析结果
    },
    "input_data": {
      "name": "张三",
      "birth_date": "1990-01-01",
      "birth_time": "12:00",
      "gender": "male",
      "birth_place": "北京市"
    }
  }'
```

## 注意事项

1. **架构设计**: 分析计算与历史记录存储完全分离
2. **请求流程**: 先调用分析接口获取结果，再调用存储接口保存历史记录
3. **数据格式**: 所有日期使用ISO 8601格式 (YYYY-MM-DD)
4. **时间格式**: 使用24小时制 (HH:MM)
5. **字符编码**: 所有文本数据使用UTF-8编码
6. **错误处理**: 历史记录保存失败不影响分析结果的获取
7. **请求去重**: 前端实现了API请求去重机制，防止重复调用
8. **时间显示**: 统一使用本地化时间格式显示

## 更新日志

### v2.0.0 (2024-01-19)
- **重大架构重构**: 分离分析计算与历史记录存储
- **新增接口**: `/analysis/save-history` 专门用于保存历史记录
- **接口变更**: 所有分析接口不再返回 `record_id`，只返回分析结果
- **重复记录修复**: 彻底解决了一次分析产生多条历史记录的问题
- **时间显示优化**: 统一使用ISO时间戳和本地化显示
- **前端优化**: 移除React StrictMode，优化组件渲染性能
- **API去重**: 实现了请求去重机制，防止并发重复调用

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持八字命理、紫微斗数、易经占卜三大分析功能
- 完整的用户认证和数据存储功能

---

如有疑问或需要技术支持，请通过GitHub Issues联系我们。