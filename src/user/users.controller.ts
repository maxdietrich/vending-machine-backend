import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UsernameAlreadyExistsError, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    try {
      await this.usersService.createUser(dto.username, dto.password, dto.role);
    } catch (err) {
      if (err instanceof UsernameAlreadyExistsError) {
        throw new BadRequestException(
          'Username already exists. Please choose another one.',
        );
      }
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.getUser(request.user?.userId);
    return {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      deposit: user.deposit,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(
      request.user?.userId,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteCurrentUser(@Req() request: AuthenticatedRequest) {
    await this.usersService.deleteUser(request.user?.userId);
  }
}
