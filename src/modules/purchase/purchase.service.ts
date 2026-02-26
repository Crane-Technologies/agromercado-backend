import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseRequestDto, UpdatePurchaseRequestDto } from './dto';

import { PurchaseRepository } from './purchase.repository';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Crea una solicitud de compra y dispara la notificación relacionada.
  async createPurchaseRequest(dto: CreatePurchaseRequestDto): Promise<void> {
    try {
      await this.purchaseRepository.createPurchaseRequest(dto);

      // TODO: Se requiere obtener el id del usuario vendedor para enviar la notificación al usuario correcto
      await this.notificationsService.createAndSend({
        livestockPostId: dto.livestockPostId,
        sentBy: dto.potentialBuyer,
        purchaseNotificationTypeId: 1,
        message: `Has recibido una nueva solicitud de compra de ${dto.potentialBuyer}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to create purchase request',
      );
    }
  }

  // Placeholder temporal para lecturas globales de purchase_request.
  getAll() {
    return `This action returns all purchase`;
  }

  // Placeholder temporal para lectura puntual de purchase_request.
  getById(id: string) {
    return `This action returns a #${id} purchase`;
  }

  // Actualiza la compra y crea automáticamente la venta cuando purchase_status_id pasa a aprobado (2).
  async update(id: string, updatePurchaseDto: UpdatePurchaseRequestDto) {
    try {
      const updateResult = await this.purchaseRepository.updatePurchaseRequest(
        id,
        updatePurchaseDto,
      );

      if (!updateResult) {
        throw new NotFoundException(`Purchase request with id ${id} not found`);
      }

      return {
        purchaseRequest: updateResult.purchaseRequest,
        saleCreated: Boolean(updateResult.createdSale),
        saleId: updateResult.createdSale?.sale_id ?? null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to update purchase',
      );
    }
  }

  // Placeholder temporal para eliminación de purchase_request.
  remove(id: string) {
    return `This action removes a #${id} purchase`;
  }
}
