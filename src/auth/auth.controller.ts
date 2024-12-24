import { Body, Controller, Get, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';

export class LocalAuthGuard extends AuthGuard('netflex'){};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Public()
  @Post('register')
  registerUser(@Headers('authorization') token: string){
    return this.authService.register(token);
  }

  @Public()
  @Post('login')
   loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
   }

   @Post('token/block')
   blockToken(
    @Body('token') token: string,
   ){
    return this.authService.tokenBlock(token);
   }

   @UseGuards(LocalAuthGuard)
   @Post('login/passport')
   async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issuToken(req.user, true),
      accessToken: await this.authService.issuToken(req.user, false),
    }
   }

   @UseGuards(JwtAuthGuard)
   @Get('pravate')
   async private(@Request() req) {
    return req.user;
   }

   @Post('token/access')
   async rotateAccessToken(@Request() req) {
    
    return {
      accesstoken: await this.authService.issuToken(req.user, false),
    }
   }
}
