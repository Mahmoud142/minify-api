import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { BaseResponse } from '../user/interfaces/user-response.interface';
import { Types } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

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
}
