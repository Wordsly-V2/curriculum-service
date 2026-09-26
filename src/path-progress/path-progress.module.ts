import { Module } from '@nestjs/common';
import { PathContentModule } from '@/path-content/path-content.module';
import { ReleaseModule } from '@/release/release.module';
import { CheckpointService } from './checkpoint.service';
import { PathProgressController } from './path-progress.controller';
import { PathProgressService } from './path-progress.service';
import { PlacementService } from './placement.service';

@Module({
    imports: [ReleaseModule, PathContentModule],
    controllers: [PathProgressController],
    providers: [PathProgressService, CheckpointService, PlacementService],
})
export class PathProgressModule {}
