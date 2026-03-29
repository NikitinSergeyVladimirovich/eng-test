import { IsNotEmpty, IsString } from 'class-validator';

export class TapDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;
}
