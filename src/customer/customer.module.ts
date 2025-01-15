import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PersonalInformation, PersonalInformationSchema } from './schemas/customer.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonalInformation.name, schema: PersonalInformationSchema },
    ]),
    forwardRef(() => AuthModule), 
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
