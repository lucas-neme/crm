import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as nodeCrypto from 'crypto';
import { requestAuditMiddleware } from './common/tenant/request-audit.middleware';

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestAuditMiddleware);

  // Increase body size limit for large base64 images
  const bodyParserApp = app as any;
  if (typeof bodyParserApp.useBodyParser === 'function') {
    bodyParserApp.useBodyParser('json', { limit: '50mb' });
    bodyParserApp.useBodyParser('urlencoded', { limit: '50mb', extended: true });
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('The CRM API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('clientes')
    .addTag('produtos')
    .addTag('negocios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        if (a === 'auth') return -1;
        if (b === 'auth') return 1;
        return a.localeCompare(b);
      },
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
