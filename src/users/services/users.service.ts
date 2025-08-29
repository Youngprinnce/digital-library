import { Injectable } from "@nestjs/common";
import { User, UserRole } from "../entities/user.entity";
import { UsersRepository } from "../repositories/users.repository";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(
    email: string,
    password: string,
    role: UserRole = UserRole.USER
  ): Promise<User> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return this.usersRepository.create(email, passwordHash, role);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
