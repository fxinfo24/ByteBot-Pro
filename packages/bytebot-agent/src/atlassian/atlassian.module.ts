import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AtlassianService } from './atlassian.service';

@Module({
  imports: [ConfigModule],
  providers: [AtlassianService],
  exports: [AtlassianService],
})
export class AtlassianModule {}