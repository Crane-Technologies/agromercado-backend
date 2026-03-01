import { Inject, Injectable } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import { LimitOffset } from '../../common/pagination/build-limit-offset.util';
import { UpdateSaleRequestDto } from './dto';

export interface SaleRecord {
  sale_id: string;
  purchase_request_id: string;
  livestock_post_id: string;
  seller_id: string;
  buyer_id: string;
  sale_type_id: number;
  quantity: number;
  total_weight_kg: string | null;
  price_per_kg: string | null;
  price_per_unit: string | null;
  total_amount: string;
  commission_percentage: string;
  commission_amount: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleFilters {
  saleId?: string;
  sellerId?: string;
  livestockPostId?: string;
  buyerId?: string;
  involvedUserId?: string;
}

@Injectable()
export class SalesRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  // Lee ventas con filtros opcionales y paginación limit-offset.
  async findAll(
    filters: SaleFilters,
    pagination: LimitOffset,
  ): Promise<SaleRecord[]> {
    const params = [
      filters.saleId ?? null,
      filters.sellerId ?? null,
      filters.livestockPostId ?? null,
      filters.buyerId ?? null,
      filters.involvedUserId ?? null,
      pagination.limit,
      pagination.offset,
    ];

    const result = await this.db.query(queries.sales.findAll, params);
    return result.rows as SaleRecord[];
  }

  // Cuenta el total de ventas con los mismos filtros para devolver metadata paginada.
  async countAll(filters: SaleFilters): Promise<number> {
    const params = [
      filters.saleId ?? null,
      filters.sellerId ?? null,
      filters.livestockPostId ?? null,
      filters.buyerId ?? null,
      filters.involvedUserId ?? null,
    ];

    const result = await this.db.query(queries.sales.countAll, params);
    return Number(result.rows[0]?.total ?? 0);
  }

  // Retorna una venta por ID o null si no existe.
  async findById(saleId: string): Promise<SaleRecord | null> {
    const result = await this.db.query(queries.sales.findById, [saleId]);
    return result.rows[0] ? (result.rows[0] as SaleRecord) : null;
  }

  // Actualiza una venta y devuelve el registro final.
  async updateById(
    saleId: string,
    dto: UpdateSaleRequestDto,
  ): Promise<SaleRecord | null> {
    const params = [
      dto.quantity ?? null,
      dto.totalWeightKg ?? null,
      dto.pricePerKg ?? null,
      dto.pricePerUnit ?? null,
      dto.commissionPercentage ?? null,
      saleId,
    ];

    const result = await this.db.query(queries.sales.updateById, params);
    return result.rows[0] ? (result.rows[0] as SaleRecord) : null;
  }

  // Elimina una venta y devuelve el registro borrado.
  async deleteById(saleId: string): Promise<SaleRecord | null> {
    const result = await this.db.query(queries.sales.deleteById, [saleId]);
    return result.rows[0] ? (result.rows[0] as SaleRecord) : null;
  }

  // Inserta una venta desde una compra aprobada (purchase_status_id=2) sin duplicados.
  async createFromApprovedPurchase(
    purchaseRequestId: string,
  ): Promise<SaleRecord | null> {
    const result = await this.db.query(queries.sales.createFromApprovedPurchase, [
      purchaseRequestId,
    ]);
    return result.rows[0] ? (result.rows[0] as SaleRecord) : null;
  }
}
