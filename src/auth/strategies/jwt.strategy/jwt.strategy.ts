import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            //busca el jwt en authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            //verifica que el token no esté vencido
            ignoreExpiration: false,

            //usa nuestro secreto del archivo .env
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    //se ejecuta cuando el jwt fue validado correctamente
    async validate(payload: any) {
        console.log('JWT VALIDADO', payload);

        return payload;
    }
}
