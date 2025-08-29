export interface ExternalSearchService {
  search(
    query: string,
    page?: number,
    limit?: number
  ): Promise<any>;
}
