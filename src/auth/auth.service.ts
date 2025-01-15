import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAccount } from './schemas/account.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string>; // Bộ nhớ tạm cho danh sách đen token

  constructor(
    @InjectModel(UserAccount.name) private userAccountModel: Model<UserAccount>,
  ) {
    this.tokenBlacklist = new Set(); // Khởi tạo danh sách đen token
  }

  async register(createDto: CreateAuthDto): Promise<Omit<UserAccount, 'password'>> {
    // Kiểm tra mật khẩu có khớp không
    if (createDto.password !== createDto.repassword) {
      throw new BadRequestException('Passwords do not match');
    }

    
    const existingEmail = await this.userAccountModel.findOne({
      email: createDto.email,
    });

    if (existingEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    
    const existingId = await this.userAccountModel.findOne({
      id: createDto.id,
    });

    if (existingId) {
      throw new BadRequestException('User with this ID already exists');
    }

    
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    
    const userData = {
      ...createDto,
      password: hashedPassword,
      isActive: true,
      role: 'customer',
    };
    delete userData.repassword; // Xóa repassword trước khi lưu

    
    const newUser = new this.userAccountModel(userData);
    const savedUser = await newUser.save();

    const response = savedUser.toObject();
    delete response.password;
    return response;
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const account = await this.userAccountModel.findOne({ email: loginDto.email });
  
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Kiểm tra tài khoản có bị ban không
    if (!account.isActive) {
      throw new UnauthorizedException('Your account has been banned');
    }
  
    const isPasswordValid = await bcrypt.compare(loginDto.password, account.password);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const token = jwt.sign(
      { id: account.id, email: account.email, role: account.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );
  
    return { token };
  }

  async logout(token: string): Promise<void> {
    // Thêm token vào danh sách đen
    this.tokenBlacklist.add(token);

    // Xóa token sau 24 giờ (hoặc thời hạn token)
    setTimeout(() => {
      this.tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000); // 24 giờ
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  async banUser(userId: number): Promise<UserAccount> {
    const user = await this.userAccountModel.findOne({ id: userId });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === 'admin') {
      throw new BadRequestException('Cannot ban admin users');
    }

    user.isActive = false;
    return user.save();
  }

  async unbanUser(userId: number): Promise<UserAccount> {
    const user = await this.userAccountModel.findOne({ id: userId });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = true;
    return user.save();
  }

  async findOne(id: number): Promise<UserAccount> {
      if (!Number.isInteger(id) || id < 1) {
        throw new BadRequestException('ID must be a positive integer');
      }
  
      const account = await this.userAccountModel.findOne({ id }).exec();
  
      if (!account) {
        throw new NotFoundException(`Personal information with ID ${id} not found`);
      }
  
      return account;
    }
    async update(
      userId: number,
      updateUserDto: UpdateAuthDto,
      currentUserId: number
  ): Promise<Omit<UserAccount, 'password'>> {
      // Kiểm tra người dùng có đang cập nhật profile của chính họ
      if (userId !== currentUserId) {
          throw new UnauthorizedException('You can only update your own profile');
      }
  
      const user = await this.userAccountModel.findOne({ id: userId });
      if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      // Kiểm tra email có bị trùng không nếu email được cập nhật
      if (updateUserDto.email) {
          const existingUser = await this.userAccountModel.findOne({
              email: updateUserDto.email,
              id: { $ne: userId }
          });
          if (existingUser) {
              throw new BadRequestException('User with this email already exists');
          }
      }
  
      // Hash password nếu password được cập nhật
      if (updateUserDto.password) {
          if (updateUserDto.password !== updateUserDto.repassword) {
              throw new BadRequestException('Passwords do not match');
          }
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
          delete updateUserDto.repassword;
      }
  
      
  
      const updatedUser = await this.userAccountModel
          .findOneAndUpdate(
              { id: userId },
              updateUserDto,
              { new: true }
          )
          .exec();
  
      // Loại bỏ password trước khi trả về
      const response = updatedUser.toObject();
      delete response.password;
      return response;
  }

  async remove(userId: number, currentUserId: number): Promise<void> {
    if (userId !== currentUserId) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const result = await this.userAccountModel.deleteOne({ id: userId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Student with ID ${userId} not found`);
    }
  }
}
