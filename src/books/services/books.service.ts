import { Injectable } from "@nestjs/common";
import { CreateBookDto } from "../dto/create-book.dto";
import { BorrowBookDto } from "../dto/borrow-book.dto";
import { plainToClass } from "class-transformer";
import { BookResponseDto } from "../dto/book-response.dto";
import { BorrowResponseDto } from "../dto/borrow-response.dto";
import { BooksRepository } from "../repositories/books.repository";
import { BorrowService } from "./borrow.service";
import { OpenLibraryService } from "../../integration/external-books/openlibrary.service";
import { PaginatedResult } from "../../common/interfaces";

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly borrowService: BorrowService,
    private readonly openLibraryService: OpenLibraryService
  ) {}

  async create(createBookDto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.booksRepository.create(createBookDto);
    return plainToClass(BookResponseDto, book);
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<BookResponseDto>> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) {
      limit = 10;
    }

    const [books, total] = await this.booksRepository.findAll(page, limit);

    // Transform all books at once to avoid N+1 issue
    const transformedBooks = books.map((book) =>
      plainToClass(BookResponseDto, book)
    );

    return {
      data: transformedBooks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<BookResponseDto> {
    const book = await this.booksRepository.findById(id);
    return plainToClass(BookResponseDto, book);
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) {
      limit = 10;
    }

    return this.openLibraryService.search(query, page, limit);
  }

  // Borrow book - orchestrates validation and borrowing
  async borrow(
    userId: number,
    borrowBookDto: BorrowBookDto
  ): Promise<BorrowResponseDto> {
    // Validate that the book exists
    await this.findOne(borrowBookDto.bookId);

    // Create the borrow record
    const borrow = await this.borrowService.borrowBook(
      userId,
      borrowBookDto.bookId
    );

    return plainToClass(BorrowResponseDto, borrow);
  }

  // Return book
  async return(userId: number, bookId: number): Promise<BorrowResponseDto> {
    const borrow = await this.borrowService.returnBook(userId, bookId);
    return plainToClass(BorrowResponseDto, borrow);
  }

  // Get user's borrowed books
  async findUserBorrows(userId: number): Promise<BorrowResponseDto[]> {
    const borrows = await this.borrowService.getUserBorrowedBooks(userId);
    return borrows.map((borrow) => plainToClass(BorrowResponseDto, borrow));
  }
}
