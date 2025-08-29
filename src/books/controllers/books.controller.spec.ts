import { Test, TestingModule } from "@nestjs/testing";
import { BooksController } from "./books.controller";
import { BooksService } from "../services/books.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateBookDto } from "../dto/create-book.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { BorrowBookDto } from "../dto/borrow-book.dto";
import { UserRole, User } from "../../users/entities/user.entity";
import { ExecutionContext } from "@nestjs/common";

describe("BooksController", () => {
  let controller: BooksController;
  let booksService: BooksService;

  const mockBooksService = {
    findAll: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    borrow: jest.fn(),
    return: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    passwordHash: "hashedpassword",
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    borrows: [],
  };

  const mockAdminUser: User = {
    ...mockUser,
    id: 2,
    email: "admin@example.com",
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated books with default pagination", async () => {
      const paginationDto: any = {};
      const expectedResult = {
        data: [
          {
            id: 1,
            title: "Test Book",
            author: "Test Author",
            description: "Test Description",
            isAvailable: true,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockBooksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(booksService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });

    it("should return paginated books with custom pagination", async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const expectedResult = {
        data: [],
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      mockBooksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(booksService.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("searchBooks", () => {
    it("should search books with query and default pagination", async () => {
      const query = "test book";
      const paginationDto: any = {};
      const expectedResult = {
        data: [
          {
            title: "Test Book",
            author: "Test Author",
            isbn: "123456789",
            publishedYear: 2023,
            externalId: "ext123",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockBooksService.search.mockResolvedValue(expectedResult);

      const result = await controller.searchBooks(query, paginationDto);

      expect(booksService.search).toHaveBeenCalledWith(query, 1, 10);
      expect(result).toEqual(expectedResult);
    });

    it("should search books with custom pagination", async () => {
      const query = "python programming";
      const paginationDto: PaginationDto = { page: 3, limit: 20 };
      const expectedResult = {
        data: [],
        total: 50,
        page: 3,
        limit: 20,
        totalPages: 3,
      };

      mockBooksService.search.mockResolvedValue(expectedResult);

      const result = await controller.searchBooks(query, paginationDto);

      expect(booksService.search).toHaveBeenCalledWith(query, 3, 20);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("create", () => {
    it("should create a new book successfully", async () => {
      const createBookDto: CreateBookDto = {
        title: "New Book",
        author: "New Author",
        isbn: "978-1234567890",
        description: "A new book description",
      };

      const expectedResult = {
        id: 1,
        title: "New Book",
        author: "New Author",
        description: "A new book description",
        isAvailable: true,
        createdAt: new Date(),
      };

      mockBooksService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createBookDto);

      expect(booksService.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(expectedResult);
    });

    it("should handle book creation errors", async () => {
      const createBookDto: CreateBookDto = {
        title: "Duplicate Book",
        author: "Author",
        isbn: "978-1234567890",
      };

      const error = new Error("Book with this ISBN already exists");
      mockBooksService.create.mockRejectedValue(error);

      await expect(controller.create(createBookDto)).rejects.toThrow(error);
      expect(booksService.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe("borrowBook", () => {
    it("should borrow a book successfully", async () => {
      const bookId = 1;
      const expectedBorrowDto: BorrowBookDto = { bookId };
      const expectedResult = {
        id: 1,
        userId: mockUser.id,
        bookId,
        borrowedAt: new Date(),
        returnedAt: null,
      };

      mockBooksService.borrow.mockResolvedValue(expectedResult);

      const result = await controller.borrowBook(bookId, mockUser);

      expect(booksService.borrow).toHaveBeenCalledWith(
        mockUser.id,
        expectedBorrowDto
      );
      expect(result).toEqual(expectedResult);
    });

    it("should handle book not available error", async () => {
      const bookId = 1;
      const expectedBorrowDto: BorrowBookDto = { bookId };
      const error = new Error("Book is not available");

      mockBooksService.borrow.mockRejectedValue(error);

      await expect(controller.borrowBook(bookId, mockUser)).rejects.toThrow(
        error
      );
      expect(booksService.borrow).toHaveBeenCalledWith(
        mockUser.id,
        expectedBorrowDto
      );
    });

    it("should handle book not found error", async () => {
      const bookId = 999;
      const expectedBorrowDto: BorrowBookDto = { bookId };
      const error = new Error("Book not found");

      mockBooksService.borrow.mockRejectedValue(error);

      await expect(controller.borrowBook(bookId, mockUser)).rejects.toThrow(
        error
      );
      expect(booksService.borrow).toHaveBeenCalledWith(
        mockUser.id,
        expectedBorrowDto
      );
    });
  });

  describe("returnBook", () => {
    it("should return a book successfully", async () => {
      const bookId = 1;
      const expectedResult = {
        id: 1,
        userId: mockUser.id,
        bookId,
        borrowedAt: new Date("2023-01-01"),
        returnedAt: new Date(),
      };

      mockBooksService.return.mockResolvedValue(expectedResult);

      const result = await controller.returnBook(bookId, mockUser);

      expect(booksService.return).toHaveBeenCalledWith(mockUser.id, bookId);
      expect(result).toEqual(expectedResult);
    });

    it("should handle book not borrowed error", async () => {
      const bookId = 1;
      const error = new Error("No active borrow found for this book");

      mockBooksService.return.mockRejectedValue(error);

      await expect(controller.returnBook(bookId, mockUser)).rejects.toThrow(
        error
      );
      expect(booksService.return).toHaveBeenCalledWith(mockUser.id, bookId);
    });

    it("should handle book not found error", async () => {
      const bookId = 999;
      const error = new Error("Book not found");

      mockBooksService.return.mockRejectedValue(error);

      await expect(controller.returnBook(bookId, mockUser)).rejects.toThrow(
        error
      );
      expect(booksService.return).toHaveBeenCalledWith(mockUser.id, bookId);
    });
  });
});
