import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UsersRepository } from "../repositories/users.repository";
import { UserRole } from "../entities/user.entity";

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: UsersRepository;

  const mockUsersRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a user", async () => {
    const email = "test@test.com";
    const password = "password123";
    const mockUser = {
      id: 1,
      email: "test@test.com",
      passwordHash: "hashed_password",
      role: "user",
    };

    mockUsersRepository.create.mockResolvedValue(mockUser);

    const result = await service.create(email, password);

    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      email,
      expect.any(String),
      UserRole.USER
    );
    expect(result).toEqual(mockUser);
  });

  it("should create an admin user", async () => {
    const email = "admin@test.com";
    const password = "password123";
    const role = UserRole.ADMIN;
    const mockUser = {
      id: 1,
      email: "admin@test.com",
      passwordHash: "hashed_password",
      role: "admin",
    };

    mockUsersRepository.create.mockResolvedValue(mockUser);

    const result = await service.create(email, password, role);

    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      email,
      expect.any(String),
      UserRole.ADMIN
    );
    expect(result).toEqual(mockUser);
  });

  it("should find a user by email", async () => {
    const email = "test@test.com";
    const mockUser = {
      id: 1,
      email: "test@test.com",
      passwordHash: "hashed_password",
      role: "user",
    };

    mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await service.findByEmail(email);

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(result).toEqual(mockUser);
  });

  it("should return null if user not found by email", async () => {
    const email = "nonexistent@test.com";

    mockUsersRepository.findByEmail.mockResolvedValue(null);

    const result = await service.findByEmail(email);

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(result).toBeNull();
  });

  it("should validate password correctly", async () => {
    const password = "password123";
    const mockUser = {
      id: 1,
      email: "test@test.com",
      passwordHash: "$2b$10$hashedpassword",
      role: UserRole.USER,
    } as any;

    // Mock bcrypt.compare to return true
    jest.spyOn(require("bcrypt"), "compare").mockResolvedValue(true);

    const result = await service.validatePassword(mockUser, password);

    expect(result).toBe(true);
  });

  it("should return false for invalid password", async () => {
    const password = "wrongpassword";
    const mockUser = {
      id: 1,
      email: "test@test.com",
      passwordHash: "$2b$10$hashedpassword",
      role: UserRole.USER,
    } as any;

    // Mock bcrypt.compare to return false
    jest.spyOn(require("bcrypt"), "compare").mockResolvedValue(false);

    const result = await service.validatePassword(mockUser, password);

    expect(result).toBe(false);
  });
});
