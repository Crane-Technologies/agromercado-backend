import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { CreateLivestockPostDto } from './dto/request/create-livestock-post.dto';
import { SearchLivestockPostsQueryDto } from './dto/request/search-livestock-posts.query.dto';
import { buildLimitOffset } from '../../common/pagination/build-limit-offset.util';

export interface LivestockPostSearchResult {
  livestock_post_id: string;
  livestock_post_name: string;
  posted_by: string;
  posted_by_name: string;
  relevance: number;
}

@Injectable()
export class LivestockPostsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  async searchLivestockPosts(dto: SearchLivestockPostsQueryDto): Promise<{
    items: LivestockPostSearchResult[];
    pagination: { limit: number; offset: number; hasMore: boolean };
  }> {
    const { limit, offset } = buildLimitOffset(dto.limit, dto.offset);

    const params = [
      dto.q,
      dto.minRelevance ?? 0.15,
      limit,
      offset,
      dto.townshipId ?? null,
      dto.stateId ?? null,
      dto.minWeight ?? null,
      dto.maxWeight ?? null,
      dto.minPricePerKg ?? null,
      dto.maxPricePerKg ?? null,
      dto.minPricePerUnit ?? null,
      dto.maxPricePerUnit ?? null,
      dto.livestockTypeId ?? null,
      dto.sectorId ?? null,
      dto.sex ?? null,
    ];

    const result = await this.db.query(
      queries.posts.searchLivestockPosts,
      params,
    );

    const items = result.rows as LivestockPostSearchResult[];

    return {
      items,
      pagination: {
        limit,
        offset,
        hasMore: items.length === limit,
      },
    };
  }

  async createLivestockPost(dto: CreateLivestockPostDto): Promise<string> {
    const params = [
      dto.livestockTypeId,
      dto.livestockPostName,
      dto.postedBy,
      dto.breedId,
      dto.sectorId,
      dto.saleTypeId,
      dto.sex,
      dto.quantity,
      dto.avgWeightKg ?? null,
      dto.pricePerKg ?? null,
      dto.pricePerUnit ?? null,
      dto.townshipId,
      dto.details ?? null,
    ];
    const result = await this.db.query(
      queries.posts.createLivestockPost,
      params,
    );
    return result.rows[0].livestock_post_id;
  }
}
