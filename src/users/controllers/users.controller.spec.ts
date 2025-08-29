import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { BorrowService } from "../../books/services/borrow.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserRole, User } from "../entities/user.entity";
import { ExecutionContext } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;
  let borrowService: BorrowService;

  const mockBorrowService = {
    getUserBorrowedBooks: jest.fn(),
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

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = mockUser;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: BorrowService,
          useValue: mockBorrowService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    borrowService = module.get<BorrowService>(BorrowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getBorrowedBooks", () => {
    it("should return user borrowed books successfully", async () => {
      const expectedResult = [
        {
          id: 1,
          userId: mockUser.id,
          bookId: 1,
          borrowedAt: new Date("2023-01-01"),
          returnedAt: null,
          book: {
            id: 1,
            title: "Test Book",
            author: "Test Author",
            description: "Test Description",
            isAvailable: false,
            createdAt: new Date("2023-01-01"),
            updatedAt: new Date("2023-01-01"),
          },
        },
        {
          id: 2,
          userId: mockUser.id,
          bookId: 2,
          borrowedAt: new Date("2023-01-02"),
          returnedAt: null,
          book: {
            id: 2,
            title: "Another Book",
            author: "Another Author",
            description: "Another Description",
            isAvailable: false,
            createdAt: new Date("2023-01-02"),
            updatedAt: new Date("2023-01-02"),
          },
        },
      ];

      mockBorrowService.getUserBorrowedBooks.mockResolvedValue(expectedResult);

      const result = await controller.getBorrowedBooks(mockUser);

      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it("should return empty array when user has no borrowed books", async () => {
      const expectedResult: any[] = [];

      mockBorrowService.getUserBorrowedBooks.mockResolvedValue(expectedResult);

      const result = await controller.getBorrowedBooks(mockUser);

      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual(expectedResult);
      expect(result).toHaveLength(0);
    });

    it("should handle errors when fetching borrowed books", async () => {
      const error = new Error("Database connection failed");
      mockBorrowService.getUserBorrowedBooks.mockRejectedValue(error);

      await expect(controller.getBorrowedBooks(mockUser)).rejects.toThrow(
        error
      );
      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledWith(
        mockUser.id
      );
    });

    it("should handle user not found error", async () => {
      const error = new Error("User not found");
      mockBorrowService.getUserBorrowedBooks.mockRejectedValue(error);

      await expect(controller.getBorrowedBooks(mockUser)).rejects.toThrow(
        error
      );
      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledWith(
        mockUser.id
      );
    });

    it("should call service with correct user id for different users", async () => {
      const anotherUser: User = {
        ...mockUser,
        id: 999,
        email: "another@example.com",
      };

      const expectedResult: any[] = [];
      mockBorrowService.getUserBorrowedBooks.mockResolvedValue(expectedResult);

      await controller.getBorrowedBooks(anotherUser);

      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledWith(999);
      expect(borrowService.getUserBorrowedBooks).toHaveBeenCalledTimes(1);
    });
  });
});
