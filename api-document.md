# 小程序 API 接口文档

本文档详细描述了小程序应用所需的所有后端接口，包括接口名称、请求方法、请求参数、响应数据及示例，方便开发者直接集成调用。

---

## 目录

1. [用户认证相关接口](#1-用户认证相关接口)  
   - [1.1 用户登录](#11-用户登录)  
   - [1.2 问卷填写](#12-问卷填写)  

2. [首页相关接口](#2-首页相关接口)  
   - [2.1 动态卡通形象接口](#21-动态卡通形象接口)  
   - [2.2 AI对话接口](#22-ai对话接口)  
   - [2.3 我的方案接口](#23-我的方案接口)  

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

### 1.1 用户登录

- **接口URL**：`/login`  
- **请求方法**：POST  
- **接口描述**：用户登录接口，验证用户身份并返回token  

#### 请求参数

| 参数名   | 类型   | 必填 | 描述     |
| -------- | ------ | ---- | -------- |
| username | string | 是   | 学号     |
| password | string | 是   | 密码     |

#### 请求示例

```json
{
  "username": "20200123456",
  "password": "123456"
}
响应参数
参数名	类型	描述
code	number	状态码，200表示成功
msg	string	返回信息
token	string	登录成功后返回的token
响应示例
{
  "code": 200,
  "msg": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
1.2 问卷填写
接口URL：/survey
请求方法：POST
接口描述：提交用户问卷信息，保存用户偏好
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
answers	object	是	问卷内容json格式
请求示例
{
  "userId": "12345",
  "answers": {
    "goal": "减脂",
    "weight": 70,
    "height": 175,
    "exerciseFrequency": "每周3次"
  }
}
响应参数
参数名	类型	描述
code	number	状态码
msg	string	返回信息
响应示例
{
  "code": 200,
  "msg": "提交成功"
}
2. 首页相关接口
2.1 动态卡通形象接口
接口URL：/home/avatar
请求方法：GET
接口描述：根据用户体重、运动记录获取动态卡通形象与目标进展
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
avatar	string	卡通头像URL
progress	object	目标进展详情
响应示例
{
  "code": 200,
  "avatar": "https://example.com/avatar/user123.png",
  "progress": {
    "currentWeight": 68,
    "targetWeight": 65,
    "completionRate": 60
  }
}
2.2 AI对话接口
接口URL：/ai/conversation
请求方法：POST
接口描述：支持拍照识别卡路里，语音识别，返回AI回复及推荐食谱
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
type	string	是	数据类型(image/audio/text)
data	string	是	base64编码或者文本内容
请求示例
{
  "userId": "12345",
  "type": "image",
  "data": "base64编码的图片数据"
}
响应参数
参数名	类型	描述
code	number	状态码
reply	string	AI回复内容
calories	number	识别卡路里值
recipe	object	推荐食谱信息
响应示例
{
  "code": 200,
  "reply": "这是一份炒饭，约含500卡路里",
  "calories": 500,
  "recipe": {
    "name": "低卡炒饭",
    "ingredients": ["糙米", "鸡蛋", "蔬菜"]
  }
}
2.3 我的方案接口
接口URL：/plan/my
请求方法：GET
接口描述：获取用户当前减脂或增重方案详情
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
plan	object	方案详情
响应示例
{
  "code": 200,
  "plan": {
    "type": "减脂",
    "dailyCalories": 1800,
    "exercisePlan": "每周5次有氧运动",
    "duration": "3个月"
  }
}
3. 学校相关接口
3.1 学校地图接口
接口URL：/school/map
请求方法：GET
接口描述：获取学校食堂及运动场馆地图信息
请求参数
参数名	类型	必填	描述
schoolId	string	是	学校ID
响应参数
参数名	类型	描述
code	number	状态码
map	object	地图信息
响应示例
{
  "code": 200,
  "map": {
    "canteens": [
      {"id": "1", "name": "第一食堂", "location": {"lat": 39.9, "lng": 116.4}},
      {"id": "2", "name": "第二食堂", "location": {"lat": 39.91, "lng": 116.41}}
    ],
    "gyms": [
      {"id": "1", "name": "体育馆", "location": {"lat": 39.92, "lng": 116.42}}
    ]
  }
}
3.2 课程表接口
接口URL：/school/timetable
请求方法：GET
接口描述：获取学生课程表信息
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
timetable	array	课程表数据
响应示例
{
  "code": 200,
  "timetable": [
    {
      "day": "周一",
      "courses": [
        {"time": "08:00-09:40", "name": "高等数学", "location": "教学楼A101"},
        {"time": "10:00-11:40", "name": "英语", "location": "教学楼B202"}
      ]
    }
  ]
}
3.3 食堂菜谱推荐接口
接口URL：/school/canteen/menu
请求方法：GET
接口描述：根据课程安排和体测情况推荐食堂菜谱
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
schedule	object	否	课程安排信息
响应参数
参数名	类型	描述
code	number	状态码
menu	array	菜谱列表
calories	number	卡路里合计
响应示例
{
  "code":200,
  "menu":[
    {"dishName":"清蒸鱼","calories":200,"canteen":"第一食堂"},
    {"dishName":"蔬菜沙拉","calories":80,"canteen":"第二食堂"}
  ],
  "calories":280
}
3.4 体测数据接口
接口URL：/school/fitness/test
请求方法：GET
接口描述：获取体测数据和制定运动方案
请求参数
参数名	类型	必填	描述
userId	string	是	用户ID
响应参数
参数名	类型	描述
code	number	状态码
testData	object	体测数据
plan	object	运动方案
响应示例
{
  "code": 200,
  "testData": {
    "height": 175,
    "weight": 70,
    "bmi": 22.9,
    "bodyFat": 18,
    "vitalCapacity": 3500
  },
  "plan": {
    "recommendation": "适度有氧运动",
    "exercises": [
      {"type": "跑步", "duration": "30分钟", "frequency": "每周3次"},
      {"type": "游泳", "duration": "45分钟", "frequency": "每周2次"}
    ]
  }
}
3.5 服务接口（校医、心理咨询）
接口URL：/school/service/consultation
请求方法：POST
接口描述：线上校医及心理咨询服务
请求参数
参数名	类型	必填	描述
serviceType	string	是	服务类型（校医/心理咨询）
userId	string	是	用户ID
请求示例
{
  "serviceType": "心理咨询",
  "userId": "12345"
}
响应参数
参数名	类型	描述
code	number	状态码
url	string	服务访问链接
info	string	服务相关信息
响应示例
{
  "code": 200,
  "url": "https://consult.example.com/session/12345",
  "info": "心理咨询服务已开通，点击链接进入"
}
4. 计划相关接口
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