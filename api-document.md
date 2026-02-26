# 小程序 API 接口文档

本文档详细描述了小程序应用所需的所有后端接口，包括接口名称、请求方法、请求参数、响应数据及示例，方便开发者直接集成调用。

---

## 目录

1. [用户认证相关接口](#1-用户认证相关接口)  
   - [1.1 用户登录](#11-用户登录)  
   - [1.2 问卷填写](#12-问卷填写)  

2. [首页相关接口](#2-首页相关接口)  
  - [2.1 食物搜索接口](#21-食物搜索接口)  
  - [2.2 食物详情接口](#22-食物详情接口)  
  - [2.3 食物收藏接口](#23-食物收藏接口)
  - [2.4 计划进度查询接口](#24-计划进度查询接口)  
  - [2.5 我的方案查询接口](#25-我的方案查询接口)  
  - [2.6 AI对话接口](#26-ai对话接口)  
  - [2.7 日记列表查询接口](#27-日记列表查询接口)  
  - [2.8 新增/编辑/删除日记接口](#28-新增编辑删除日记接口)  
  - [2.9 体重记录查询接口](#29-体重记录查询接口)  
  - [2.10 新增体重记录接口](#210-新增体重记录接口)  
  - [2.11 修改目标体重接口](#211-修改目标体重接口)  
  - [2.12 今日喝水量查询接口](#212-今日喝水量查询接口)  
  - [2.13 新增喝水记录接口](#213-新增喝水记录接口)  
  - [2.14 修改喝水目标接口](#214-修改喝水目标接口)  
  - [2.15 今日运动记录查询接口](#215-今日运动记录查询接口)  
  - [2.16 新增运动记录接口](#216-新增运动记录接口)  
 
3. [学校相关接口](#3-学校相关接口)  
   - [3.1 学校地图接口](#31-学校地图接口)  
   - [3.2 课程表接口](#32-课程表接口)  
   - [3.3 食堂菜谱推荐接口](#33-食堂菜谱推荐接口)  
   - [3.4 体测数据接口](#34-体测数据接口)  
   - [3.5 服务接口（校医、心理咨询）](#35-服务接口校医心理咨询)  

4. [计划相关接口](#4-计划相关接口)  
   - [4.1 饮食与运动计划接口](#41-饮食与运动计划接口)  
   - [4.2 运动游戏接口](#42-运动游戏接口)  

5. [社区相关接口](#5-社区相关接口)  
   - [5.1 减重方法评分榜接口](#51-减重方法评分榜接口)  
   - [5.2 用户排行榜接口](#52-用户排行榜接口)  
   - [5.3 发布动态接口](#53-发布动态接口)  

6. [我的相关接口](#6-我的相关接口)  
   - [6.1 账号与安全设置接口](#61-账号与安全设置接口)  
   - [6.2 我的收藏接口](#62-我的收藏接口)  
   - [6.3 数据小结接口](#63-数据小结接口)  

---

## 1. 用户认证相关接口

### 1.1 用户登录接口

**接口名称**：学生认证登录
**接口路径**：/api/auth/login
**请求方式**：POST
**请求头**：Content-Type: application/json

| 参数名     | 类型   | 是否必填 | 说明         |
| ---------- | ------ | -------- | ------------ |
| name       | string | 是       | 学生姓名     |
| studentId  | string | 是       | 学号（10位数字） |
| rememberMe | bool   | 否       | 是否记住登录 |

**请求示例**：
```json
{
  "name": "张三",
  "studentId": "2023123456",
  "rememberMe": true
}
```

**返回数据**（成功）：
```json
{
  "code": 0,
  "data": {
    "token": "string",
    "user": {
      "name": "张三",
      "studentId": "2023123456"
    }
  },
  "msg": "认证成功"
}
```

**异常码说明**：
| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 成功         |
| 400    | 参数错误     |
| 401    | 学号或姓名错误|
| 500    | 服务器错误   |

---
### 1.2 问卷填写接口

**接口名称**：健康问卷填写
**接口路径**：/api/questionnaire/submit
**请求方式**：POST
**请求头**：Content-Type: application/json，Authorization: Bearer {token}

| 参数名      | 类型   | 是否必填 | 说明         |
| ----------- | ------ | -------- | ------------ |
| baseInfo    | object | 是       | 基础信息     |
| habitInfo   | object | 是       | 日常习惯     |

**baseInfo 字段说明**：
| 字段        | 类型   | 是否必填 | 说明         |
| ----------- | ------ | -------- | ------------ |
| gender      | string | 是       | 性别         |
| height      | string | 是       | 身高（cm）   |
| weight      | string | 是       | 体重（kg）   |
| bmi         | string | 否       | BMI值        |
| bodyType    | string | 否       | 体型         |
| age         | string | 是       | 年龄         |
| target      | string | 是       | 期望目标     |
| parts       | array  | 是       | 改善部位     |
| targetWeight| string | 是       | 目标体重（kg）|

**habitInfo 字段说明**：
| 字段              | 类型   | 是否必填 | 说明         |
| ----------------- | ------ | -------- | ------------ |
| exerciseFreq      | string | 是       | 每周运动次数 |
| exerciseTypes     | array  | 否       | 运动类型     |
| exerciseDuration  | string | 否       | 单次运动时长 |
| foodAllergies     | array  | 是       | 食物过敏/忌口|
| foodAllergyDetails| object | 否       | 过敏详情     |

**请求示例**：
```json
{
  "baseInfo": {
    "gender": "男",
    "height": "175cm",
    "weight": "70kg",
    "bmi": "22.9",
    "bodyType": "正常",
    "age": "20",
    "target": "减肥",
    "parts": ["腹部", "腿部"],
    "targetWeight": "65kg"
  },
  "habitInfo": {
    "exerciseFreq": "3-4",
    "exerciseTypes": ["low", "medium"],
    "exerciseDuration": "31-60",
    "foodAllergies": ["seafood", "nuts"],
    "foodAllergyDetails": {"seafood": "虾过敏", "nuts": "花生过敏"}
  }
}
```

**返回数据**（成功）：
```json
{
  "code": 0,
  "msg": "问卷提交成功"
}
```

**异常码说明**：
| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 成功         |
| 400    | 参数错误     |
| 401    | 未登录/认证失效 |
| 500    | 服务器错误   |

---
## 2.首页相关接口

### 1. 食物搜索接口

- **接口名称**：食物搜索
- **接口路径**：/api/search
- **请求方式**：GET
- **请求头**：Content-Type: application/json


  | 参数名 | 类型   | 是否必填 | 说明         |
  | ------ | ------ | -------- | ------------ |
  | q      | string | 是       | 搜索关键词   |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
        "calorie": "30千卡/100克",
        "image": "string",
        "collected": false
      }
      // ...更多食物
    ],
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | 200    | 成功         |
  | 400    | 参数错误     |
  | 500    | 服务器错误   |

---
### 2. 食物详情接口

- **接口名称**：食物详情查询
- **接口路径**：/api/food/{id}
- **请求方式**：GET
- **路径参数**：
  | 参数名 | 类型 | 是否必填 | 说明     |
  | ------ | ---- | -------- | -------- |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "effect": "string",
      "feature": "string",
      "nutrition": [
        { "name": "水分", "value": "90g" }
        // ...更多营养成分
      ],
      "relatedRecipes": [
          "id": 101,
          "name": "草莓沙拉",
          "image": "string",
          "collected": false
        }
        // ...更多相关菜品
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 404    | 未找到       |
  | 500    | 服务器错误   |

### 3. 食物收藏接口

- **接口路径**：/api/food/{id}/collect
- **请求方式**：POST
- **请求头**：Content-Type: application/json
- **路径参数**：
  | 参数名 | 类型 | 是否必填 | 说明     |
  | ------ | ---- | -------- | -------- |
  | id     | int  | 是       | 食物ID   |
- **请求体参数**：
  | 参数名   | 类型    | 是否必填 | 说明         |
  | -------- | ------- | -------- | ------------ |
  | collected| boolean | 是       | true收藏，false取消收藏 |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 404    | 未找到       |
  | 500    | 服务器错误   |

### 4. 计划进度查询接口

- **接口名称**：用户计划进度查询
- **接口路径**：/api/plan/progress
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "daysArrived": 5,
      "daysRecorded": 4,
      "daysPersisted": 4,
      "daysRemaining": 24,
      "weightTrend": [450, 520, 380, ...]
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 5. 我的方案查询接口

- **接口名称**：我的饮食/运动方案查询
- **接口路径**：/api/plan/my
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "diet": "string",
      "exercise": "string"
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 6. AI对话接口

- **接口名称**：AI健康对话
- **接口路径**：/api/ai/chat
- **请求方式**：POST
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名        | 类型   | 是否必填 | 说明           |
  | ------------- | ------ | -------- | -------------- |
  | messages      | array  | 是       | 聊天消息数组   |
  | questionnaire | object | 否       | 问卷信息（可选）|
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "reply": "AI回复内容"
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 7. 日记列表查询接口

- **接口名称**：日记列表查询
- **接口路径**：/api/diary/list
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": 123,
        "date": "2026-02-25 10:00",
        "text": "string"
      }
      // ...更多日记
    ],
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 8. 新增/编辑/删除日记接口

- **接口名称**：新增/编辑/删除日记
- **接口路径**：
  - 新增：/api/diary/add （POST）
  - 编辑：/api/diary/{id}/edit （PUT）
  - 删除：/api/diary/{id}/delete （DELETE）
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**（新增/编辑）：
  | 参数名 | 类型   | 是否必填 | 说明     |
  | ------ | ------ | -------- | -------- |
  | text   | string | 是       | 日记内容 |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 404    | 未找到       |
  | 500    | 服务器错误   |

### 9. 体重记录查询接口

- **接口名称**：体重历史记录查询
- **接口路径**：/api/weight/list
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": [
      {
        "date": "2026-02-25",
        "weight": 60.5
      }
      // ...更多记录
    ],
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 10. 新增体重记录接口

- **接口名称**：新增体重记录
- **接口路径**：/api/weight/add
- **请求方式**：POST
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名 | 类型   | 是否必填 | 说明     |
  | ------ | ------ | -------- | -------- |
  | date   | string | 是       | 日期     |
  | weight | number | 是       | 体重(kg) |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 11. 修改目标体重接口

- **接口名称**：修改目标体重
- **接口路径**：/api/weight/target
- **请求方式**：PUT
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名 | 类型   | 是否必填 | 说明         |
  | ------ | ------ | -------- | ------------ |
  | weight | number | 是       | 目标体重(kg) |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---


### 12. 今日喝水量查询接口

- **接口名称**：今日喝水量查询
- **接口路径**：/api/drink/today
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "todayDrank": 1200,
      "drinkGoal": 1800
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 13. 新增喝水记录接口

- **接口名称**：新增喝水记录
- **接口路径**：/api/drink/add
- **请求方式**：POST
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名 | 类型   | 是否必填 | 说明     |
  | ------ | ------ | -------- | -------- |
  | value  | number | 是       | 本次喝水量(ml) |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 14. 修改喝水目标接口

- **接口名称**：修改喝水目标
- **接口路径**：/api/drink/goal
- **请求方式**：PUT
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名 | 类型   | 是否必填 | 说明         |
  | ------ | ------ | -------- | ------------ |
  | goal   | number | 是       | 喝水目标(ml) |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---


### 15. 今日运动记录查询接口

- **接口名称**：今日运动记录查询
- **接口路径**：/api/exercise/today
- **请求方式**：GET
- **请求头**：Authorization: Bearer {token}
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "data": {
      "todayCalorie": 500,
      "exerciseGoal": 500,
      "records": [
        {
          "id": 1,
          "name": "步行",
          "icon": "string",
          "duration": 30,
          "calorie": 63
        }
        // ...更多记录
      ]
    },
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---

### 16. 新增运动记录接口

- **接口名称**：新增运动记录
- **接口路径**：/api/exercise/add
- **请求方式**：POST
- **请求头**：Content-Type: application/json，Authorization: Bearer {token}
- **请求体参数**：
  | 参数名   | 类型   | 是否必填 | 说明         |
  | -------- | ------ | -------- | ------------ |
  | name     | string | 是       | 运动名称     |
  | icon     | string | 否       | 图标         |
  | duration | number | 是       | 时长(分钟)   |
  | calorie  | number | 是       | 消耗卡路里   |
- **返回数据**（成功）：
  ```json
  {
    "code": 0,
    "msg": "success"
  }
  ```
- **异常码说明**：
  | 状态码 | 说明         |
  | ------ | ------------ |
  | 200    | 成功         |
  | 401    | 未登录       |
  | 500    | 服务器错误   |

---
## 3.学校相关接口

## 4.计划相关接口
4.1 饮食与运动计划接口
接口URL：/plan/food
请求方法：GET
接口描述：查询食物饮品的营养成分及卡路里等推荐
请求参数
参数名	类型	必填	描述
name	string	是	食物或饮品名称
响应参数
参数名	类型	描述
code	number	状态码
info	object	食品信息
nutrition	object	营养成分
calories	number	卡路里
响应示例
{
  "code": 200,
  "info": {"name": "苹果", "category": "水果"},
  "nutrition": {"protein": 0.3, "carbs": 14, "fiber": 2.4, "vitaminC": 4.6},
  "calories": 52
}
4.2 运动游戏接口
接口URL：/plan/game
请求方法：GET
接口描述：体感运动游戏接口
请求参数
参数名	类型	必填	描述
gameId	string	是	游戏ID
响应参数
参数名	类型	描述
code	number	状态码
gameInfo	object	游戏详情
score	number	用户成绩
响应示例
{
  "code": 200,
  "gameInfo": {
    "id": "game001",
    "name": "跳舞达人",
    "description": "跟随节奏跳舞",
    "difficulty": "中等"
  },
  "score": 850
}

### 4.3 全局搜索接口

- **接口URL**：`/api/search`
- **请求方法**：GET
- **接口描述**：搜索饮品和食谱

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| q | string | 是 | 搜索关键词 |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "经典绿茶",
      "category": "茶类",
      "type": "drink",
      "emoji": "🍵"
    },
    {
      "id": 2,
      "name": "蛋白质沙拉碗",
      "category": "沙拉",
      "type": "recipe",
      "emoji": "🥗"
    }
  ]
}
```

### 4.4 饮品列表接口

- **接口URL**：`/api/drinks`
- **请求方法**：GET
- **接口描述**：获取饮品列表（支持过滤）

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| type | string | 否 | 过滤类型：all（全部）、recommend（推荐）、low（低卡）、coffee（含咖啡因）、cold（冷饮） |
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认10） |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "经典绿茶",
      "category": "茶类",
      "cal": "0-2 千卡",
      "caffeine": "25-35mg",
      "badge": "推荐",
      "image": "https://...",
      "desc": "富含儿茶素，有助提新陈代谢"
    }
  ]
}
```

### 4.5 食谱列表接口

- **接口URL**：`/api/recipes`
- **请求方法**：GET
- **接口描述**：获取食谱列表

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| type | string | 否 | 过滤类型：all（全部）等 |
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认10） |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "蛋白质沙拉碗",
      "category": "沙拉",
      "cal": "200 千卡",
      "protein": "25g",
      "image": "https://...",
      "desc": "高蛋白低脂肪，适合健身后食用"
    }
  ]
}
```

### 4.6 课程推荐接口

- **接口URL**：`/api/courses`
- **请求方法**：GET
- **接口描述**：获取推荐课程列表

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| level | string | 否 | 难度等级：all（全部）、beginner（入门级）、advanced（进阶级） |
| price | string | 否 | 价格过滤：all（全部）、free（免费）、paid（付费） |
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页数量（默认10） |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "斯坦福大学营养科学基础",
      "platform": "Coursera",
      "instructor": "斯坦福大学",
      "level": "入门级",
      "badge": "推荐",
      "rating": "4.8",
      "students": "50万+",
      "difficulty": "简单",
      "price": "免费",
      "desc": "从基础开始学习营养学原理，适合所有人群",
      "image": "https://..."
    }
  ]
}
```

5. 社区相关接口
5.1 减重方法评分榜接口
接口URL：/community/rank
请求方法：GET
接口描述：获取减重方案、食谱、运动方式等排行榜
请求参数
参数名	类型	必填	描述
category	string	否	排行类别（减重方案、食谱等）
响应参数
参数名	类型	描述
code	number	状态码
ranks	array	排行榜数据
响应示例
{
  "code": 200,
  "ranks": [
    {"rank": 1, "name": "低碳水饮食法", "rating": 4.8, "users": 1520},
    {"rank": 2, "name": "间歇性断食", "rating": 4.6, "users": 1320}
  ]
}
5.2 用户排行榜接口
接口URL：/community/user/rank
请求方法：GET
接口描述：获取用户的运动量与打卡天数排行榜
请求参数
参数名	类型	必填	描述
category	string	是	排行类别
响应参数
参数名	类型	描述
code	number	状态码
ranks	array	排行榜数据
响应示例
{
  "code": 200,
  "ranks": [
    {"rank": 1, "userId": "user001", "nickname": "运动达人", "value": 150, "unit": "公里"},
    {"rank": 2, "userId": "user002", "nickname": "健身小王子", "value": 142, "unit": "公里"}
  ]
}
5.3 发布动态接口
接口URL：/community/post
请求方法：POST
接口描述：用户发布健康动态
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
content	string	是	动态内容
visibility	string	否	可见性设置
images	array	否	图片URL数组
请求示例
{
  "userId": "12345",
  "content": "今天跑步5公里，感觉挺好！",
  "visibility": "公开",
  "images": ["https://example.com/image1.jpg"]
}
响应参数
参数名	类型	描述
code	number	状态码
msg	string	发布成功信息
postId	string	动态ID
响应示例
{
  "code": 200,
  "msg": "发布成功",
  "postId": "post123456"
}
6. 我的相关接口
6.1 账号与安全设置接口
接口URL：/user/settings
请求方法：PUT
接口描述：管理账号信息，包括昵称、头像、密码等
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
nickname	string	否	昵称
avatar	string	否	头像URL
password	string	否	密码
请求示例
{
  "userId": "12345",
  "nickname": "小明",
  "avatar": "https://example.com/avatar.jpg"
}
响应参数
参数名	类型	描述
code	number	状态码
msg	string	更新成功信息
响应示例
{
  "code": 200,
  "msg": "更新成功"
}
6.2 我的收藏接口
接口URL：/user/collection
请求方法：GET
接口描述：获取或修改用户收藏的食谱、食堂等
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
collections	array	收藏项目列表
响应示例
{
  "code": 200,
  "collections": [
    {"id": "col001", "type": "食谱", "name": "低卡沙拉", "createdAt": "2024-01-15"},
    {"id": "col002", "type": "食堂", "name": "第一食堂", "createdAt": "2024-01-10"}
  ]
}
6.3 数据小结接口
接口URL：/user/data_summary
请求方法：GET
接口描述：获取用户健康数据汇总统计
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
summary	object	健康数据小结
响应示例
{
  "code": 200,
  "summary": {
    "totalExerciseDays": 45,
    "totalCaloriesBurned": 15000,
    "averageDailyCalories": 1850,
    "weightChange": -3.5,
    "achievements": ["连续打卡7天", "完成月度目标"]
  }
}
通用状态码说明
状态码	说明
200	请求成功
400	请求参数错误
401	未授权
403	请求被禁止
404	资源不存在
500	服务器内部错误
通用响应结构
所有响应均遵守以下格式：

{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}