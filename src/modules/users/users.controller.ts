import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  // Endpoint temporal para crear usuario de prueba
  @Post('test-create')
  async testCreate(@Body() body: any) {
    return await this.usersService.create(body);
  }
}