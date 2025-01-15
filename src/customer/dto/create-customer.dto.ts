import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'ID is required' })
  @IsNumber({}, { message: 'ID must be a number' })
  id: number;

  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a valid phone number' })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString({ message: 'Address line must be a string' })
  addressLine?: string;
}
