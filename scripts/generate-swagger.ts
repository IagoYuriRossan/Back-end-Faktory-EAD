import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Prevent Prisma from trying to connect to a real database during Swagger generation
(PrismaClient.prototype as any).$connect = async () => Promise.resolve();
(PrismaClient.prototype as any).$disconnect = async () => Promise.resolve();

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('EG Faktory API')
    .setDescription('OpenAPI spec gerado automaticamente')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer-token')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  fs.writeFileSync('swagger.json', JSON.stringify(document, null, 2), { encoding: 'utf8' });
  console.log('swagger.json gerado em:', process.cwd() + '/swagger.json');

  await app.close();
}

generate().catch((err) => {
  console.error('Erro ao gerar swagger:', err);
  process.exit(1);
});
