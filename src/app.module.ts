import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AwsModule } from './modules/aws/aws.module';

@Module({
  imports: [DatabaseModule, AuthModule, AwsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
