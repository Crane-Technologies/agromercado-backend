import { Inject, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';

@Injectable()
export class PurchaseService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  createPurchaseRequest(createPurchaseDto: CreatePurchaseDto) {
    return 'This action adds a new purchase';
  }

  getAll() {
    return `This action returns all purchase`;
  }

  getById(id: number) {
    return `This action returns a #${id} purchase`;
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
