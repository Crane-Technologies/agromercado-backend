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
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { SexType } from '../../enum/sex-type.enum';

export class CreateLivestockPostDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de ganado' })
  @IsInt()
  livestockTypeId!: number;

  @ApiProperty({
    example: 'Lote de novillas brahman',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  livestockPostName!: string;

  @ApiHideProperty()
  @IsUUID('4', { message: 'postedBy debe ser un UUID válido' })
  @IsOptional()
  postedBy?: string;

  @ApiProperty({ example: 2, description: 'ID de la raza' })
  @IsInt()
  breedId!: number;

  @ApiProperty({ example: 3, description: 'ID del sector' })
  @IsInt()
  sectorId!: number;

  @ApiProperty({ example: 1, description: '1=Por kg, 2=Por unidad' })
  @IsInt()
  saleTypeId!: number;

  @ApiProperty({ enum: SexType, enumName: 'SexType', example: SexType.MALE })
  @IsEnum(SexType)
  sex!: SexType;

  @ApiProperty({ example: 10, minimum: 1, description: 'Cantidad de animales' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    example: 350.5,
    description: 'Peso promedio en kg (requerido si saleTypeId=1)',
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 1)
  @IsPositive()
  avgWeightKg?: number;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Precio por kg en USD (requerido si saleTypeId=1)',
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 1)
  @IsPositive()
  pricePerKg?: number;

  @ApiPropertyOptional({
    example: 800,
    description: 'Precio por unidad en USD (requerido si saleTypeId=2)',
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((obj: CreateLivestockPostDto) => obj.saleTypeId === 2)
  @IsPositive()
  pricePerUnit?: number;

  @ApiProperty({
    example: 5,
    description: 'ID del municipio donde está el ganado',
  })
  @IsInt()
  townshipId!: number;

  @ApiPropertyOptional({
    example: 'Animales sanos, con carnet de vacunación al día.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  details?: string;
}
