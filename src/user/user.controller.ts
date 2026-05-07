import {
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Body,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    UserResponse,
    UsersResponse,
    DeleteUserResponse,
} from './interfaces/user-response.interface';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    // USER + ADMIN — get own profile
    @Get('profile')
    async getProfile(@GetUser('userId') userId: string): Promise<UserResponse> {
        return this.userService.findById(userId);
    }

    // ADMIN only — get all users
    @Get()
    @Roles(Role.ADMIN)
    async findAll(): Promise<UsersResponse> {
        return this.userService.findAll();
    }

    // ADMIN only — get user by ID
    @Get(':id')
    @Roles(Role.ADMIN)
    async findById(@Param('id') id: string): Promise<UserResponse> {
        return this.userService.findById(id);
    }

    // USER can update own profile, ADMIN can update anyone
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
        @GetUser('role') role: Role,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponse> {
        if (role !== Role.ADMIN && id !== String(userId)) {
            throw new ForbiddenException(
                'You can only update your own profile',
            );
        }
        return this.userService.update(id, updateUserDto);
    }

    // ADMIN only — delete user
    @Delete(':id')
    @Roles(Role.ADMIN)
    async delete(@Param('id') id: string): Promise<DeleteUserResponse> {
        return this.userService.delete(id);
    }
}
