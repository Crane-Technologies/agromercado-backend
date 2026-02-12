import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
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
});
