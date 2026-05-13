import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Linktree, LinktreeDocument } from './schemas/linktree.schema';
import { AddLinkDto } from './dto/add-link.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';

@Injectable()
export class LinktreeService {
    constructor(
        @InjectModel(Linktree.name)
        private linktreeModel: Model<LinktreeDocument>,
    ) {}

    async getLinktree(userId: string) {
        let linktree = await this.linktreeModel.findOne({ userId });
        if (!linktree) {
            linktree = await this.linktreeModel.create({
                userId,
                username: userId,
                links: [],
            });
        }
        return { message: 'Linktree fetched successfully', linktree };
    }

    async getPublicLinktree(username: string) {
        // Find linktree and populate user to get name/profile info for public view
        const linktree = await this.linktreeModel
            .findOne({ username })
            .populate('userId', 'name profilePicUrl');
        if (!linktree) {
            throw new NotFoundException('Linktree not found');
        }
        return { message: 'Public linktree fetched successfully', linktree };
    }

    async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
        const { username, bio, links } = updateUsernameDto;
        const updateData: Partial<Linktree> = {};

        if (username) {
            const lowercaseUsername = username.toLowerCase();

            // Check if username is already taken by someone else
            const existing = await this.linktreeModel.findOne({
                username: lowercaseUsername,
            });
            if (existing && existing.userId.toString() !== userId) {
                throw new ConflictException('Username is already taken');
            }
            updateData.username = lowercaseUsername;
        }

        if (bio !== undefined) {
            updateData.bio = bio;
        }

        let linktree = await this.linktreeModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true },
        );

        if (links && links.length > 0) {
            for (const linkUpdate of links) {
                await this.linktreeModel.updateOne(
                    { userId, 'links._id': linkUpdate._id },
                    { $set: { 'links.$.title': linkUpdate.title } },
                );
            }
            // Refresh linktree after updates
            linktree = (await this.linktreeModel.findOne({
                userId,
            }))!;
        }

        return { message: 'Linktree updated successfully', linktree };
    }

    async addLink(userId: string, addLinkDto: AddLinkDto) {
        const newLink = {
            _id: new Types.ObjectId(),
            title: addLinkDto.title,
            url: addLinkDto.url,
        };

        const linktree = await this.linktreeModel.findOneAndUpdate(
            { userId },
            {
                $push: { links: newLink },
                $setOnInsert: { username: userId },
            },
            { new: true, upsert: true },
        );

        return { message: 'Link added successfully', link: newLink, linktree };
    }

    async deleteLink(userId: string, linkId: string) {
        const result = await this.linktreeModel.findOneAndUpdate(
            { userId },
            { $pull: { links: { _id: linkId } } },
            { new: true },
        );

        if (!result) {
            throw new NotFoundException('Linktree not found');
        }

        return { message: 'Link deleted successfully', linktree: result };
    }
}
