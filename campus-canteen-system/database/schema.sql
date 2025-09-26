-- 校园食堂代买餐系统数据库结构
-- 从原中文字段名转换为英文字段名

CREATE DATABASE IF NOT EXISTS campus_canteen_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_canteen_system;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '账号',
    password VARCHAR(255) NOT NULL COMMENT '密码哈希',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '是否是管理员',
    is_frozen BOOLEAN DEFAULT FALSE COMMENT '是否是失信用户',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_is_admin (is_admin),
    INDEX idx_is_frozen (is_frozen)
) COMMENT '用户基本信息表';

-- 学生信息表
CREATE TABLE student_profiles (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_student_card_id (student_card_id)
) COMMENT '学生详细信息表';

-- 订单表
CREATE TABLE orders (
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
    FOREIGN KEY (accepter_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_accepter_id (accepter_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at)
) COMMENT '代买餐订单表';

-- 服务表
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_number VARCHAR(50) NOT NULL UNIQUE COMMENT '服务编号',
    publisher_id INT NOT NULL COMMENT '发布者用户ID',
    category VARCHAR(50) NOT NULL COMMENT '服务类别',
    description TEXT NOT NULL COMMENT '服务描述',
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active' COMMENT '服务状态',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_service_number (service_number),
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_category (category),
    INDEX idx_status (status)
) COMMENT '服务信息表';

-- 投诉表
CREATE TABLE complaints (
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
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complainant_id (complainant_id),
    INDEX idx_complained_id (complained_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '投诉信息表';

-- 新闻表（保留原有功能）
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '新闻标题',
    content TEXT NOT NULL COMMENT '新闻内容',
    author_id INT NULL COMMENT '作者用户ID',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '新闻信息表';

-- 插入默认管理员账户（密码：admin123，需要在应用中哈希）
INSERT INTO users (username, password, is_admin) VALUES 
('admin', '$2b$10$placeholder_hash_will_be_replaced', TRUE);

INSERT INTO student_profiles (user_id, student_card_id, name, grade, institute, contact_way, email, gender) VALUES 
(1, 'ADMIN001', '系统管理员', '管理员', '系统管理', '13800138000', 'admin@campus.edu', 'other');