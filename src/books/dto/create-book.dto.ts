import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBookDto {
  @ApiProperty({
    description: "The title of the book",
    example: "The Great Gatsby",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255, {
    message: "Title must be between 1 and 255 characters",
  })
  title: string;

  @ApiProperty({
    description: "The author of the book",
    example: "F. Scott Fitzgerald",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255, {
    message: "Author must be between 1 and 255 characters",
  })
  author: string;

  @ApiProperty({
    description: "A brief description of the book",
    example: "A classic American novel set in the Jazz Age",
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @Length(0, 1000, {
    message: "Description cannot exceed 1000 characters",
  })
  description?: string;

  @ApiProperty({
    description: "The ISBN of the book",
    example: "978-0-7432-7356-5",
    required: false,
  })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({
    description: "The year the book was published",
    example: 1925,
    required: false,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: "Publication year must be a positive number" })
  @IsOptional()
  publicationYear?: number;
}
