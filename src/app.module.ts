import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { PackagesModule } from './modules/packages/packages.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AuthModule } from './modules/auth/auth.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // PostgreSQL (Users + Packages)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.postgres.host'),
        port: config.get('database.postgres.port'),
        username: config.get('database.postgres.user'),
        password: config.get('database.postgres.password'),
        database: config.get('database.postgres.db'),
        entities: [__dirname + '/**/*.{entity,orm-entity}{.ts,.js}'],
        synchronize: config.get('app.env') !== 'production',
        logging: config.get('app.env') === 'development',
      }),
    }),

    // MongoDB (Tracking)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('database.mongo.uri'),
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    PackagesModule,
    TrackingModule,
  ],
})
export class AppModule {}
