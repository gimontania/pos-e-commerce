import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPayService {
    //simula la aprobación de un pago externo
    async procesarPago(
        monto: number,
        metodo: 'TARJETA' | 'TRANSFERENCIA_QR',
    ) {
        return {
            aprobado: true,
            monto,
            metodo,
            transaccionId: `MOCK-${Date.now()}`,
        };
    }
}
