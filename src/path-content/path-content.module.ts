import { Module } from '@nestjs/common';
import { ReleaseModule } from '@/release/release.module';
import { PathContentController } from './path-content.controller';
import { PublishedContentService } from './published-content.service';

@Module({
    imports: [ReleaseModule],
    controllers: [PathContentController],
    providers: [PublishedContentService],
    exports: [PublishedContentService],
})
export class PathContentModule {}
