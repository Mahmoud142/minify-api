import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    UserResponse,
    UsersResponse,
    DeleteUserResponse,
} from './interfaces/user-response.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async create(userData: Partial<User>): Promise<UserDocument> {
        const createdUser = new this.userModel(userData);
        return createdUser.save();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findByResetToken(token: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() },
            })
            .exec();
    }

    async updateRaw(
        id: string,
        updateData: import('mongoose').UpdateQuery<UserDocument>,
    ): Promise<UserDocument | null> {
        return this.userModel
            .findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
            .exec();
    }

    async findAll(): Promise<UsersResponse> {
        const users = await this.userModel.find().select('-password').exec();

        return {
            status: 'success',
            message: 'Users fetched successfully',
            data: { users },
        };
    }

    async findById(id: string): Promise<UserResponse> {
        const user = await this.userModel
            .findById(id)
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            status: 'success',
            message: 'User fetched successfully',
            data: { user },
        };
    }

    async update(
        id: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponse> {
        // Spread into new object to avoid mutating the DTO
        const updateData: Partial<User> = { ...updateUserDto };

        // Hash password if it's being updated
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(
                updateData.password,
                saltRounds,
            );
        }

        const user = await this.userModel
            .findByIdAndUpdate(id, updateData, {
                returnDocument: 'after',
                runValidators: true,
            })
            .select('-password')
            .exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            status: 'success',
            message: 'User updated successfully',
            data: { user },
        };
    }

    async delete(id: string): Promise<DeleteUserResponse> {
        const user = await this.userModel.findByIdAndDelete(id).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            status: 'success',
            message: 'User deleted successfully',
        };
    }
}
