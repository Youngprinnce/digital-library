import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/entities/user.entity";
import { Borrow } from "./books/entities/borrow.entity";
import { Book } from "./books/entities/book.entity";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BooksModule } from "./books/books.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DATABASE_PATH || "./library.db",
      entities: [User, Book, Borrow],
      synchronize: true, // set to false in production; use migrations instead
      logging: process.env.NODE_ENV === "development",
    }),
    AuthModule,
    UsersModule,
    BooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
