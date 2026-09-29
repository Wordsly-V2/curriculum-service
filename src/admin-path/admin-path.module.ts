import { Module } from '@nestjs/common';
import { ContentImportModule } from '@/content-import/content-import.module';
import { PathProgressModule } from '@/path-progress/path-progress.module';
import { ReleaseModule } from '@/release/release.module';
import { AdminContentService } from './admin-content.service';
import { AdminImportService } from './admin-import.service';
import { AdminLearnersController } from './admin-learners.controller';
import { AdminLearnersService } from './admin-learners.service';
import { AdminPathController } from './admin-path.controller';
import { AdminPathService } from './admin-path.service';

@Module({
    imports: [ReleaseModule, ContentImportModule, PathProgressModule],
    controllers: [AdminPathController, AdminLearnersController],
    providers: [
        AdminPathService,
        AdminContentService,
        AdminImportService,
        AdminLearnersService,
    ],
})
export class AdminPathModule {}
