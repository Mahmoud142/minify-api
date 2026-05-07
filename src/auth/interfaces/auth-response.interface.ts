import { Types } from 'mongoose';
import { BaseResponse } from '../../user/interfaces/user-response.interface';

export interface SafeUser {
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
