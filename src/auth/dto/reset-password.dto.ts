import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    Length,
    MaxLength,
} from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsString({ message: 'Code must be a string' })
    @IsNotEmpty({ message: 'Code cannot be empty' })
    @Length(6, 6, { message: 'Code must be exactly 6 characters long' })
    code!: string;

    @IsNotEmpty({ message: 'New password cannot be empty' })
    @IsString({ message: 'New password must be a string' })
    @MinLength(6, {
        message: 'New password must be at least 6 characters long',
    })
    @MaxLength(32, {
        message: 'New password must be at most 32 characters long',
    })
    newPassword!: string;
}
