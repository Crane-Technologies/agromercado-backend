export interface JwtPayload {
    sub: string; // ID del usuario
    email: string;
    role_id: number;
    iat?: number; // Fecha de emisión
    exp?: number; // Fecha de expiración
}

// El IAT y EXP son opcionales, JWT los incluye automáticamente, pero no es necesario que estén en el payload explícitamente.
// Las puse por recomendación de Claude