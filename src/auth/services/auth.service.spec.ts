import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../../users/services/users.service";
import { UserRole } from "../../users/entities/user.entity";

describe("AuthService", () => {
  let service: AuthService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should register a user", async () => {
    const registerDto = { email: "test@test.com", password: "password123" };
    const mockUser = { id: 1, email: "test@test.com", role: "user" };
    const mockToken = "jwt.token.here";

    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.create.mockResolvedValue(mockUser);
    mockJwtService.sign.mockReturnValue(mockToken);

    const result = await service.register(registerDto);

    expect(result).toEqual({ access_token: mockToken });
    expect(mockUsersService.create).toHaveBeenCalledWith(
      registerDto.email,
      registerDto.password,
      undefined
    );
  });

  it("should register an admin user", async () => {
    const registerDto = {
      email: "admin@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    };
    const mockUser = { id: 1, email: "admin@test.com", role: "admin" };
    const mockToken = "jwt.token.here";

    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.create.mockResolvedValue(mockUser);
    mockJwtService.sign.mockReturnValue(mockToken);

    const result = await service.register(registerDto);

    expect(result).toEqual({ access_token: mockToken });
    expect(mockUsersService.create).toHaveBeenCalledWith(
      registerDto.email,
      registerDto.password,
      UserRole.ADMIN
    );
  });

  it("should throw ConflictException if user already exists", async () => {
    const registerDto = { email: "existing@test.com", password: "password123" };
    const existingUser = { id: 1, email: "existing@test.com", role: "user" };

    mockUsersService.findByEmail.mockResolvedValue(existingUser);

    await expect(service.register(registerDto)).rejects.toThrow(
      ConflictException
    );
    expect(mockUsersService.create).not.toHaveBeenCalled();
  });

  it("should login a user with valid credentials", async () => {
    const loginDto = { email: "test@test.com", password: "password123" };
    const mockUser = { id: 1, email: "test@test.com", role: "user" };
    const mockToken = "jwt.token.here";

    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockUsersService.validatePassword.mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue(mockToken);

    const result = await service.login(loginDto);

    expect(result).toEqual({ access_token: mockToken });
    expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
      mockUser,
      loginDto.password
    );
  });

  it("should throw UnauthorizedException for invalid credentials", async () => {
    const loginDto = { email: "test@test.com", password: "wrongpassword" };
    const mockUser = { id: 1, email: "test@test.com", role: "user" };

    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockUsersService.validatePassword.mockResolvedValue(false);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException
    );
  });

  it("should throw UnauthorizedException if user not found", async () => {
    const loginDto = { email: "nonexistent@test.com", password: "password123" };

    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException
    );
    expect(mockUsersService.validatePassword).not.toHaveBeenCalled();
  });
});
