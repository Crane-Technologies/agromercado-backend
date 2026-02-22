import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(50)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+[1-9][0-9]{7,14}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
