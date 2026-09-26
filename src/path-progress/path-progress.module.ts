import { Module } from '@nestjs/common';
import { MessagingModule } from '@/messaging/messaging.module';
import { PathContentModule } from '@/path-content/path-content.module';
import { ReleaseModule } from '@/release/release.module';
import { CheckpointService } from './checkpoint.service';
import { PathProgressController } from './path-progress.controller';
import { PathProgressEvents } from './path-progress-events';
import { PathProgressService } from './path-progress.service';
import { PlacementService } from './placement.service';

@Module({
    imports: [ReleaseModule, PathContentModule, MessagingModule],
    controllers: [PathProgressController],
    exports: [PathProgressEvents],
    providers: [
        PathProgressService,
        PathProgressEvents,
        CheckpointService,
        PlacementService,
    ],
})
export class PathProgressModule {}
