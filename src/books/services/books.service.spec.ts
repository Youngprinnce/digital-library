import { Test, TestingModule } from "@nestjs/testing";
import { BooksService } from "./books.service";
import { Book } from "../entities/book.entity";
import { BooksRepository } from "../repositories/books.repository";
import { BorrowService } from "./borrow.service";
import { OpenLibraryService } from "../../integration/external-books/openlibrary.service";

describe("BooksService", () => {
  let service: BooksService;
  let booksRepository: BooksRepository;
  let borrowService: BorrowService;
  let openLibraryService: OpenLibraryService;

  const mockBooksRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockBorrowService = {
    borrowBook: jest.fn(),
    returnBook: jest.fn(),
    getUserBorrowedBooks: jest.fn(),
  };

  const mockOpenLibraryService = {
    search: jest.fn(),
    getBookDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BooksRepository,
          useValue: mockBooksRepository,
        },
        {
          provide: BorrowService,
          useValue: mockBorrowService,
        },
        {
          provide: OpenLibraryService,
          useValue: mockOpenLibraryService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    booksRepository = module.get<BooksRepository>(BooksRepository);
    borrowService = module.get<BorrowService>(BorrowService);
    openLibraryService = module.get<OpenLibraryService>(OpenLibraryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a book", async () => {
    const createBookDto = { title: "Test Book", author: "Test Author" };
    const book = { id: 1, ...createBookDto, isAvailable: true };

    mockBooksRepository.create.mockResolvedValue(book);

    const result = await service.create(createBookDto);
    expect(mockBooksRepository.create).toHaveBeenCalledWith(createBookDto);
    expect(result).toEqual(book);
  });

  it("should find all books with pagination", async () => {
    const books = [
      { id: 1, title: "Book 1", author: "Author 1", isAvailable: true },
      { id: 2, title: "Book 2", author: "Author 2", isAvailable: false },
    ];

    // Mock should return [books, total] tuple to match destructuring
    mockBooksRepository.findAll.mockResolvedValue([books, 2]);

    const result = await service.findAll(1, 10);
    expect(mockBooksRepository.findAll).toHaveBeenCalledWith(1, 10);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("should find a book by id", async () => {
    const book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      isAvailable: true,
    };

    mockBooksRepository.findById.mockResolvedValue(book);

    const result = await service.findOne(1);
    expect(mockBooksRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBeDefined();
  });

  it("should borrow a book", async () => {
    const userId = 1;
    const borrowBookDto = { bookId: 1 };
    const book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      isAvailable: true,
    };
    const borrowRecord = {
      id: 1,
      userId,
      bookId: 1,
      borrowedAt: new Date(),
      returnedAt: null,
    };

    mockBooksRepository.findById.mockResolvedValue(book);
    mockBorrowService.borrowBook.mockResolvedValue(borrowRecord);

    const result = await service.borrow(userId, borrowBookDto);
    expect(mockBorrowService.borrowBook).toHaveBeenCalledWith(
      userId,
      borrowBookDto.bookId
    );
    expect(result).toBeDefined();
  });

  it("should return a book", async () => {
    const userId = 1;
    const bookId = 1;
    const borrowRecord = {
      id: 1,
      userId,
      bookId,
      borrowedAt: new Date(),
      returnedAt: new Date(),
    };

    mockBorrowService.returnBook.mockResolvedValue(borrowRecord);

    const result = await service.return(userId, bookId);
    expect(mockBorrowService.returnBook).toHaveBeenCalledWith(userId, bookId);
    expect(result).toBeDefined();
  });

  it("should get user borrowed books", async () => {
    const userId = 1;
    const borrowedBooks = [
      {
        id: 1,
        userId,
        bookId: 1,
        borrowedAt: new Date(),
        returnedAt: null,
        book: { id: 1, title: "Book 1" },
      },
    ];

    mockBorrowService.getUserBorrowedBooks.mockResolvedValue(borrowedBooks);

    const result = await service.findUserBorrows(userId);
    expect(mockBorrowService.getUserBorrowedBooks).toHaveBeenCalledWith(userId);
    expect(result).toBeDefined();
  });

  it("should search external books", async () => {
    const query = "test query";
    const page = 1;
    const limit = 10;
    const searchResults = {
      data: [
        { title: "External Book 1", author: "External Author 1" },
        { title: "External Book 2", author: "External Author 2" },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockOpenLibraryService.search.mockResolvedValue(searchResults);

    const result = await service.search(query, page, limit);
    expect(mockOpenLibraryService.search).toHaveBeenCalledWith(
      query,
      page,
      limit
    );
    expect(result).toEqual(searchResults);
  });
});
