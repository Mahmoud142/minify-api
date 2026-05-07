import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION');

        if (!secret || !expiresIn) {
            throw new ForbiddenException(
                'JWT_SECRET or JWT_EXPIRATION is not set in .env',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            jsonWebTokenOptions: { maxAge: expiresIn },
        });
    }

    validate(payload: JwtPayload): {
        userId: typeof payload.sub;
        email: string;
        role: string;
    } {
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
