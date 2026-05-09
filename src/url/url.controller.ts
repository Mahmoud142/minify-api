import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import type { Response, Request as ExpressRequest } from 'express';

interface CustomRequest extends ExpressRequest {
    user?: { userId: string };
}

@Controller('url')
export class UrlController {
    constructor(private readonly urlService: UrlService) {}

    @Post('shorten')
    @UseGuards(OptionalJwtAuthGuard)
    async shortenUrl(
        @Body() createUrlDto: CreateUrlDto,
        @GetUser('userId') userId: string | undefined,
        @Req() req: CustomRequest,
    ) {
        const url = await this.urlService.createShortUrl(createUrlDto, userId);
        return {
            message: 'URL shortened successfully',
            id: url._id,
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            shortUrl: `${req.protocol}://${req.get('Host')}/url/${url.shortCode}`,
            expiresAt: url.expiresAt,
        };
    }

    @Get('my-urls')
    @UseGuards(JwtAuthGuard)
    async getMyUrls(@GetUser('userId') userId: string) {
        return this.urlService.getUserUrls(userId);
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    async getAnalytics(@GetUser('userId') userId: string) {
        return this.urlService.getAnalytics(userId);
    }

    @Get(':id/stats')
    @UseGuards(JwtAuthGuard)
    async getUrlStats(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
    ): Promise<unknown> {
        return this.urlService.getUrlStats(id, userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteUrl(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
    ) {
        return this.urlService.deleteUrl(id, userId);
    }

    @Throttle({ default: { ttl: 60000, limit: 20 } })
    @Get(':shortCode')
    async redirect(
        @Param('shortCode') shortCode: string,
        @Req() req: CustomRequest,
        @Res() res: Response,
    ) {
        const reqInfo = {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            referrer: (req.headers['referer'] || req.headers['referrer']) as
                | string
                | undefined,
        };

        const originalUrl = await this.urlService.resolveShortUrl(
            shortCode,
            reqInfo,
        );
        return res.redirect(302, originalUrl);
    }
}
