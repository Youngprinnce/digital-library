import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, EntityManager } from "typeorm";
import { Borrow } from "../entities/borrow.entity";
import { Book } from "../entities/book.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async borrowBook(userId: number, bookId: number): Promise<Borrow> {
    return this.borrowRepository.manager.transaction(
      async (manager: EntityManager) => {
        // Verify user exists
        const user = await manager.findOne(User, {
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException("User not found");
        }

        // Verify book exists
        const book = await manager.findOne(Book, {
          where: { id: bookId },
          relations: ["borrows"],
        });

        if (!book) {
          throw new NotFoundException("Book not found");
        }

        // Check if book is available
        if (!book.isAvailable) {
          throw new ConflictException(
            "Book is already borrowed by someone else"
          );
        }

        // Check if user already has this book borrowed
        const userActiveBorrow = await manager.findOne(Borrow, {
          where: {
            userId,
            bookId,
            returnedAt: IsNull(),
          },
        });

        if (userActiveBorrow) {
          throw new ConflictException("You have already borrowed this book");
        }

        // Mark book as unavailable
        book.isAvailable = false;
        await manager.save(Book, book);

        // Create borrow record
        const borrow = manager.create(Borrow, {
          userId,
          bookId,
          borrowedAt: new Date(),
        });

        return manager.save(Borrow, borrow);
      }
    );
  }

  async returnBook(userId: number, bookId: number): Promise<Borrow> {
    return this.borrowRepository.manager.transaction(
      async (manager: EntityManager) => {
        const borrow = await manager.findOne(Borrow, {
          where: {
            userId,
            bookId,
            returnedAt: IsNull(),
          },
        });

        if (!borrow) {
          throw new NotFoundException("No active borrow found for this book");
        }

        // Mark book as available again
        const book = await manager.findOne(Book, { where: { id: bookId } });
        if (book) {
          book.isAvailable = true;
          await manager.save(Book, book);
        }

        borrow.returnedAt = new Date();
        return manager.save(Borrow, borrow);
      }
    );
  }

  async getUserBorrowedBooks(userId: number): Promise<Borrow[]> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.borrowRepository.find({
      where: {
        userId,
        returnedAt: IsNull(),
      },
      relations: ["book"],
      order: { borrowedAt: "DESC" },
    });
  }
}
