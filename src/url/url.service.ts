import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Url, UrlDocument } from './schemas/url.schema';
import { ClickEvent, ClickEventDocument } from './schemas/click-event.schema';
import { CreateUrlDto } from './dto/create-url.dto';
import * as crypto from 'crypto';
import * as geoip from 'geoip-lite';

interface ReqInfo {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
}

const RESERVED_SHORT_CODES = new Set([
    'my-urls',
    'analytics',
    'shorten',
    'stats',
    'admin',
    'api',
    'health',
    'login',
    'signup',
    'auth',
    'dashboard',
    'settings',
    'profile',
]);

@Injectable()
export class UrlService {
    constructor(
        @InjectModel(Url.name) private urlModel: Model<UrlDocument>,
        @InjectModel(ClickEvent.name)
        private clickEventModel: Model<ClickEventDocument>,
    ) {}

    async createShortUrl(
        createUrlDto: CreateUrlDto,
        userId?: string,
    ): Promise<UrlDocument> {
        const {
            originalUrl,
            expiresAt,
            shortCode: requestedShortCode,
        } = createUrlDto;
        const shortCode = requestedShortCode
            ? await this.validateCustomShortCode(requestedShortCode, userId)
            : await this.generateUniqueShortCode();

        const newUrl = new this.urlModel({
            originalUrl,
            shortCode,
            userId,
            expiresAt,
        });

        try {
            return await newUrl.save();
        } catch (error) {
            if (this.isDuplicateKeyError(error)) {
                throw new ConflictException('This custom URL already exists');
            }

            throw error;
        }
    }

    async resolveShortUrl(
        shortCode: string,
        reqInfo: ReqInfo,
    ): Promise<string> {
        const url = await this.urlModel.findOne({ shortCode, isActive: true });

        if (!url) {
            throw new NotFoundException('URL not found or inactive');
        }

        if (url.expiresAt && url.expiresAt < new Date()) {
            throw new NotFoundException('URL has expired');
        }

        // Resolve geolocation from request IP
        const ip = reqInfo.ipAddress;
        const cleanIp = ip ? ip.replace(/^::ffff:/, '') : null;
        const geo = cleanIp ? geoip.lookup(cleanIp) : null;

        // Increment click count
        await this.urlModel
            .updateOne({ _id: url._id }, { $inc: { totalClicks: 1 } })
            .exec();

        // Save click analytics with geolocation data
        const clickEvent = new this.clickEventModel({
            urlId: url._id,
            ...reqInfo,
            country: geo?.country || 'Unknown',
            city: geo?.city || 'Unknown',
        });
        clickEvent
            .save()
            .catch((err) => console.error('Error saving click event:', err));

        return url.originalUrl;
    }

    async getUserUrls(
        userId: string,
    ): Promise<{ message: string; urls: UrlDocument[] }> {
        const urls = await this.urlModel
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .find({ userId: userId as any })
            .sort({ createdAt: -1 })
            .exec();

        return {
            message: 'URLs fetched successfully',
            urls,
        };
    }

    async getUrlStats(idOrShortCode: string, userId: string): Promise<any> {
        const url = Types.ObjectId.isValid(idOrShortCode)
            ? await this.urlModel.findById(idOrShortCode)
            : await this.urlModel.findOne({ shortCode: idOrShortCode });
        if (!url) {
            throw new NotFoundException('URL not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (String(url.userId) !== userId) {
            throw new NotFoundException('You do not own this URL'); // Using NotFound to not leak existence
        }

        const clicks = await this.clickEventModel
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .find({ urlId: url._id as any })
            .select('-ipAddress')
            .sort({ timestamp: -1 })
            .limit(50)
            .exec();

        const browsers = await this.clickEventModel.aggregate([
            { $match: { urlId: url._id } },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
        ]);

        const countries = await this.clickEventModel.aggregate([
            { $match: { urlId: url._id } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
        ]);

        return {
            message: 'URL stats fetched successfully',
            url,
            totalClicks: url.totalClicks,
            recentClicks: clicks,
            stats: {
                browsers,
                countries,
            },
        };
    }

    async getAnalytics(userId: string): Promise<{
        message: string;
        totalClicks: number;
        topLocations: { country: string; count: number }[];
        urls: UrlDocument[];
    }> {
        // Get all URLs belonging to the logged-in user, sorted by highest clicks first
        const urls = await this.urlModel
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .find({ userId: userId as any })
            .sort({ totalClicks: -1 })
            .exec();

        if (!urls.length) {
            return {
                message: 'Analytics fetched successfully',
                totalClicks: 0,
                topLocations: [],
                urls: [],
            };
        }

        // Calculate total clicks across all links
        const totalClicks = urls.reduce(
            (sum, url) => sum + (url.totalClicks || 0),
            0,
        );

        // Collect all URL IDs for aggregation
        const urlIds = urls.map((url) => url._id);

        // Aggregate top 10 locations across all user's links
        const topLocations = await this.clickEventModel.aggregate<{
            country: string;
            count: number;
        }>([
            { $match: { urlId: { $in: urlIds } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, country: '$_id', count: 1 } },
        ]);

        return {
            message: 'Analytics fetched successfully',
            totalClicks,
            topLocations,
            urls,
        };
    }

    async deleteUrl(
        idOrShortCode: string,
        userId: string,
    ): Promise<{ message: string }> {
        const url = Types.ObjectId.isValid(idOrShortCode)
            ? await this.urlModel.findById(idOrShortCode)
            : await this.urlModel.findOne({ shortCode: idOrShortCode });
        if (!url) {
            throw new NotFoundException('URL not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (String(url.userId) !== userId) {
            throw new NotFoundException('You do not own this URL');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        await this.clickEventModel.deleteMany({ urlId: url._id as any });
        await this.urlModel.findByIdAndDelete(url._id);

        return { message: 'URL and associated analytics deleted successfully' };
    }

    private generateShortCode(): string {
        return crypto.randomBytes(4).toString('base64url').substring(0, 6);
    }

    private async generateUniqueShortCode(): Promise<string> {
        let shortCode = this.generateShortCode();
        let isUnique = false;

        while (!isUnique) {
            const existing = await this.urlModel.findOne({ shortCode });
            if (!existing) {
                isUnique = true;
            } else {
                shortCode = this.generateShortCode();
            }
        }

        return shortCode;
    }

    private async validateCustomShortCode(
        shortCode: string,
        userId?: string,
    ): Promise<string> {
        if (!userId) {
            throw new UnauthorizedException(
                'You must be logged in to create a custom short code',
            );
        }

        if (RESERVED_SHORT_CODES.has(shortCode.toLowerCase())) {
            throw new BadRequestException('This short code is reserved');
        }

        const existing = await this.urlModel.findOne({ shortCode });
        if (existing) {
            throw new ConflictException('This custom URL already exists');
        }

        return shortCode;
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: unknown }).code === 11000
        );
    }
}
