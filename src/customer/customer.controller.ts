import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
  Patch,
  Request,
  UseGuards
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { AdminGuard } from 'src/guard/admin.guard';
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  @UseGuards(AuthGuard, AdminGuard)
  @Get('list')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    try {
      if (!page || !limit) {
        throw new Error('Page and limit are required');
      }
      const result = await this.customerService.findAll(+page, +limit);
      return {
        method: 'GET_ALL',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'GET_ALL',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }
  @UseGuards(AuthGuard)
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.customerService.findOne(+id);
      return {
        method: 'GET_ONE',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'GET_ONE',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }
  @UseGuards(AuthGuard)
  @Patch('update-personal-info/:userId')
  async updatePersonalInformation(
    @Param('userId') userId: string,
    @Body() createCustomerDto: CreateCustomerDto
  ) {
    try {
      const data = await this.customerService.updatePersonalInformation(
        userId,
        createCustomerDto
      );
      return {
        method: 'UPDATE_PERSONAL_INFO',
        data,
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'UPDATE_PERSONAL_INFO',
        error: {
          status: 400,
          message: error.message,
        },
      });
    }
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async remove(@Param('id') id: string, @Request() req) {
    try {
      await this.customerService.remove(+id, req.user.id);
      return {
        method: 'DELETE',
        data: { message: `user with ID ${id} deleted successfully` }
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'DELETE',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }
}
