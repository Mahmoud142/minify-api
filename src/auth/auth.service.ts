import {
    ConflictException,
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserDocument } from '../user/schemas/user.schema';
import { BaseResponse } from '../user/interfaces/user-response.interface';
import { Types } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

interface SafeUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
    profilePicUrl?: string;
}

export interface SignupResponse extends BaseResponse {
    data: {
        user: SafeUser;
    };
}

export interface LoginResponse extends BaseResponse {
    data: {
        user: SafeUser;
        token: string;
    };
}

export interface JwtPayload {
    sub: Types.ObjectId;
    email: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) {}

    async signup(signupDto: SignupDto): Promise<SignupResponse> {
        const { name, email, password, phone, profilePicUrl } = signupDto;

        //1- Check if the user already exists
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        // 2. Hash the password before saving
        const saltRounds: number = 10;
        const hashedPassword: string = await bcrypt.hash(password, saltRounds);
        const safeProfilePicUrl: string | undefined =
            typeof profilePicUrl === 'string' ? profilePicUrl : undefined;

        // 3. Create and save the new user
        const newUser = await this.userService.create({
            name,
            email,
            password: hashedPassword,
            phone,
            profilePicUrl: safeProfilePicUrl,
        });

        return {
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    profilePicUrl: newUser.profilePicUrl,
                },
            },
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;
        // 1. Find the user by email
        const user: UserDocument | null =
            await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Compare passwords
        const isPasswordValid: boolean = await bcrypt.compare(
            password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Generate JWT Payload and Sign Token
        const payload: JwtPayload = {
            sub: user._id,
            email: user.email,
            role: user.role,
        };
        const accessToken: string = this.jwtService.sign(payload);

        return {
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicUrl: user.profilePicUrl,
                },
                token: accessToken,
            },
        };
    }

    async forgotPassword(
        forgotPasswordDto: ForgotPasswordDto,
    ): Promise<BaseResponse> {
        const user = await this.userService.findByEmail(
            forgotPasswordDto.email,
        );

        if (!user) {
            throw new NotFoundException('User with this email does not exist');
        }

        // Generate a 6-digit random code
        // Instead of Math.random, use crypto.randomInt for CSPRNG
        const resetCode = crypto.randomInt(100000, 999999).toString();

        // Hash token to store in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetCode)
            .digest('hex');

        // Token expires in 10 minutes
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await this.userService.updateRaw(user._id.toString(), {
            $set: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: resetExpires,
            },
        });

        // Send email asynchronously to prevent Timing Attacks
        // Using setImmediate or a background job queue is ideal.
        // We do not await this, letting the response return instantly.
        this.mailService
            .sendPasswordResetEmail(user.email, user.name, resetCode)
            .catch((err) => {
                // Log error, don't crash
                console.error('Failed to send reset email', err);
            });

        return {
            status: 'success',
            message: 'Password reset code sent to your email',
        };
    }

    async verifyResetCode(verifyCodeDto: VerifyCodeDto): Promise<BaseResponse> {
        const { email, code } = verifyCodeDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            // Prevent User Enumeration by using a generic error rather than "User not found"
            throw new BadRequestException('Code is invalid or has expired');
        }

        // Hash code as it's hashed in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(code)
            .digest('hex');

        if (
            user.resetPasswordToken !== hashedToken ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            throw new BadRequestException('Code is invalid or has expired');
        }

        return {
            status: 'success',
            message: 'Code is correct',
        };
    }

    async resetPassword(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<BaseResponse> {
        const { email, code, newPassword } = resetPasswordDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            // Prevent User Enumeration by using a generic error rather than "User not found"
            throw new BadRequestException('Code is invalid or has expired');
        }

        // Hash code as it's hashed in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(code)
            .digest('hex');

        if (
            user.resetPasswordToken !== hashedToken ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            throw new BadRequestException('Code is invalid or has expired');
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user
        await this.userService.updateRaw(user._id.toString(), {
            $set: { password: hashedPassword },
            $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
        });

        // Send confirmation email asynchronously (Phase 6)
        this.mailService
            .sendPasswordResetConfirmationEmail(user.email, user.name)
            .catch((err) => {
                console.error('Failed to send reset confirmation email', err);
            });

        return {
            status: 'success',
            message: 'Password updated successfully',
        };
    }
}
