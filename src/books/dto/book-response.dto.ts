import { Exclude } from "class-transformer";

export class BookResponseDto {
  id: number;
  title: string;
  author: string;
  description?: string;
  available: boolean;
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
