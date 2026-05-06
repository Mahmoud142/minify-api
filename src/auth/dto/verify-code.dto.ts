import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsString({ message: 'Code must be a string' })
    @IsNotEmpty({ message: 'Code cannot be empty' })
    @Length(6, 6, { message: 'Code must be exactly 6 characters long' })
    code!: string;
}
