import { Module } from '@nestjs/common';
import { MockPayService } from './mock-pay.service';

@Module({
    providers: [MockPayService],
    exports: [MockPayService],
})
export class PaymentsModule {}
