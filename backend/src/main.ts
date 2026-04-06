import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Sérialisation JSON des BigInt (ex. githubIssueId) pour les réponses HTTP.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function toJSON() {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? [
    'http://localhost:3000',
  ];
  app.enableCors({ origin: corsOrigins, credentials: true });
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Bugpedia API listening on http://localhost:${port}`);
}

bootstrap();
