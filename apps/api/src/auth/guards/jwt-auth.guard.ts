import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. On vérifie si la route possède le décorateur @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Si c'est public (comme le login), on laisse passer direct !
    if (isPublic) {
      return true;
    }

    // 3. Sinon, on fait la vérification normale du token JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Ce log nous aide à débugger
    console.log('JWT GUARD =>', { 
      err: err?.message, 
      info: info?.message, 
      user 
    });
    return super.handleRequest(err, user, info, context);
  }
}