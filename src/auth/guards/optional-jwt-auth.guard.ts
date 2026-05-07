import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = unknown>(
        err: unknown,
        user: TUser | false,
        info?: Error,
    ): TUser | undefined {
        if (!user && info?.message === 'No auth token') {
            return undefined;
        }

        if (err instanceof Error) {
            throw err;
        }

        if (err || !user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
