import { Injectable } from "@nestjs/common";
import axios from "axios";
import {
  ExternalSearchService,
} from "./external-books.interface";

@Injectable()
export class OpenLibraryService implements ExternalSearchService {
  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const offset = (page - 1) * limit;
      const response = await axios.get(`https://openlibrary.org/search.json`, {
        params: {
          q: query,
          limit: limit,
          offset: offset,
        },
        timeout: 5000,
      });

      const books = response.data.docs || [];
      const total = response.data.numFound || 0;

      const mappedBooks = books.map((book) => ({
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        isbn: book.isbn?.[0] || "",
        publishedYear: book.first_publish_year || null,
        externalId: book.key,
      }));

      return {
        data: mappedBooks,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("External search failed:", error);
      return {
        data: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0,
      };
    }
  }
}
