import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
  MinLength,
  MaxLength,
  ValidateIf,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { SexType } from '../../enum/sex-type.enum';

export class CreateLivestockPostDto {
  @IsInt()
  livestockTypeId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  livestockPostName!: string;

  @IsUUID()
  postedBy!: string;

  @IsInt()
  breedId!: number;

  @IsInt()
  sectorId!: number;

  @IsInt()
  saleTypeId!: number;

  @IsEnum(SexType)
  sex!: SexType;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 1)
  @IsPositive()
  avgWeightKg?: number;

  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 1)
  @IsPositive()
  pricePerKg?: number;

  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 2)
  @IsPositive()
  pricePerUnit?: number;

  @IsInt()
  townshipId!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  details?: string;
}
