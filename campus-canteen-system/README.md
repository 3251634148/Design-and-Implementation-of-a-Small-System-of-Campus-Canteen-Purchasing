# 校园食堂代买餐系统

基于TypeScript的现代化校园食堂代买餐平台，从PHP系统重构而来。

## 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- TypeORM + MySQL
- JWT认证
- bcrypt密码加密

### 前端
- React + TypeScript
- Vite构建工具
- Ant Design UI组件库
- Zustand状态管理
- React Router路由

## 项目结构

```
campus-canteen-system/
├── backend/          # 后端API服务
├── frontend/         # 前端React应用
├── shared/           # 共享类型定义
├── database/         # 数据库脚本
└── docs/            # 项目文档
```

## 开发指南

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0

### 快速开始

1. 安装依赖
```bash
npm install
```

2. 配置数据库
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE campus_canteen_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 复制环境配置文件
cp backend/.env.example backend/.env
# 编辑数据库配置
```

3. 导入数据库结构
```bash
mysql -u root -p campus_canteen_system < database/schema.sql
```

4. 启动开发服务器
```bash
# 启动后端和前端
npm run dev

# 或者分别启动
npm run dev:backend  # 后端: http://localhost:3000
npm run dev:frontend # 前端: http://localhost:5173
```

### API文档

#### 认证相关API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/change-password` - 修改密码
- `POST /api/auth/refresh-token` - 刷新token
- `POST /api/auth/logout` - 登出

### 项目结构详解

```
campus-canteen-system/
├── backend/                 # Node.js + TypeScript 后端
│   ├── src/
│   │   ├── config/         # 数据库配置
│   │   ├── entities/       # TypeORM实体
│   │   ├── repositories/   # 数据访问层
│   │   ├── services/       # 业务逻辑层
│   │   ├── controllers/    # 控制器层
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   └── app.ts         # 应用入口
│   ├── .env               # 环境配置
│   └── package.json
├── frontend/               # React + TypeScript 前端
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── stores/        # 状态管理
│   │   ├── hooks/         # 自定义hooks
│   │   └── utils/         # 工具函数
│   └── package.json
├── shared/                # 共享类型定义
│   └── src/types/        # TypeScript类型
├── database/              # 数据库脚本
│   └── schema.sql        # 数据库结构
└── package.json          # 根项目配置
```

### 功能特性

- 用户注册和登录（支持管理员和普通用户）
- 用户信息管理
- 代买餐订单发布和接收
- 服务发布和管理
- 投诉处理系统
- 管理员功能（用户管理、投诉处理）
- 失信用户管理

### 管理员账密

- 账号：admin
- 密码：admin123

### 计划
- 并发控制
- 发送短信（通知注册成功，或者用于注册时候的验证码，一个手机号只能绑定一个用户）

