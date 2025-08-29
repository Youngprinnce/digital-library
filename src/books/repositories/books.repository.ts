import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "../entities/book.entity";
import { CreateBookDto } from "../dto";

@Injectable()
export class BooksRepository {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async findAll(page: number, limit: number): Promise<[Book[], number]> {
    const skip = (page - 1) * limit;
    return this.bookRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }
}
