import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  newPassword: string;
}
