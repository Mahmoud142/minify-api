import {
    IsNotEmpty,
    IsUrl,
    IsOptional,
    IsDateString,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class CreateUrlDto {
    @IsNotEmpty()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
    originalUrl!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[A-Za-z0-9_-]+$/, {
        message:
            'shortCode can only contain letters, numbers, hyphens, and underscores',
    })
    shortCode?: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: Date;
}
