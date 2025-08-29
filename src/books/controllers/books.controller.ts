import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { CreateBookDto } from "../dto/create-book.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { BookResponseDto } from "../dto/book-response.dto";
import { BorrowResponseDto } from "../dto/borrow-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { UserRole, User } from "../../users/entities/user.entity";
import { BorrowBookDto } from "../dto/borrow-book.dto";
import { BooksService } from "../services/books.service";

@ApiTags("Books")
@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({
    summary: "Get all books",
    description: "Retrieve a paginated list of all books in the library",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10, max: 100)",
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    return this.booksService.findAll(page, limit);
  }

  @Get("search")
  @ApiOperation({
    summary: "Search books",
    description: "Search for books using external OpenLibrary API",
  })
  @ApiQuery({
    name: "q",
    required: true,
    type: String,
    description: "Search query",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10, max: 100)",
  })
  async searchBooks(
    @Query("q") query: string,
    @Query() paginationDto: PaginationDto
  ) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    return this.booksService.search(query, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a new book",
    description: "Add a new book to the library (Admin only)",
  })
  @ApiBody({ type: CreateBookDto })
  async create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Post(":id/borrow")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Borrow a book",
    description: "Borrow a book from the library",
  })
  @ApiParam({ name: "id", type: Number, description: "Book ID" })
  async borrowBook(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    const borrowBookDto: BorrowBookDto = { bookId: id };
    return this.booksService.borrow(user.id, borrowBookDto);
  }

  @Post(":id/return")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Return a book",
    description: "Return a borrowed book to the library",
  })
  @ApiParam({ name: "id", type: Number, description: "Book ID" })
  async returnBook(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.booksService.return(user.id, id);
  }
}
