import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignupResponse, AuthService, LoginResponse } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BaseResponse } from '../user/interfaces/user-response.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<BaseResponse> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('verify-reset-code')
    @HttpCode(HttpStatus.OK)
    async verifyResetCode(
        @Body() verifyCodeDto: VerifyCodeDto,
    ): Promise<BaseResponse> {
        return this.authService.verifyResetCode(verifyCodeDto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<BaseResponse> {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
