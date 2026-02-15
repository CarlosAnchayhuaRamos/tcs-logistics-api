import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Logistics API')
    .setDescription(
      `## Sistema de Gestión de Envíos

API REST para gestionar paquetes, usuarios y seguimiento de envíos.

### Autenticación
La mayoría de endpoints requieren un **Bearer Token JWT**.
1. Crear un usuario en \`POST /api/v1/users\`
2. Iniciar sesión en \`POST /api/v1/auth/login\`
3. Usar el token recibido en el header \`Authorization: Bearer <token>\`

### Roles
- **admin**: Acceso completo
- **user**: Acceso a sus propios datos
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticación y sesión')
    .addTag('users', 'Gestión de usuarios')
    .addTag('packages', 'Gestión de paquetes')
    .addTag('tracking', 'Seguimiento de paquetes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Logistics API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
