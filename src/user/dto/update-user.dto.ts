import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(255, { message: 'Name must be at most 255 characters long' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(32, { message: 'Password must be at most 32 characters long' })
    password?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Phone cannot be empty' })
    @MinLength(10, { message: 'Phone must be at least 10 characters long' })
    @MaxLength(15, { message: 'Phone must be at most 15 characters long' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'Profile picture URL must be a string' })
    profilePicUrl?: string;
}
