import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const api_key = configService.get<string>('SENDGRID_API_KEY');
        if (api_key) {
            sgMail.setApiKey(api_key);
        }
    }

    async sendPasswordResetEmail(
        to: string,
        userName: string,
        code: string,
    ): Promise<void> {
        const msg = {
            to,
            from:
                this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
                'noreply@yourdomain.com', // Must be a verified sender in your SendGrid account
            subject: 'Minify - Password Reset Verification Code',
            text: `Hello ${userName},\n\nWe received a request to reset the password for your Minify account.\n\nPlease use the following 6-digit verification code to proceed: ${code}\n\nThis code will expire in 10 minutes for your security.\n\nIf you didn't request a password reset, you can safely ignore this email. Your Minify password will remain unchanged.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">Minify Password Reset</h2>
                    <p>Hello ${userName},</p>
                    <p>We received a request to reset the password for your Minify account. Please use the following verification code to proceed:</p>
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; border: 1px solid #e9ecef;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2980b9;">${code}</span>
                    </div>
                    <p>This code is valid for <strong>10 minutes</strong>.</p>
                    <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #95a5a6; text-align: center;">This is an automated message, please do not reply.</p>
                </div>
            `,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Password reset email sent to ${to}`);
        } catch (error: unknown) {
            this.logger.error(
                `Failed to send password reset email to ${to}`,
                error,
            );
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response: { body: unknown } };
                this.logger.error(responseError.response.body);
            }
            throw error;
        }
    }

    async sendPasswordResetConfirmationEmail(
        to: string,
        userName: string,
    ): Promise<void> {
        const msg = {
            to,
            from:
                this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
                'noreply@yourdomain.com', // Must be a verified sender in your SendGrid account
            subject: 'Security Notice: Minify Password Reset Successful',
            text: `Hello ${userName},\n\nThis is a quick security confirmation that the password for your Minify account has been successfully changed.\n\nIf you did not authorize this action, please secure your account immediately and contact our support team.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #27ae60;">Minify Password Successfully Reset</h2>
                    <p>Hello ${userName},</p>
                    <p>This is a quick confirmation that the password for your Minify account has been successfully changed.</p>
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; color: #856404; font-size: 16px;"><strong>Didn't make this change?</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #856404;">If you did not authorize this action, please secure your account immediately and contact our support team.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #95a5a6; text-align: center;">This is an automated security notification.</p>
                </div>
            `,
        };

        try {
            await sgMail.send(msg);
            this.logger.log(`Password reset confirmation email sent to ${to}`);
        } catch (error: unknown) {
            this.logger.error(
                `Failed to send password reset confirmation email to ${to}`,
                error,
            );
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response: { body: unknown } };
                this.logger.error(responseError.response.body);
            }
            throw error;
        }
    }
}
