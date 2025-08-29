import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Borrow } from "../entities/borrow.entity";
import { Book } from "../entities/book.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class BorrowRepository {
  constructor(
    @InjectRepository(Borrow)
    private readonly borrowRepository: Repository<Borrow>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async borrow(userId: number, bookId: number): Promise<Borrow> {
    // Check if book exists
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Check if book is available (not currently borrowed)
    const existingBorrow = await this.borrowRepository.findOne({
      where: {
        bookId,
        returnedAt: IsNull(),
      },
    });

    if (existingBorrow) {
      throw new BadRequestException("Book is already borrowed");
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create borrow record
    const borrow = this.borrowRepository.create({
      userId,
      bookId,
      borrowedAt: new Date(),
    });

    return this.borrowRepository.save(borrow);
  }

  async return(userId: number, bookId: number): Promise<Borrow> {
    // Find the active borrow record
    const borrow = await this.borrowRepository.findOne({
      where: {
        userId,
        bookId,
        returnedAt: IsNull(),
      },
    });

    if (!borrow) {
      throw new NotFoundException(
        "No active borrow record found for this book and user"
      );
    }

    // Update the borrow record with return date
    borrow.returnedAt = new Date();
    return this.borrowRepository.save(borrow);
  }

  async findByUserId(userId: number): Promise<Borrow[]> {
    return this.borrowRepository.find({
      where: { userId },
      order: { borrowedAt: "DESC" },
    });
  }
}
