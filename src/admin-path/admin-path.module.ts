import { Module } from '@nestjs/common';
import { ContentImportModule } from '@/content-import/content-import.module';
import { ReleaseModule } from '@/release/release.module';
import { AdminContentService } from './admin-content.service';
import { AdminPathController } from './admin-path.controller';
import { AdminPathService } from './admin-path.service';

@Module({
    imports: [ReleaseModule, ContentImportModule],
    controllers: [AdminPathController],
    providers: [AdminPathService, AdminContentService],
})
export class AdminPathModule {}
