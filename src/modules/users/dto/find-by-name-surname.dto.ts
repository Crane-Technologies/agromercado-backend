import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FindByNameSurnameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  first_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  surname!: string;
}
