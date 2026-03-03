import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindByNameSurnameDto {
  @ApiProperty({ example: 'Juan', maxLength: 25 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  first_name!: string;

  @ApiProperty({ example: 'Pérez', maxLength: 25 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  surname!: string;
}
