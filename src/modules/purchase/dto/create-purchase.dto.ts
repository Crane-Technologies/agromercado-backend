export class CreatePurchaseDto {
  livestockPostId!: string;
  potentialBuyerId!: string;
  requestedQuantity!: number;
  message?: string;
}
