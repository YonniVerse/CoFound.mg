import { Controller, Get, Query, Inject } from '@nestjs/common'
import { SearchService } from './search.service.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { searchQuerySchema, type SearchResponse } from '@cofound/shared'

@Controller('search')
export class SearchController {
  constructor(@Inject(SearchService) private readonly searchService: SearchService) {}

  @RequirePermissions(Permission.PROJECT_READ)
  @Get()
  async search(@Query() queryParams: Record<string, unknown>): Promise<SearchResponse> {
    const parsedQuery = searchQuerySchema.parse(queryParams)
    return this.searchService.search(parsedQuery)
  }
}
