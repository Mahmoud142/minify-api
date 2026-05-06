import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 255,
    })
    name!: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 3,
        maxLength: 255,
    })
    email!: string;

    @Prop({
        required: true,
    })
    password!: string;

    @Prop({
        default: Role.USER,
        enum: Role,
    })
    role!: string;

    @Prop({
        required: true,
        minLength: 10,
        maxLength: 15,
    })
    phone!: string;

    @Prop({
        type: String,
        default: undefined,
    })
    profilePicUrl?: string; // Optional field for the advanced file upload feature later
}
export const UserSchema = SchemaFactory.createForClass(User);
