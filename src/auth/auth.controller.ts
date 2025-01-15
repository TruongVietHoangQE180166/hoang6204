import { Controller, Post, Body, BadRequestException, Headers, UseGuards, Get, Param, Request, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from 'src/guard/admin.guard';
import { AuthGuard } from 'src/guard/auth.guard';
import { UpdateAuthDto } from './dto/update-auth.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    try {
      const newUser = await this.authService.register(createAuthDto);
      return {
        message: 'User registered successfully',
        data: newUser,
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message,
      });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const data = await this.authService.login(loginDto);
      return {
        method: 'LOGIN',
        data
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'LOGIN',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    try {
      // Extract the token from the Authorization header
      if (!authHeader) {
        throw new BadRequestException('No authorization token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      await this.authService.logout(token);

      return {
        method: 'LOGOUT',
        data: {
          message: 'Logged out successfully'
        }
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'LOGOUT',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }
  @UseGuards(AuthGuard, AdminGuard)
  @Post('ban/:userId')
  async banUser(@Param('userId') userId: number) {
    try {
      const user = await this.authService.banUser(userId);
      return {
        message: 'User banned successfully',
        data: {
          id: user.id,
          isActive: user.isActive
        }
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('unban/:userId')
  async unbanUser(@Param('userId') userId: number) {
    try {
      const user = await this.authService.unbanUser(userId);
      return {
        message: 'User unbanned successfully',
        data: {
          id: user.id,
          isActive: user.isActive
        }
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('user-status/:userId')
  async findOne(@Param('userId') userId: number) {
    try {
      const status = await this.findOne(userId);
      return {
        data: status
      };
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: error.message
      });
    }
  }
  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateAuthDto,
    @Request() req
  ) {
    try {
      const data = await this.authService.update(+id, updateDto, req.user.id);
      return {
        method: 'UPDATE',
        data
      };
    } catch (error) {
      throw new BadRequestException({
        method: 'UPDATE',
        error: {
          status: 400,
          message: error.message
        }
      });
    }
  }
  @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async remove(@Param('id') id: string, @Request() req) {
      try {
        await this.authService.remove(+id, req.user.id);
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