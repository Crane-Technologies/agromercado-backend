import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { FindByNameSurnameDto } from './dto/find-by-name-surname.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAll() {
    const users = await this.usersService.getAll();
    return users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createByAdmin(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateOwnProfile(
    @CurrentUser() currentUser: { app_user_id: string },
    @Body() updateOwnUserDto: UpdateOwnUserDto,
  ) {
    const user = await this.usersService.update(
      currentUser.app_user_id,
      updateOwnUserDto,
    );
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateByAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteByAdmin(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Get('search/name-surname')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findByNameAndSurname(@Query() query: FindByNameSurnameDto) {
    const users = await this.usersService.findByNameAndSurname(
      query.first_name,
      query.surname,
    );
    return users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  // Endpoint para probar findByEmail
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      message: user ? 'User found' : 'User not found',
      user: user,
    };
  }

  // Endpoint para probar findById
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: user ? 'User found' : 'User not found',
      user: user,
    };
  }

  // Endpoint para probar emailExists
  @Get('check/email/:email')
  async checkEmail(@Param('email') email: string) {
    const exists = await this.usersService.emailExists(email);
    return {
      email: email,
      exists: exists,
    };
  }
}
