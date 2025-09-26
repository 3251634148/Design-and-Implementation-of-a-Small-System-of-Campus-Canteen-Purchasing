import "reflect-metadata";
import { AppDataSource } from "../config/database";

async function createTables() {
  try {
    console.log("🔄 正在连接数据库...");
    await AppDataSource.initialize();
    console.log("✅ 数据库连接成功");

    console.log("🔄 正在创建数据库表...");
    await AppDataSource.synchronize(true); // true表示删除现有表并重新创建
    console.log("✅ 数据库表创建成功");

    console.log("🎉 数据库初始化完成！");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

createTables();
