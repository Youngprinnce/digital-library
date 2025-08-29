export class BorrowResponseDto {
  id: number;
  userId: number;
  bookId: number;
  borrowedAt: Date;
  returnedAt?: Date;
}
