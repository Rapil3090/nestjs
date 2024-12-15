import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}    


    parseBasicToken(rawToken: string) {

        const basicSplit = rawToken.split(' ');

        if(basicSplit.length !== 2) {
            throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
        }

        const [_ , token] = basicSplit;

        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        const tokenSplit = decoded.split(':');

        if(tokenSplit.length !== 2) {
            throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
        }

        const [email, password] = tokenSplit;

        return {
            email,
            password,
        }
    }

    async register(rawToken: string) {

        const {email, password} = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });

        if(user) {
            throw new BadRequestException('이미 가입된 이메일입니다.');
        }

        const hash = await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS'))

        await this.userRepository.save({
            email,
            password: hash,
        });

        return this.userRepository.findOne({
            where: {
                email,
            },
        });
    }

    async authenticate(email: string, password: string) {

        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });

        if(!user) {
            throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        const passOk = await bcrypt.compare(password, user.password);

        if(!passOk) {
            throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        return user;
    }

    async issuToken(user: User, isRefreshToken: boolean) {

        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
        
        return this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
            type: isRefreshToken ? 'refresh' : 'access',
        }, {
            secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
            expiresIn: isRefreshToken ? '24h' : 300,
        })
    }


    async login(rawToken: string) {

        const {email, password} = this.parseBasicToken(rawToken);

        const user = await this.authenticate(email, password);

        


        return {
            refeshToken: await this.issuToken(user, true),
            accessToken: await this.issuToken(user, false),
        }

    }
}
