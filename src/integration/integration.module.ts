import { Module } from "@nestjs/common";
import { OpenLibraryService } from "./external-books/openlibrary.service";

@Module({
  providers: [OpenLibraryService],
  exports: [OpenLibraryService],
})
export class IntegrationModule {}
