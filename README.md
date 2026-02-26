# 🎯 TJU GO HEALTHY · Uni-App 小程序

面向天津大学同学的健康管理小程序：打卡计划、运动游戏、饮品食谱、校园与社区，一套代码多端运行。🧑‍🎓

## ✨ 亮点功能
- 🏠 首页与导航：聚合推荐入口，快速跳转打卡、社区、校园
- 🔐 登录认证：登录页独立模块，便于后续接入统一认证
- 🗓️ 计划与打卡：任务管理、喝水提醒、断食方案对比
- 🕹️ 运动游戏：深蹲（game_squat）、平衡（game_balance）、拳击（game_boxing），传感器实时反馈
- 🍵 饮品与食谱：热门饮品/食谱列表、收藏、搜索、详情
- 🏫 校园与社区：学校页、社区动态/聊天/排行、发布/私聊
- 🙋 个人中心：账号与安全、方案/收藏/测评、年度/数据小结

## 🛠 技术栈
- Vue 3 + `<script setup>`
- Uni-App（多端：微信/支付宝/百度小程序 + H5 调试）
- Vite + SCSS

## 📁 目录概览
```
src/
├── pages/
│   ├── home/          # 首页（聚合与导航）
│   ├── login/         # 登录页
│   ├── schedule/      # 打卡与推荐 + 运动游戏
│   │   ├── schedule.vue / fasting.vue
│   │   ├── drinks.vue / drinks_detail.vue
│   │   ├── recipes.vue / recipe_detail.vue
│   │   ├── courses.vue / courses_detail.vue
│   │   ├── games.vue / game_squat.vue / game_balance.vue / game_boxing.vue
│   ├── communication/ # 社区、排行、私聊、发布
│   ├── school/        # 校园页
│   └── my/            # 个人中心及子页
├── static/            # tab 图标与功能配图
├── App.vue
├── main.js
├── pages.json         # 路由与 tabBar 配置
└── manifest.json      # 小程序/应用配置
```

## 🚀 快速开始
> 建议 Node.js ≥ 16，使用 npm。

安装依赖：
```bash
npm install
```

本地调试：
```bash
# H5 调试
npm run dev:h5

# 微信小程序预览（需本地微信开发者工具配合）
npm run dev:mp-weixin

```

构建：
```bash
# H5 构建
npm run build:h5

# 微信小程序打包
npm run build:mp-weixin
```

常用脚本（节选）：
- `dev:mp-*` / `build:mp-*`：多端小程序（支付宝、百度、QQ、抖音等）
- `dev:h5:ssr` / `build:h5:ssr`：H5 SSR 模式

## ⚙️ 配置要点
- 页面路由与 tabBar：见 [src/pages.json](src/pages.json)
- 平台与权限：见 [src/manifest.json](src/manifest.json)
- H5 专用 DOM/Canvas 访问已做条件编译（运动波形在 H5 下启用）

## 📌 注意事项
- 静态资源统一放入 [static](static)，避免使用 @/assets 这类 Vite 专属别名路径
- 传感器相关（加速度/陀螺仪）需在对应小程序端授权
- 若二次迁移到 HBuilderX 传统结构，请同步根目录的 [App.vue](App.vue)、[src/pages.json](src/pages.json)、[src/manifest.json](src/manifest.json)、[src/uni.scss](src/uni.scss) 以及 pages/、static/

## 🧭 Roadmap
- [ ] 云端备份与多端同步
- [ ] 分享邀请/社交互动
- [ ] 运动成绩可视化增强
- [ ] AI 运动建议

## 📄 License
MIT

---
Made with 💙 at TJU · Last update: 2026-02-26
