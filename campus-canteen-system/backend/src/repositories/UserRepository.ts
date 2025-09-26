import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { StudentProfile } from "../entities/StudentProfile";

export class UserRepository {
  private userRepo: Repository<User>;
  private profileRepo: Repository<StudentProfile>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    this.profileRepo = AppDataSource.getRepository(StudentProfile);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { username },
      relations: ["profile"],
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { id },
      relations: ["profile"],
    });
  }

  async create(userData: Partial<User>, profileData: Partial<StudentProfile>): Promise<User> {
    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(user);

    if (profileData) {
      const profile = this.profileRepo.create({
        ...profileData,
        user_id: savedUser.id,
      });
      await this.profileRepo.save(profile);
      savedUser.profile = profile;
    }

    return savedUser;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepo.update(id, userData);
    return await this.findById(id);
  }

  async updateProfile(
    userId: number,
    profileData: Partial<StudentProfile>
  ): Promise<StudentProfile | null> {
    await this.profileRepo.update({ user_id: userId }, profileData);
    return await this.profileRepo.findOne({ where: { user_id: userId } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return result.affected !== 0;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepo.findAndCount({
      relations: ["profile"],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
    });

    return { users, total };
  }

  async freezeUser(id: number): Promise<boolean> {
    const result = await this.userRepo.update(id, { is_frozen: true });
    return result.affected !== 0;
  }

  async unfreezeUser(id: number): Promise<boolean> {
    const result = await this.userRepo.update(id, { is_frozen: false });
    return result.affected !== 0;
  }

  async checkStudentCardExists(studentCardId: string, excludeUserId?: number): Promise<boolean> {
    const query = this.profileRepo
      .createQueryBuilder("profile")
      .where("profile.student_card_id = :studentCardId", { studentCardId });

    if (excludeUserId) {
      query.andWhere("profile.user_id != :excludeUserId", { excludeUserId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
