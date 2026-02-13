import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseRequestDto } from './dto/request/create-purchase.request.dto';
import { UpdatePurchaseRequestDto } from './dto/request/update-purchase.request.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  createPurchaseRequest(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchaseService.createPurchaseRequest(dto);
  }

  @Get()
  getAll() {
    return this.purchaseService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.purchaseService.getById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseService.update(+id, updatePurchaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(+id);
  }
}
