import { Module } from '@nestjs/common';
import { PathContentController } from './path-content.controller';

@Module({
    controllers: [PathContentController],
})
export class PathContentModule {}
