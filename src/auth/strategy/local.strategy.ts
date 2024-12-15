import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'netflix') {

    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            usernaField: 'email'
        });
    }

    async validate(email: string, password: string) {

        const user = await this.authService.authenticate(email, password);

        return user;
    }

}