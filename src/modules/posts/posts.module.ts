import { Module } from '@nestjs/common';
import { LivestockPostsService } from './posts.service';
import { LivestockPostsController } from './posts.controller';
import { LivestockPostsRepository } from './posts.repository';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [LivestockPostsController],
  providers: [LivestockPostsService, LivestockPostsRepository],
})
export class LivestockPostsModule {}
