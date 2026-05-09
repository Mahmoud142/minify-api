import {
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class UpdateUsernameDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username: string;
}
