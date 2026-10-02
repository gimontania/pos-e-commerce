import { CanActivate, ExecutionContext, Injectable, } from '@nestjs/common';
import { Reflector} from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        //permite leer los roles definidos en cada endpoint
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        //obtenemos los roles permitidos por el decorador @Roles()
        const roles = this.reflector.get<string[]>(
            ROLES_KEY,
            context.getHandler(),
        );

        //si el endpoint no tiene @Roles(), permitimos el acceso
        if (!roles) {
            return true;
        }

        //obtenemos el usuario que jwtAuthGuard dejó en la request
        const request = context.switchToHttp().getRequest();

        //obtenemos el rol del usuario
        const usuario = request.user;

        //comprobamos si su rol está entre los roles permitidos
        return roles.includes(usuario.role);
    }
}