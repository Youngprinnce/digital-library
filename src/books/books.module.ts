import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksController } from "./controllers/books.controller";
import { BooksService } from "./services/books.service";
import { BorrowService } from "./services/borrow.service";
import { BooksRepository } from "./repositories/books.repository";
import { BorrowRepository } from "./repositories/borrow.repository";
import { IntegrationModule } from "../integration/integration.module";
import { Borrow } from "./entities/borrow.entity";
import { Book } from "./entities/book.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Book, Borrow, User]), IntegrationModule],
  controllers: [BooksController],
  providers: [BooksService, BorrowService, BooksRepository, BorrowRepository],
  exports: [BooksService, BorrowService, BooksRepository, BorrowRepository],
})
export class BooksModule {}
