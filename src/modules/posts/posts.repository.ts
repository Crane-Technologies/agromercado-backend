import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { CreateLivestockPostDto } from './dto/request/create-livestock-post.dto';

@Injectable()
export class LivestockPostsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

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
