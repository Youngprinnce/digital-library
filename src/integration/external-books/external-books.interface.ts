export interface ExternalBook {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  externalId: string;
}

export interface PaginatedExternalSearchResult {
  data: ExternalBook[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExternalSearchService {
  search(
    query: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedExternalSearchResult>;
}
