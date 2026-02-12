import { Module } from '@nestjs/common';
import { LivestockPostsService } from './posts.service';
import { LivestockPostsController } from './posts.controller';

@Module({
  controllers: [LivestockPostsController],
  providers: [LivestockPostsService],
})
export class LivestockPostsModule {}
