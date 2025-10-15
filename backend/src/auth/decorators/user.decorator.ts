import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  // Pour pouvoir faire @User('id') ou @User('roles')
  return data ? user?.[data] : user;
});
