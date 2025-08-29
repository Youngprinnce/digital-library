import { IsInt } from "class-validator";

export class BorrowBookDto {
  @IsInt()
  bookId: number;
}
