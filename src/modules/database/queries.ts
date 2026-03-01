import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
  users: {
    findByEmail: 'SELECT * FROM app_user WHERE email = $1',

    findById: 'SELECT * FROM app_user WHERE app_user_id = $1',

    create:
      'SELECT create_app_user($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) as app_user_id',

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

    checkEmailExists:
      'SELECT EXISTS(SELECT 1 FROM app_user WHERE email = $1) as exists',

    checkPhoneExists:
      'SELECT EXISTS(SELECT 1 FROM app_user WHERE phone = $1) as exists',
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
  aws: {
    insertLivestockPostFile: `
    INSERT INTO app_file (
      app_file_name,
      app_file_size_bytes,
      mime_type,
      livestock_post_id,
      s3_bucket,
      s3_key,
      is_main_file,
      display_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      app_file_id,
      app_file_name,
      app_file_size_bytes,
      mime_type,
      livestock_post_id,
      s3_bucket,
      s3_key,
      is_main_file,
      display_order,
      created_at,
      updated_at
  `,

    getFileMetadata: `
    SELECT
      app_file_id,
      app_file_name,
      app_file_size_bytes,
      mime_type,
      livestock_post_id,
      s3_bucket,
      s3_key,
      is_main_file,
      display_order,
      created_at,
      updated_at
    FROM app_file
    WHERE app_file_id = $1
  `,

    getMainFileByLivestockPost: `
    SELECT
      livestock_post_id,
      s3_key,
      is_main_file
    FROM app_file
    WHERE livestock_post_id = $1 AND is_main_file = true
    LIMIT 1
  `,

    getFilesByLivestockPost: `
    SELECT
      livestock_post_id,
      s3_key,
      is_main_file
    FROM app_file
    WHERE livestock_post_id = $1
    ORDER BY display_order ASC
  `,

    deleteFile: `
    DELETE FROM app_file
    WHERE app_file_id = $1
  `,

    checkLivestockPostExists: `
    SELECT EXISTS(SELECT 1 FROM livestock_post WHERE livestock_post_id = $1)
  `,
  },

  posts: {
    createLivestockPost: `
    INSERT INTO livestock_post (
      livestock_type_id,
      livestock_post_name,
      posted_by,
      breed_id,
      sector_id,
      sale_type_id,
      sex,
      quantity,
      avg_weight_kg,
      price_per_kg,
      price_per_unit,
      township_id,
      details
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING livestock_post_id;
  `,
  },

  purchase: {
    createPurchaseRequest: `
    INSERT INTO purchase_request (
      livestock_post_id,
      potential_buyer,
      requested_quantity,
      message
    )
    VALUES ($1, $2, $3, $4)
  `,
  },

  purchaseNotification: {
    createPurchaseNotification: `
      INSERT INTO purchase_notification (
        sent_by,
        livestock_post_id,
        purchase_notification_type_id,
        message
      )
      VALUES ($1, $2, $3, $4)
    `,

    getAllChatsByUser: `
      SELECT DISTINCT ON (pn.livestock_post_id)
        pn.purchase_notification_id,
        pn.sent_by,
        pn.livestock_post_id,
        pn.purchase_notification_type_id,
        pn.message,
        pn.is_read,
        pn.created_at,
        u.name AS sender_name,
        lp.livestock_post_name
      FROM purchase_notification pn
      JOIN app_user u ON pn.sent_by = u.app_user_id
      JOIN livestock_post lp ON pn.livestock_post_id = lp.livestock_post_id
      WHERE pn.sent_by = $1 OR lp.posted_by = $1
      ORDER BY pn.livestock_post_id, pn.created_at DESC
      LIMIT $2 OFFSET $3
    `,

    getAllMessagesByChat: `
      SELECT
        pn.sent_by,
        pn.message,
        pn.is_read,
        pn.created_at,
        u.name AS sender_name,
        lp.livestock_post_name
      FROM purchase_notification pn
      JOIN app_user u ON pn.sent_by = u.app_user_id
      JOIN livestock_post lp ON pn.livestock_post_id = lp.livestock_post_id
      WHERE lp.livestock_post_id = $1
      ORDER BY pn.created_at DESC
      LIMIT $2 OFFSET $3
    `,
  },
});
