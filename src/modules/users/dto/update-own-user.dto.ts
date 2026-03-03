import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOwnUserDto {
  @ApiPropertyOptional({ example: 'nuevo@ejemplo.com', maxLength: 50 })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(50)
  email?: string;

  @ApiPropertyOptional({ example: '+584121234567', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+[1-9][0-9]{7,14}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'nuevaContraseña123', minLength: 8, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;
}
