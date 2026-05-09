import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { LinktreeService } from './linktree.service';
import { AddLinkDto } from './dto/add-link.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';

@Controller('minf')
export class LinktreeController {
    constructor(private readonly linktreeService: LinktreeService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getMyLinktree(@GetUser('userId') userId: string) {
        return this.linktreeService.getLinktree(userId);
    }

    @Get(':username')
    async getPublicLinktree(@Param('username') username: string) {
        return this.linktreeService.getPublicLinktree(username);
    }

    @Patch('username')
    @UseGuards(JwtAuthGuard)
    async updateUsername(
        @GetUser('userId') userId: string,
        @Body() updateUsernameDto: UpdateUsernameDto,
    ) {
        return this.linktreeService.updateUsername(userId, updateUsernameDto);
    }

    @Post('links')
    @UseGuards(JwtAuthGuard)
    async addLink(
        @GetUser('userId') userId: string,
        @Body() addLinkDto: AddLinkDto,
    ) {
        return this.linktreeService.addLink(userId, addLinkDto);
    }

    @Delete('links/:linkId')
    @UseGuards(JwtAuthGuard)
    async deleteLink(
        @GetUser('userId') userId: string,
        @Param('linkId') linkId: string,
    ) {
        return this.linktreeService.deleteLink(userId, linkId);
    }
}
