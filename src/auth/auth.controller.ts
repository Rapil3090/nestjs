import { Controller, Get, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './strategy/jwt.strategy';

export class LocalAuthGuard extends AuthGuard('netflex'){};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string){

    return this.authService.register(token);

  }

  
  @Post('login')
   loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
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
   async rotateAccessToken(@Headers('authorization') token: string) {
    
    const payload = await this.authService.parseBearerToken(token, true);
    
    return {
      accesstoken: await this.authService.issuToken(payload, false),
    }
   }
}
