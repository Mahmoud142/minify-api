import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class UpdateLinkTitleDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    title: string;
}

export class UpdateUsernameDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    bio?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateLinkTitleDto)
    links?: UpdateLinkTitleDto[];
}
