import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { CreatePurchaseRequestDto } from './dto/request/create-purchase.request.dto';
import { UpdatePurchaseRequestDto } from './dto/request/update-purchase.request.dto';

export interface PurchaseRequestRecord {
  purchase_request_id: string;
  livestock_post_id: string;
  potential_buyer: string;
  requested_quantity: number;
  purchase_status_id: number;
  message: string | null;
}

export interface CreatedSaleRecord {
  sale_id: string;
}

export interface PurchaseUpdateResult {
  purchaseRequest: PurchaseRequestRecord;
  createdSale: CreatedSaleRecord | null;
}

@Injectable()
export class PurchaseRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  // Inserta una nueva solicitud de compra con un mensaje por defecto cuando no se envía.
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

  // Actualiza purchase_request y crea venta aprobada en una transacción atómica.
  async updatePurchaseRequest(
    purchaseRequestId: string,
    dto: UpdatePurchaseRequestDto,
  ): Promise<PurchaseUpdateResult | null> {
    const [purchaseResult, saleResult] = await this.db.transaction(
      [queries.purchase.updatePurchaseRequest, queries.sales.createFromApprovedPurchase],
      [
        [
          dto.purchaseStatusId ?? dto.statusId ?? null,
          dto.requestedQuantity ?? null,
          dto.message ?? null,
          purchaseRequestId,
        ],
        [purchaseRequestId],
      ],
    );

    const purchaseRequest = purchaseResult.rows[0]
      ? (purchaseResult.rows[0] as PurchaseRequestRecord)
      : null;

    if (!purchaseRequest) {
      return null;
    }

    const createdSale = saleResult.rows[0]
      ? (saleResult.rows[0] as CreatedSaleRecord)
      : null;

    return {
      purchaseRequest,
      createdSale,
    };
  }
}
