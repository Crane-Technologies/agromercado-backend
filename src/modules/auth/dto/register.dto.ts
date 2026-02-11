import {IsEmail, IsNotEmpty, IsString, MinLength, MaxLength,IsInt, Matches} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(50, { message: 'Email must not exceed 50 characters' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(255, { message: 'Password must not exceed 255 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' }
  )
  password!: string;

  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1, { message: 'Document type must be 1 character' })
  document_type!: string;

  @IsInt()
  @IsNotEmpty()
  document_number!: number;

  @IsInt()
  @IsNotEmpty()
  township_id!: number;
}
