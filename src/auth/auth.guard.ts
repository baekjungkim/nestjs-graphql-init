import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());
    // @Role 없는경우 => Public Resolver
    if (!roles) return true;

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    // 잘못된 Token 인 경우
    if (!user) return false;

    // @Role(['Any']) => 로그인한 유저
    if (roles.includes('Any')) return true;

    return roles.includes(user.role);
  }
}
