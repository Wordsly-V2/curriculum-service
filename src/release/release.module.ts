import { Module } from '@nestjs/common';
import { MessagingModule } from '@/messaging/messaging.module';
import { ReleaseService } from './release.service';

@Module({
    imports: [MessagingModule],
    providers: [ReleaseService],
    exports: [ReleaseService],
})
export class ReleaseModule {}
