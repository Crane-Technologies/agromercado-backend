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

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(50)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+[1-9][0-9]{7,14}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  @Matches(/^[VJ]$/, { message: 'Document type must be V or J' })
  document_type!: string;

  @IsInt()
  @IsNotEmpty()
  document_number!: number;

  @IsOptional()
  @IsInt()
  township_id?: number;

  @ValidateIf(o => o.document_type === 'V')
  @IsNotEmpty({ message: 'First name is required for natural persons' })
  @IsString()
  @MaxLength(25)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  middle_name?: string;

  @ValidateIf(o => o.document_type === 'V')
  @IsNotEmpty({ message: 'Surname is required for natural persons' })
  @IsString()
  @MaxLength(25)
  surname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  second_surname?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  // Para empresas (document type = j)
  @ValidateIf(o => o.document_type === 'J')
  @IsNotEmpty({ message: 'Company name is required for legal entities' })
  @IsString()
  @MaxLength(50)
  company_name?: string;
}