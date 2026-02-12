import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AwsModule } from './modules/aws/aws.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { LivestockPostsModule } from './modules/posts/posts.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AwsModule,
    PurchaseModule,
    LivestockPostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
