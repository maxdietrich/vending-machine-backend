import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../user.schema';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
