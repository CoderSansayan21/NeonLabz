import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import type { Request, Response } from 'express';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

type AuthedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  updateOwn(
    @Req() req: AuthedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateOwn(req.user.userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async removeOwn(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.removeOwn(req.user.userId);

    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Account deleted' };
  }
}