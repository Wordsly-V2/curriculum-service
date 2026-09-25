import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHealth(): string {
        return 'Curriculum Service is healthy';
    }
}
