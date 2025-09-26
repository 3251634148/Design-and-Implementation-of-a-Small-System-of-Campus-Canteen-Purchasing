import "reflect-metadata";
import { AppDataSource } from "../config/database";
import bcrypt from "bcrypt";
import { User } from "../entities/User";
import { StudentProfile } from "../entities/StudentProfile";

async function initializeDatabase() {
  try {
    console.log("🔄 正在初始化数据库连接...");
    await AppDataSource.initialize();
    console.log("✅ 数据库连接成功");

    // 检查数据库表是否存在
    console.log("🔄 正在检查数据库表...");
    const queryRunner = AppDataSource.createQueryRunner();
    const hasUsersTable = await queryRunner.hasTable("users");
    await queryRunner.release();

    if (!hasUsersTable) {
      console.log("⚠️  数据库表不存在，请先运行 database/schema.sql 创建表结构");
      return;
    }
    console.log("✅ 数据库表检查完成");

    // 检查是否已存在管理员账户
    const userRepository = AppDataSource.getRepository(User);
    const profileRepository = AppDataSource.getRepository(StudentProfile);

    const existingAdmin = await userRepository.findOne({
      where: { username: "admin" },
    });

    if (!existingAdmin) {
      console.log("🔄 正在创建默认管理员账户...");

      // 创建管理员用户
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = userRepository.create({
        username: "admin",
        password: hashedPassword,
        is_admin: true,
        is_frozen: false,
      });

      const savedAdmin = await userRepository.save(adminUser);

      // 创建管理员资料
      const adminProfile = profileRepository.create({
        user_id: savedAdmin.id,
        student_card_id: "ADMIN001",
        name: "系统管理员",
        grade: "管理员",
        institute: "系统管理",
        contact_way: "13800138000",
        email: "admin@campus.edu",
        gender: "other" as any,
      });

      await profileRepository.save(adminProfile);
      console.log("✅ 默认管理员账户创建成功");
      console.log("   用户名: admin");
      console.log("   密码: admin123");
    } else {
      console.log("ℹ️  管理员账户已存在");
    }

    // 创建测试用户
    const existingTestUser = await userRepository.findOne({
      where: { username: "testuser" },
    });

    if (!existingTestUser) {
      console.log("🔄 正在创建测试用户账户...");

      const hashedPassword = await bcrypt.hash("123456", 10);
      const testUser = userRepository.create({
        username: "testuser",
        password: hashedPassword,
        is_admin: false,
        is_frozen: false,
      });

      const savedTestUser = await userRepository.save(testUser);

      const testProfile = profileRepository.create({
        user_id: savedTestUser.id,
        student_card_id: "2024001",
        name: "测试用户",
        grade: "大三",
        institute: "计算机学院",
        contact_way: "13900139000",
        email: "test@example.com",
        gender: "male" as any,
      });

      await profileRepository.save(testProfile);
      console.log("✅ 测试用户账户创建成功");
      console.log("   用户名: testuser");
      console.log("   密码: 123456");
    } else {
      console.log("ℹ️  测试用户账户已存在");
    }

    console.log("🎉 数据库初始化完成！");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

initializeDatabase();
