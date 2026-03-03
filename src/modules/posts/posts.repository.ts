import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { CreateLivestockPostDto } from './dto/request/create-livestock-post.dto';
import { UpdateLivestockPostDto } from './dto/request/update-livestock-post.dto';
import { SearchLivestockPostsQueryDto } from './dto/request/search-livestock-posts.query.dto';
import { GetAllPostsQueryDto } from './dto/request/get-all-posts.query.dto';
import { buildLimitOffset } from '../../common/pagination/build-limit-offset.util';

export interface LivestockPost {
  livestock_post_id: string;
  livestock_type_id: number;
  livestock_post_name: string;
  posted_by: string;
  breed_id: number;
  sector_id: number;
  sale_type_id: number;
  sex: string;
  quantity: number;
  avg_weight_kg: number | null;
  price_per_kg: number | null;
  price_per_unit: number | null;
  township_id: number;
  details: string | null;
  created_at: Date;
  updated_at: Date;
}

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
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    const { limit, offset } = buildLimitOffset(dto.limit, dto.offset);
    const result = await this.db.query(queries.posts.searchLivestockPosts, [
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
    ]);

    const total =
      result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const items = result.rows.map((row) => {
      const { ...item } = row;
      return item;
    });

    return {
      items,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
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

  async getAll(dto: GetAllPostsQueryDto): Promise<{
    items: LivestockPost[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const { limit, offset } = buildLimitOffset(dto.limit, dto.offset);

    const [dataResult, countResult] = await Promise.all([
      this.db.query(queries.posts.getAll, [limit, offset]),
      this.db.query(queries.posts.countAll, []),
    ]);

    const items = dataResult.rows as LivestockPost[];
    const total: number = countResult.rows[0].total;

    return {
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    };
  }

  async getById(id: string): Promise<LivestockPost | null> {
    const result = await this.db.query(queries.posts.getById, [id]);
    return (result.rows[0] as LivestockPost) ?? null;
  }

  async update(
    id: string,
    dto: UpdateLivestockPostDto,
  ): Promise<LivestockPost | null> {
    const params = [
      dto.livestockTypeId ?? null,
      dto.livestockPostName ?? null,
      dto.breedId ?? null,
      dto.sectorId ?? null,
      dto.saleTypeId ?? null,
      dto.sex ?? null,
      dto.quantity ?? null,
      dto.avgWeightKg ?? null,
      dto.pricePerKg ?? null,
      dto.pricePerUnit ?? null,
      dto.townshipId ?? null,
      dto.details ?? null,
      id,
    ];
    const result = await this.db.query(queries.posts.update, params);
    return (result.rows[0] as LivestockPost) ?? null;
  }

  async remove(id: string): Promise<LivestockPost | null> {
    const result = await this.db.query(queries.posts.delete, [id]);
    return (result.rows[0] as LivestockPost) ?? null;
  }
}
