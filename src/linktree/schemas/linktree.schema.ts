import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type LinktreeDocument = Linktree & Document;

@Schema()
export class LinktreeLink {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    url: string;
}
export const LinktreeLinkSchema = SchemaFactory.createForClass(LinktreeLink);

@Schema({ timestamps: true })
export class Linktree {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    })
    userId: Types.ObjectId;

    @Prop({
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30,
        default: function (this: LinktreeDocument) {
            return this.userId ? this.userId.toString() : undefined;
        },
    })
    username: string;

    @Prop({
        type: String,
        trim: true,
        maxLength: 150,
        default: '',
    })
    bio: string;

    @Prop({ type: [LinktreeLinkSchema], default: [] })
    links: LinktreeLink[];
}
export const LinktreeSchema = SchemaFactory.createForClass(Linktree);
