import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../users/entities/user.entity";

export class RegisterDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    format: "email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User password",
    example: "securePassword123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "User role",
    example: "user",
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
