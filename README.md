# 🏫💚 校园健康小程序前端（Uni-App）

基于 `Vue 3 + Uni-App + Vite` 的多端前端项目，当前代码包含登录问卷、健康管理、校园服务、计划任务、社区互动与个人中心等模块。

## 📌 项目概览

- 🧩 前端框架：`Vue 3`
- 🌐 跨端方案：`@dcloudio/uni-app`
- ⚙️ 构建工具：`Vite 5`
- 🎨 样式：`SCSS`
- 📦 主要依赖：`echarts`、`vue-i18n`

入口与配置文件：

- 🚀 `src/main.js`：应用入口（`createSSRApp`）
- 🧠 `src/App.vue`：应用生命周期
- 🗺️ `src/pages.json`：页面路由与 `tabBar`
- 🔧 `src/manifest.json`：平台配置（含微信小程序配置）

## 🧭 功能模块（按页面目录）

### 1) 🔐 登录与问卷

- 👤 `pages/login/login`：学生认证登录（姓名 + 10 位学号 + 记住我）
- 📝 `pages/questionnaire/questionnaire`：基础信息 + 日常习惯问卷（含 BMI/体型计算相关输入）

### 2) 🏠 首页（`pages/home/*`）

- 🔎 首页入口：食物搜索、计划进度、AI 对话、我的方案
- 📊 健康记录：体重、喝水、运动、日记
- 🍽️ 饮食选择：早餐/午餐/晚餐/其他
- 📄 相关页面：`home_search_bar`、`search_bar_detail`、`plan_progress`、`ai_chat` 等

### 3) 🎓 学校（`pages/school/*`）

- 🧭 主入口：地图、课表、体测、校内设施、食堂、其他服务
- 🏪 设施子页：饮水机、打印机、打印店、超市、消费记录
- 🍱 食堂子页：今日吃什么、干饭日记、各园区菜单（留/梅/竹/兰/菊/桃）

### 4) 📅 计划（`pages/schedule/*`）

- ✅ 计划主页：搜索、每日打卡任务（增删改/打卡）、健康小知识
- 🥤 内容页：热门饮品、热门食谱、断食计划、课程推荐
- 🎮 运动游戏：深蹲挑战、平衡保持、拳击训练

### 5) 👥 社区（`pages/communication/*`）

- 📰 社区主页：推荐/关注流、搜索、点赞、收藏、关注、私聊
- 🏆 功能页：减重方法评分榜、用户排行榜、消息、招募、发布、动态详情、私聊
- 💾 数据持久化：`community-store.js` 使用 `uni.setStorageSync` / `uni.getStorageSync`

### 6) 🙋 我的（`pages/my/*`）

- 📂 我的主页：账号、我的方案、收藏、数据小结、使用小结、测评、帮助反馈
- 🗃️ 数据存储：`my-store.js`（用户信息、方案、收藏、反馈、报告等本地存储）

## 📱 TabBar 配置

`src/pages.json` 中已配置 5 个底部标签：

1. 首页 `pages/home/home`
2. 学校 `pages/school/school`
3. 计划 `pages/schedule/schedule`
4. 社区 `pages/communication/communication`
5. 我的 `pages/my/my`

## 🛠️ 本地开发与构建

先安装依赖：

```bash
npm install
```

常用命令（来自 `package.json`）：

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin
```

✨ 此外还提供支付宝、百度、QQ、抖音、快手、小红书、快应用等平台的 `dev:*` / `build:*` 脚本。

## 🔌 接口与数据说明

- 📘 后端接口说明文档：`api-document.md`
- 🔁 当前代码中既有本地存储驱动的数据流，也有接口请求：
  - 🧪 部分页面请求本地接口（如 `http://127.0.0.1:3000/api/search`）
  - 🤖 `ai_chat.vue` 使用第三方 AI 接口请求

💡 建议联调时统一管理接口 `baseURL` 与鉴权信息，避免在页面内分散配置。

## 🗂️ 项目结构（精简）

```text
.
├─ api-document.md
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ App.vue
│  ├─ main.js
│  ├─ manifest.json
│  ├─ pages.json
│  ├─ static/
│  └─ pages/
│     ├─ login/
│     ├─ questionnaire/
│     ├─ home/
│     ├─ school/
│     ├─ schedule/
│     ├─ communication/
│     └─ my/
└─ unpackage/
```

## 📎 说明

本 README 根据当前仓库实际文件结构与配置整理（日期：2026-02-26）。✨
