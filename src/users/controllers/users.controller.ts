import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { BorrowService } from "../../books/services/borrow.service";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "../entities/user.entity";

@ApiTags("User Profile")
@Controller("")
export class UsersController {
  constructor(private borrowService: BorrowService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me/borrowed-books")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get my borrowed books",
    description:
      "Retrieve all books currently borrowed by the authenticated user",
  })
  async getBorrowedBooks(@CurrentUser() user: User) {
    return this.borrowService.getUserBorrowedBooks(user.id);
  }
}
