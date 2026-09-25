import { Module } from '@nestjs/common';
import { ReleaseService } from './release.service';

@Module({
    providers: [ReleaseService],
    exports: [ReleaseService],
})
export class ReleaseModule {}
