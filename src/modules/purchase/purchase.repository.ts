import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { CreatePurchaseRequestDto } from './dto/request/create-purchase.request.dto';

@Injectable()
export class PurchaseRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  async createPurchaseRequest(dto: CreatePurchaseRequestDto): Promise<void> {
    dto.message = dto.message ?? 'Hola, estoy interesado en tu publicación. ';

    const purchaseRequestParams = [
      dto.livestockPostId,
      dto.potentialBuyer,
      dto.requestedQuantity,
      dto.message,
    ];

    await this.db.query(
      queries.purchase.createPurchaseRequest,
      purchaseRequestParams,
    );
  }
}
