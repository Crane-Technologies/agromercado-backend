// dto/register.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Matches,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', maxLength: 50 })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(50)
  email!: string;

  @ApiProperty({ example: 'contraseña123', minLength: 8, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

  @ApiProperty({ example: '+584121234567', maxLength: 20, description: 'Número de teléfono en formato internacional' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+[1-9][0-9]{7,14}$/)
  phone!: string;

  @ApiProperty({ example: 'V', enum: ['V', 'J'], description: 'V para persona natural, J para empresa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  @Matches(/^[VJ]$/, { message: 'Document type must be V or J' })
  document_type!: string;

  @ApiProperty({ example: 12345678, description: 'Número de documento de identidad' })
  @IsInt()
  @IsNotEmpty()
  document_number!: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del municipio' })
  @IsOptional()
  @IsInt()
  township_id?: number;

  @ApiPropertyOptional({ example: 'Juan', maxLength: 25, description: 'Requerido para personas naturales (document_type=V)' })
  @ValidateIf(o => o.document_type === 'V')
  @IsNotEmpty({ message: 'First name is required for natural persons' })
  @IsString()
  @MaxLength(25)
  first_name?: string;

  @ApiPropertyOptional({ example: 'Carlos', maxLength: 25 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  middle_name?: string;

  @ApiPropertyOptional({ example: 'Pérez', maxLength: 25, description: 'Requerido para personas naturales (document_type=V)' })
  @ValidateIf(o => o.document_type === 'V')
  @IsNotEmpty({ message: 'Surname is required for natural persons' })
  @IsString()
  @MaxLength(25)
  surname?: string;

  @ApiPropertyOptional({ example: 'González', maxLength: 25 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  second_surname?: string;

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Fecha de nacimiento en formato ISO 8601' })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  // Para empresas (document type = j)
  @ApiPropertyOptional({ example: 'Agropecuaria Los Llanos C.A.', maxLength: 50, description: 'Requerido para empresas (document_type=J)' })
  @ValidateIf(o => o.document_type === 'J')
  @IsNotEmpty({ message: 'Company name is required for legal entities' })
  @IsString()
  @MaxLength(50)
  company_name?: string;
}
