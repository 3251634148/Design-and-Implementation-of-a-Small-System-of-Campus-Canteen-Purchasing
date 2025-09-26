# 校园食堂代买餐系统 - 完整使用指南

## 项目概述

本系统是一个现代化的校园食堂代买餐平台，从原PHP系统完全重构为TypeScript全栈应用。系统采用前后端分离架构，提供用户注册登录、订单管理、服务发布、投诉处理等完整功能。

## 技术架构

### 后端技术栈
- **Node.js + TypeScript** - 服务端运行环境
- **Express.js** - Web框架
- **TypeORM** - 数据库ORM
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcrypt** - 密码加密

### 前端技术栈
- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **React Router** - 路由管理
- **Zustand** - 状态管理

## 系统功能

### 1. 用户认证系统 ✅
- 用户注册（包含学生信息）
- 用户登录/登出
- JWT Token认证
- 密码安全加密
- 用户信息管理

### 2. 订单管理系统 ✅
- 发布代买餐订单
- 浏览所有订单
- 接受订单
- 订单状态管理（待接单、已接单、已完成、已取消）
- 订单搜索和筛选
- 订单统计

### 3. 服务管理系统 ✅
- 发布个人服务
- 服务分类管理
- 服务状态控制
- 服务搜索和筛选

### 4. 投诉处理系统 ✅
- 提交投诉
- 投诉分类
- 管理员处理投诉
- 投诉状态跟踪

### 5. 管理员功能 ✅
- 用户管理（冻结/解冻、删除）
- 系统统计数据
- 投诉处理
- 管理员权限设置
- 系统活动日志

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd campus-canteen-system
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 安装共享类型依赖
cd ../shared
npm install
```

### 3. 数据库配置
```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE campus_canteen_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. 导入数据库结构
mysql -u root -p campus_canteen_system < database/schema.sql

# 3. 配置后端环境变量
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息
```

### 4. 初始化数据库
```bash
cd backend
npm run init-db
```

### 5. 启动服务

#### 开发环境
```bash
# 启动后端服务 (端口 3000)
cd backend
npm run dev

# 启动前端服务 (端口 5173)
cd frontend
npm run dev

# 或者在根目录同时启动前后端
npm run dev
```

#### 生产环境
```bash
# 构建项目
npm run build

# 启动生产服务
npm start
```

## 默认账户

系统初始化后会创建以下默认账户：

### 管理员账户
- **用户名**: admin
- **密码**: admin123
- **权限**: 管理员权限，可以管理用户、处理投诉等

### 测试用户
- **用户名**: testuser
- **密码**: 123456
- **权限**: 普通用户权限

## 系统使用指南

### 普通用户操作流程

#### 1. 注册账户
1. 访问注册页面
2. 填写用户名、密码、校园卡号、真实姓名等信息
3. 选择年级、学院、联系方式等
4. 提交注册

#### 2. 发布订单
1. 登录后进入"订单管理"
2. 点击"发布订单"标签页
3. 填写订单信息：
   - 餐厅名称
   - 餐品描述
   - 餐品费用
   - 小费（可选）
   - 配送地址
   - 订单类别（早餐/午餐/晚餐/零食）
4. 提交订单

#### 3. 接受订单
1. 在"所有订单"中浏览可接受的订单
2. 查看订单详情
3. 点击"接受订单"按钮
4. 完成代买后点击"完成订单"

#### 4. 发布服务
1. 进入"服务管理"页面
2. 点击"发布服务"
3. 填写服务编号、分类、描述
4. 提交服务信息

#### 5. 投诉处理
1. 进入"投诉管理"页面
2. 点击"提交投诉"
3. 填写被投诉人ID、投诉分类、投诉原因
4. 提交投诉等待处理

### 管理员操作流程

#### 1. 用户管理
1. 登录管理员账户
2. 进入"管理后台"
3. 在用户管理中可以：
   - 查看用户详情
   - 冻结/解冻用户
   - 设置/取消管理员权限
   - 删除用户（谨慎操作）

#### 2. 投诉处理
1. 在管理后台查看待处理投诉
2. 点击"处理"按钮
3. 选择处理状态（处理中/已解决/已拒绝）
4. 填写管理员回复
5. 提交处理结果

#### 3. 系统监控
1. 查看系统统计数据
2. 监控用户活动
3. 查看系统日志

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

### 订单相关
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 发布订单
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id` - 更新订单
- `POST /api/orders/:id/accept` - 接受订单
- `POST /api/orders/:id/complete` - 完成订单
- `POST /api/orders/:id/cancel` - 取消订单

### 服务相关
- `GET /api/services` - 获取服务列表
- `POST /api/services` - 发布服务
- `PUT /api/services/:id` - 更新服务
- `DELETE /api/services/:id` - 删除服务

### 投诉相关
- `GET /api/complaints` - 获取投诉列表
- `POST /api/complaints` - 提交投诉
- `PUT /api/complaints/:id` - 处理投诉

### 管理员相关
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/freeze` - 冻结/解冻用户
- `GET /api/admin/dashboard` - 获取仪表板数据

## 数据库结构

### 主要数据表
- `users` - 用户基本信息
- `student_profiles` - 学生详细信息
- `orders` - 订单信息
- `services` - 服务信息
- `complaints` - 投诉信息
- `news` - 新闻信息（保留功能）

## 部署指南

### Docker部署
```bash
# 构建镜像
docker build -t campus-canteen-system .

# 运行容器
docker run -p 3000:3000 -p 5173:5173 campus-canteen-system
```

### 传统部署
1. 配置Nginx反向代理
2. 使用PM2管理Node.js进程
3. 配置SSL证书
4. 设置数据库备份

## 安全特性

- JWT Token认证
- 密码bcrypt加密
- CORS跨域保护
- SQL注入防护
- XSS攻击防护
- 用户权限控制

## 性能优化

- 数据库索引优化
- API响应缓存
- 前端代码分割
- 图片懒加载
- 分页查询

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接配置信息
   - 确认数据库用户权限

2. **前端无法访问后端API**
   - 检查CORS配置
   - 验证API端口是否正确
   - 确认防火墙设置

3. **用户无法登录**
   - 检查用户是否被冻结
   - 验证密码是否正确
   - 确认JWT配置

## 开发指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化代码
- 编写单元测试

### 贡献指南
1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 更新日志

### v1.0.0 (2025-09-16)
- ✅ 完成PHP到TypeScript的完整重构
- ✅ 实现用户认证系统
- ✅ 实现订单管理系统
- ✅ 实现服务管理系统
- ✅ 实现投诉处理系统
- ✅ 实现管理员功能
- ✅ 完成前端UI界面
- ✅ 完成数据库设计和迁移

## 技术支持

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至技术支持
- 查看在线文档

## 许可证

本项目采用MIT许可证，详见LICENSE文件。