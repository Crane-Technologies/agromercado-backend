import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { buildLimitOffset } from '../../common/pagination/build-limit-offset.util';
import { GetSalesQueryDto, UpdateSaleRequestDto } from './dto';
import {
  SaleFilters,
  SaleRecord,
  SalesRepository,
} from './sales.repository';

interface AuthenticatedUser {
  app_user_id: string;
  role_id: number;
}

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  // Lee el rol admin desde entorno para mantener la misma regla de autorización del proyecto.
  private getAdminRoleId(): number {
    const rawAdminRoleId = process.env.ADMIN_ROLE_ID;

    if (!rawAdminRoleId) {
      throw new InternalServerErrorException(
        'ADMIN_ROLE_ID is not configured',
      );
    }

    const adminRoleId = Number(rawAdminRoleId);
    if (Number.isNaN(adminRoleId)) {
      throw new InternalServerErrorException('ADMIN_ROLE_ID must be numeric');
    }

    return adminRoleId;
  }

  // Determina si el usuario autenticado tiene rol de administrador.
  private isAdmin(currentUser: AuthenticatedUser): boolean {
    return currentUser.role_id === this.getAdminRoleId();
  }

  // Construye filtros y devuelve ventas paginadas; usuarios no admin solo ven ventas donde participan.
  async findAll(query: GetSalesQueryDto, currentUser: AuthenticatedUser) {
    const pagination = buildLimitOffset(query.limit, query.offset);
    const filters: SaleFilters = {
      saleId: query.saleId,
      sellerId: query.sellerId,
      livestockPostId: query.livestockPostId,
      buyerId: query.buyerId,
    };

    if (!this.isAdmin(currentUser)) {
      filters.involvedUserId = currentUser.app_user_id;
      filters.buyerId = undefined;
      filters.sellerId = undefined;
    }

    const [items, total] = await Promise.all([
      this.salesRepository.findAll(filters, pagination),
      this.salesRepository.countAll(filters),
    ]);

    return {
      items,
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset,
        total,
        hasMore: pagination.offset + items.length < total,
      },
    };
  }

  // Retorna una venta por ID y valida acceso cuando no es administrador.
  async findById(saleId: string, currentUser: AuthenticatedUser): Promise<SaleRecord> {
    const sale = await this.salesRepository.findById(saleId);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${saleId} not found`);
    }

    if (
      !this.isAdmin(currentUser) &&
      sale.seller_id !== currentUser.app_user_id &&
      sale.buyer_id !== currentUser.app_user_id
    ) {
      throw new ForbiddenException('You do not have access to this sale');
    }

    return sale;
  }

  // Actualiza una venta existente; si no existe devuelve 404.
  async updateById(
    saleId: string,
    dto: UpdateSaleRequestDto,
  ): Promise<SaleRecord> {
    const sale = await this.salesRepository.updateById(saleId, dto);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${saleId} not found`);
    }

    return sale;
  }

  // Elimina una venta por ID; si no existe devuelve 404.
  async deleteById(saleId: string): Promise<SaleRecord> {
    const sale = await this.salesRepository.deleteById(saleId);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${saleId} not found`);
    }

    return sale;
  }

  // Crea una venta desde una compra aprobada y retorna null cuando no aplica o ya existía.
  async createSaleFromApprovedPurchase(
    purchaseRequestId: string,
  ): Promise<SaleRecord | null> {
    return this.salesRepository.createFromApprovedPurchase(purchaseRequestId);
  }
}
