import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
  users: {
    findAll:
      'SELECT * FROM app_user ORDER BY created_at DESC LIMIT $1 OFFSET $2',

    countAll: 'SELECT COUNT(*)::INTEGER AS total FROM app_user',

    findByNameAndSurname: `
      SELECT *
      FROM person
      WHERE first_name ILIKE $1
        AND surname ILIKE $2
      ORDER BY created_at DESC
    `,

    findByEmail: 'SELECT * FROM app_user WHERE email = $1',

    findById: 'SELECT * FROM app_user WHERE app_user_id = $1',

    create:
      'SELECT * FROM create_app_user($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',

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

    delete: `
      DELETE FROM app_user
      WHERE app_user_id = $1
      RETURNING *
    `,

    checkEmailExists:
      'SELECT EXISTS(SELECT 1 FROM app_user WHERE email = $1) as exists',

    checkPhoneExists:
      'SELECT EXISTS(SELECT 1 FROM app_user WHERE phone = $1) as exists',

    checkEmailAndPhoneExist: `
      SELECT
        EXISTS(SELECT 1 FROM app_user WHERE email = $1) AS email_exists,
        EXISTS(SELECT 1 FROM app_user WHERE phone = $2) AS phone_exists
    `,
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

    findVerificationCode: `
      SELECT verification_code_id, is_used, expires_at
      FROM verification_code
      WHERE app_user_id = $1
        AND code = $2
        AND verification_type = 'email'
      ORDER BY created_at DESC
      LIMIT 1
    `,

    insertVerificationCode:
      'SELECT insert_verification_code($1, $2, $3) AS verification_code_id',
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
    searchLivestockPosts: `
      SELECT *
      FROM search_livestock_posts(
        $1,   -- p_search_term
        $2,   -- p_min_relevance
        $3,   -- p_limit
        $4,   -- p_offset
        $5,   -- p_township_id
        $6,   -- p_state_id
        $7,   -- p_min_weight
        $8,   -- p_max_weight
        $9,   -- p_min_price_per_kg
        $10,  -- p_max_price_per_kg
        $11,  -- p_min_price_per_unit
        $12,  -- p_max_price_per_unit
        $13,  -- p_livestock_type_id
        $14,  -- p_sector_id
        $15   -- p_sex
      )
    `,

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

    getAll: `
    SELECT *
    FROM livestock_post
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

    countAll: `
    SELECT COUNT(*)::INTEGER AS total
    FROM livestock_post
  `,

    getById: `
    SELECT *
    FROM livestock_post
    WHERE livestock_post_id = $1
  `,

    update: `
    UPDATE livestock_post
    SET
      livestock_type_id  = COALESCE($1,  livestock_type_id),
      livestock_post_name = COALESCE($2, livestock_post_name),
      breed_id           = COALESCE($3,  breed_id),
      sector_id          = COALESCE($4,  sector_id),
      sale_type_id       = COALESCE($5,  sale_type_id),
      sex                = COALESCE($6,  sex),
      quantity           = COALESCE($7,  quantity),
      avg_weight_kg      = COALESCE($8,  avg_weight_kg),
      price_per_kg       = COALESCE($9,  price_per_kg),
      price_per_unit     = COALESCE($10, price_per_unit),
      township_id        = COALESCE($11, township_id),
      details            = COALESCE($12, details),
      updated_at         = CURRENT_TIMESTAMP
    WHERE livestock_post_id = $13
    RETURNING *
  `,

    delete: `
    UPDATE livestock_post
    SET is_active = false
    WHERE livestock_post_id = $1
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

    updatePurchaseRequest: `
    UPDATE purchase_request
    SET
      purchase_status_id = COALESCE($1, purchase_status_id),
      requested_quantity = COALESCE($2, requested_quantity),
      message = COALESCE($3, message),
      updated_at = CURRENT_TIMESTAMP
    WHERE purchase_request_id = $4
    RETURNING *
  `,
  },

  sales: {
    findAll: `
    SELECT *
    FROM sale s
    WHERE ($1::uuid IS NULL OR s.sale_id = $1)
      AND ($2::uuid IS NULL OR s.seller_id = $2)
      AND ($3::uuid IS NULL OR s.livestock_post_id = $3)
      AND ($4::uuid IS NULL OR s.buyer_id = $4)
      AND ($5::uuid IS NULL OR (s.seller_id = $5 OR s.buyer_id = $5))
    ORDER BY s.created_at DESC
    LIMIT $6 OFFSET $7
  `,

    countAll: `
    SELECT COUNT(*)::INTEGER AS total
    FROM sale s
    WHERE ($1::uuid IS NULL OR s.sale_id = $1)
      AND ($2::uuid IS NULL OR s.seller_id = $2)
      AND ($3::uuid IS NULL OR s.livestock_post_id = $3)
      AND ($4::uuid IS NULL OR s.buyer_id = $4)
      AND ($5::uuid IS NULL OR (s.seller_id = $5 OR s.buyer_id = $5))
  `,

    findById: `
    SELECT *
    FROM sale
    WHERE sale_id = $1
  `,

    updateById: `
    UPDATE sale
    SET
      quantity = COALESCE($1, quantity),
      total_weight_kg = COALESCE($2, total_weight_kg),
      price_per_kg = COALESCE($3, price_per_kg),
      price_per_unit = COALESCE($4, price_per_unit),
      commission_percentage = COALESCE($5, commission_percentage),
      updated_at = CURRENT_TIMESTAMP
    WHERE sale_id = $6
    RETURNING *
  `,

    deleteById: `
    DELETE FROM sale
    WHERE sale_id = $1
    RETURNING *
  `,

    createFromApprovedPurchase: `
    INSERT INTO sale (
      purchase_request_id,
      livestock_post_id,
      seller_id,
      buyer_id,
      sale_type_id,
      quantity,
      total_weight_kg,
      price_per_kg,
      price_per_unit
    )
    SELECT
      pr.purchase_request_id,
      pr.livestock_post_id,
      lp.posted_by,
      pr.potential_buyer,
      lp.sale_type_id,
      pr.requested_quantity,
      CASE
        WHEN lp.sale_type_id = 1 THEN lp.avg_weight_kg * pr.requested_quantity
        ELSE NULL
      END AS total_weight_kg,
      CASE
        WHEN lp.sale_type_id = 1 THEN lp.price_per_kg
        ELSE NULL
      END AS price_per_kg,
      CASE
        WHEN lp.sale_type_id = 2 THEN lp.price_per_unit
        ELSE NULL
      END AS price_per_unit
    FROM purchase_request pr
    INNER JOIN livestock_post lp ON lp.livestock_post_id = pr.livestock_post_id
    WHERE pr.purchase_request_id = $1
      AND pr.purchase_status_id = 2
    ON CONFLICT (purchase_request_id) DO NOTHING
    RETURNING *
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
