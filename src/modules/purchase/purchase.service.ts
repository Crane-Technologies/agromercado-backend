import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePurchaseRequestDto, UpdatePurchaseRequestDto } from './dto';

import { PurchaseRepository } from './purchase.repository';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

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

  getAll() {
    return `This action returns all purchase`;
  }

  getById(id: number) {
    return `This action returns a #${id} purchase`;
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseRequestDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
