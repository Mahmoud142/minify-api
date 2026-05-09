import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinktreeController } from './linktree.controller';
import { LinktreeService } from './linktree.service';
import { Linktree, LinktreeSchema } from './schemas/linktree.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Linktree.name, schema: LinktreeSchema },
        ]),
    ],
    controllers: [LinktreeController],
    providers: [LinktreeService],
})
export class LinktreeModule {}
