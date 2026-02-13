import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
  users: {
    findByEmail: 'SELECT * FROM app_user WHERE email = $1',
    
    findById: 'SELECT * FROM app_user WHERE app_user_id = $1',
    
    create: 'SELECT create_app_user($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',

    update: `
      UPDATE app_user 
      SET 
        email = COALESCE($1, email),
        phone = COALESCE($2, phone),
        password_hash = COALESCE($3, password_hash),
        is_verified = COALESCE($4, is_verified),
        updated_at = CURRENT_TIMESTAMP
      WHERE app_user_id = $5
      RETURNING *
    `,
    
    checkEmailExists: 'SELECT EXISTS(SELECT 1 FROM app_user WHERE email = $1) as exists',
    
    checkPhoneExists: 'SELECT EXISTS(SELECT 1 FROM app_user WHERE phone = $1) as exists',
  },
  
  auth: {
    saveRefreshToken: `
      INSERT INTO refresh_token (user_id, token_hash, expires_at) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `,
    
    findRefreshToken: `
      SELECT * FROM refresh_token 
      WHERE token_hash = $1 
        AND revoked = false 
        AND expires_at > NOW()
    `,
    
    revokeAllUserTokens: `
      UPDATE refresh_token 
      SET revoked = true 
      WHERE user_id = $1
    `,
    
    revokeSpecificToken: `
      UPDATE refresh_token 
      SET revoked = true 
      WHERE token_hash = $1
    `,
    
    deleteExpiredTokens: `
      DELETE FROM refresh_token 
      WHERE expires_at < NOW()
    `,
  },
});