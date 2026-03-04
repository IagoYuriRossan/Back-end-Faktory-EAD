import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpsertProgressDto {
  @IsUUID()
  lessonId: string;

  @IsInt()
  @Min(0)
  lastTimestampWatchedSeconds: number;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
