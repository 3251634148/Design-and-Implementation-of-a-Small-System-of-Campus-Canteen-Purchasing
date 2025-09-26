-- 校园食堂代买餐系统数据库结构
-- 使用数据库
USE campus_canteen_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '账号',
    password VARCHAR(255) NOT NULL COMMENT '密码哈希',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '是否是管理员',
    is_frozen BOOLEAN DEFAULT FALSE COMMENT '是否是失信用户',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '用户基本信息表';

-- 学生信息表
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_card_id VARCHAR(20) NOT NULL UNIQUE COMMENT '校园卡号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    grade VARCHAR(20) COMMENT '年级',
    institute VARCHAR(100) COMMENT '学院',
    contact_way VARCHAR(50) COMMENT '联系方式',
    email VARCHAR(100) COMMENT '邮箱',
    gender ENUM('male', 'female', 'other') COMMENT '性别',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '学生详细信息表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
    publisher_id INT NOT NULL COMMENT '发布者用户ID',
    accepter_id INT NULL COMMENT '接单者用户ID',
    delivery_address TEXT NOT NULL COMMENT '收货地址',
    tip DECIMAL(10,2) DEFAULT 0 COMMENT '小费',
    meal_cost DECIMAL(10,2) NOT NULL COMMENT '餐品花费',
    status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
    category ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL COMMENT '类别',
    restaurant VARCHAR(100) NOT NULL COMMENT '餐厅',
    meal_description TEXT NOT NULL COMMENT '餐品描述',
    quantity INT DEFAULT 1 COMMENT '数量',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    accepted_at TIMESTAMP NULL COMMENT '接单时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (accepter_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT '代买餐订单表';

-- 服务表
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_number VARCHAR(50) NOT NULL UNIQUE COMMENT '服务编号',
    publisher_id INT NOT NULL COMMENT '发布者用户ID',
    category VARCHAR(50) NOT NULL COMMENT '服务类别',
    description TEXT NOT NULL COMMENT '服务描述',
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active' COMMENT '服务状态',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '服务信息表';

-- 投诉表
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complainant_id INT NOT NULL COMMENT '投诉人用户ID',
    complained_id INT NOT NULL COMMENT '被投诉人用户ID',
    order_id INT NULL COMMENT '相关订单ID',
    category VARCHAR(50) NOT NULL COMMENT '投诉类别',
    reason TEXT NOT NULL COMMENT '投诉原因',
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
    admin_response TEXT NULL COMMENT '管理员处理意见',
    processed_by INT NULL COMMENT '处理管理员ID',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (complainant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (complained_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) COMMENT '投诉信息表';

-- 新闻表
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '新闻标题',
    content TEXT NOT NULL COMMENT '新闻内容',
    author_id INT NULL COMMENT '作者用户ID',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT '新闻信息表';

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_admin ON users(is_admin);
CREATE INDEX idx_users_is_frozen ON users(is_frozen);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_student_card_id ON student_profiles(student_card_id);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_publisher_id ON orders(publisher_id);
CREATE INDEX idx_orders_accepter_id ON orders(accepter_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_category ON orders(category);
CREATE INDEX idx_orders_published_at ON orders(published_at);

CREATE INDEX idx_services_service_number ON services(service_number);
CREATE INDEX idx_services_publisher_id ON services(publisher_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);

CREATE INDEX idx_complaints_complainant_id ON complaints(complainant_id);
CREATE INDEX idx_complaints_complained_id ON complaints(complained_id);
CREATE INDEX idx_complaints_order_id ON complaints(order_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created_at ON news(created_at);