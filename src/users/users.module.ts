import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./services/users.service";
import { UsersRepository } from "./repositories/users.repository";
import { UsersController } from "./controllers/users.controller";
import { BooksModule } from "../books/books.module";
import { User } from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]), BooksModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
