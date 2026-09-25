import { Module } from '@nestjs/common';
import { ReleaseModule } from '@/release/release.module';
import { ContentImportBootstrap } from './content-import.bootstrap';
import { ContentImportService } from './content-import.service';

@Module({
    imports: [ReleaseModule],
    providers: [ContentImportService, ContentImportBootstrap],
    exports: [ContentImportService],
})
export class ContentImportModule {}
