import { SetMetadata } from "@nestjs/common";

//clave que usaremos para guardar los roles permitidos
export const ROLES_KEY = 'roles';

//decorador que permite indicar qué roles pueden acceder 
export const Roles = (...roles: string[]) =>
    SetMetadata(ROLES_KEY, roles);