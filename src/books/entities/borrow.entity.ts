import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Book } from "./book.entity";

@Entity("borrows")
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  bookId: number;

  @CreateDateColumn()
  borrowedAt: Date;

  @Column({ type: "datetime", nullable: true })
  returnedAt: Date;

  @ManyToOne(() => User, (user) => user.borrows)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrows)
  @JoinColumn({ name: "bookId" })
  book: Book;
}
