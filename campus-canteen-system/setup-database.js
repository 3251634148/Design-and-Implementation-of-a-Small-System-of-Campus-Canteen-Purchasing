const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./backend/.env" });

async function setupDatabase() {
  console.log("🔄 开始设置数据库...");

  try {
    // 连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("✅ 连接到MySQL服务器成功");

    // 创建数据库（如果不存在）
    const dbName = process.env.DB_DATABASE || "campus_canteen_system";
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ 数据库 ${dbName} 创建成功`);

    // 选择数据库
    await connection.execute(`USE \`${dbName}\``);

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
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
      ) COMMENT '用户基本信息表'
    `);
    console.log("✅ 用户表创建成功");

    // 创建学生信息表
    await connection.execute(`
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_student_card_id (student_card_id)
      ) COMMENT '学生详细信息表'
    `);
    console.log("✅ 学生信息表创建成功");

    // 创建订单表
    await connection.execute(`
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
        FOREIGN KEY (accepter_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_order_number (order_number),
        INDEX idx_publisher_id (publisher_id),
        INDEX idx_accepter_id (accepter_id),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_published_at (published_at)
      ) COMMENT '代买餐订单表'
    `);
    console.log("✅ 订单表创建成功");

    // 创建服务表
    await connection.execute(`
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
        FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_service_number (service_number),
        INDEX idx_publisher_id (publisher_id),
        INDEX idx_category (category),
        INDEX idx_status (status)
      ) COMMENT '服务信息表'
    `);
    console.log("✅ 服务表创建成功");

    // 创建投诉表
    await connection.execute(`
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
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_complainant_id (complainant_id),
        INDEX idx_complained_id (complained_id),
        INDEX idx_order_id (order_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) COMMENT '投诉信息表'
    `);
    console.log("✅ 投诉表创建成功");

    // 创建新闻表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news (
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
      ) COMMENT '新闻信息表'
    `);
    console.log("✅ 新闻表创建成功");

    await connection.end();
    console.log("🎉 数据库设置完成！");
    console.log("\n现在可以启动后端服务了：");
    console.log("cd backend && npm run dev");
  } catch (error) {
    console.error("❌ 数据库设置失败:", error.message);
    process.exit(1);
  }
}

setupDatabase();
