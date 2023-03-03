import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types as MongooseTypes } from 'mongoose';
import { UserRole } from 'src/user/user.schema';
import { checkPassword } from '../user/password.helper';
import { UsersService } from '../user/users.service';

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export type AuthenticatedUser = {
  userId: MongooseTypes.ObjectId;
  role: UserRole;
};

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    enteredPassword: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByUsername(username);
    if (
      user &&
      (await checkPassword(user.encrypted_password, enteredPassword))
    ) {
      return { userId: user._id, role: user.role };
    }
    return null;
  }

  login(userId: string, role: UserRole) {
    return {
      accessToken: this.jwtService.sign({ sub: userId, role }),
    };
  }
}
