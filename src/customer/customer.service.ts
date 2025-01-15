import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PersonalInformation } from './schemas/customer.schema';
import { Types } from 'mongoose';
import { UserAccount } from 'src/auth/schemas/account.schema';
@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(PersonalInformation.name) private personalInfoModel: Model<PersonalInformation>,
    @InjectModel(UserAccount.name) private userAccountModel: Model<UserAccount>
  ) {}
  async updatePersonalInformation(
    userId: string, 
    createCustomerDto: CreateCustomerDto,
  ): Promise<PersonalInformation> {
    
    const userObjectId = new Types.ObjectId(userId); 
    const user = await this.userAccountModel.findById(userObjectId);
    if (!user) {
      throw new NotFoundException('Account not found. Please create an account first.');
    }

    
    let personalInfo = await this.personalInfoModel.findOne({ userId: userObjectId });

    if (personalInfo) {
      
      personalInfo = await this.personalInfoModel.findOneAndUpdate(
        { userId: userObjectId },
        { $set: createCustomerDto },
        { new: true },
      );
    } else {
      
      const newPersonalInfo = new this.personalInfoModel({
        userId: userObjectId,
        ...createCustomerDto,
      });
      personalInfo = await newPersonalInfo.save();
    }

    return personalInfo;
  }

  

  async remove(userId: number, currentUserId: number): Promise<void> {
    if (userId !== currentUserId) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const result = await this.personalInfoModel.deleteOne({ id: userId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Student with ID ${userId} not found`);
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: PersonalInformation[]; total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.personalInfoModel.find().skip(skip).limit(limit).exec(),
      this.personalInfoModel.countDocuments(),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<PersonalInformation> {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('ID must be a positive integer');
    }

    const personalInfo = await this.personalInfoModel.findOne({ id }).exec();

    if (!personalInfo) {
      throw new NotFoundException(`Personal information with ID ${id} not found`);
    }

    return personalInfo;
  }
}