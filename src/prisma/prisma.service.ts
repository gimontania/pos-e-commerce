import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(){
        //Adapter que permite a Prisma 7 conectarse a postgreSql
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });

        //inicializa prisma usando el adapter
        super({ adapter });
    }
    
    //se conecta a PostgreSQL cuando Nest inica
    async onModuleInit() {
        await this.$connect();        
    }

    //cierra la conexión cuando Nest se detiene
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
