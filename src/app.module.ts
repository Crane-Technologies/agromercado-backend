import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    // Configurar ConfigModule PRIMERO (antes que todo)
    ConfigModule.forRoot({
      isGlobal: true,        // Hace que esté disponible en toda la app
      envFilePath: '.env',   // Ruta al archivo .env
      cache: true,           // Cachea las variables para mejor performance
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}