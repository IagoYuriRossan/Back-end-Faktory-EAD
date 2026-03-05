import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const fields: Record<string, string[]> = {};
        errors.forEach((error) => {
          fields[error.property] = Object.values(error.constraints || {});
        });
        return new BadRequestException({
          statusCode: 400,
          message: 'Dados inválidos',
          errors: fields,
        });
      },
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 EG Faktory API running on http://localhost:${port}/api`);
}
bootstrap();
