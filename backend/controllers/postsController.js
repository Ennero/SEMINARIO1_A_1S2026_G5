const pool = require('../config/db');
const { uploadImageAsset, normalizeBase64 } = require('../aws-services/imageUpload');
const {
  detectLabelsFromImageUrl,
  detectLabelsFromImageBase64,
} = require('../aws-services/rekognition');
const { translateText } = require('../aws-services/translate');

const ALLOWED_TRANSLATE_LANGUAGES = new Set(['es', 'en', 'it', 'pt']);

async function mapPostsWithRelations(postRows) {
  if (postRows.length === 0) {
    return [];
  }

  const postIds = postRows.map((post) => post.id);
  const tagsResult = await pool.query(
    `
      SELECT pt.post_id, t.name, pt.confidence
      FROM post_tags pt
      JOIN tags t ON t.id = pt.tag_id
      WHERE pt.post_id = ANY($1::int[])
      ORDER BY t.name ASC
    `,
    [postIds]
  );

  const commentsResult = await pool.query(
    `
      SELECT c.id, c.post_id, c.content, c.created_at, c.user_id,
             u.username, u.full_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ANY($1::int[])
      ORDER BY c.created_at ASC
    `,
    [postIds]
  );

  const tagsByPost = new Map();
  tagsResult.rows.forEach((tagRow) => {
    if (!tagsByPost.has(tagRow.post_id)) {
      tagsByPost.set(tagRow.post_id, []);
    }
    tagsByPost.get(tagRow.post_id).push({
      name: tagRow.name,
      confidence: Number(tagRow.confidence),
    });
  });

  const commentsByPost = new Map();
  commentsResult.rows.forEach((commentRow) => {
    if (!commentsByPost.has(commentRow.post_id)) {
      commentsByPost.set(commentRow.post_id, []);
    }

    commentsByPost.get(commentRow.post_id).push({
      id: commentRow.id,
      userId: commentRow.user_id,
      username: commentRow.username,
      fullName: commentRow.full_name,
      content: commentRow.content,
      createdAt: commentRow.created_at,
    });
  });

  return postRows.map((post) => ({
    id: post.id,
    userId: post.user_id,
    username: post.username,
    fullName: post.full_name,
    imageUrl: post.image_url,
    description: post.description,
    createdAt: post.created_at,
    tags: tagsByPost.get(post.id) || [],
    comments: commentsByPost.get(post.id) || [],
  }));
}

async function upsertPostLabels({ postId, labels }) {
  if (!labels || labels.length === 0) {
    return;
  }

  for (const label of labels) {
    const tagInsert = await pool.query(
      `
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `,
      [String(label.name || '').toLowerCase()]
    );

    const tagId = tagInsert.rows[0].id;

    await pool.query(
      `
        INSERT INTO post_tags (post_id, tag_id, confidence)
        VALUES ($1, $2, $3)
        ON CONFLICT (post_id, tag_id)
        DO UPDATE SET confidence = EXCLUDED.confidence
      `,
      [postId, tagId, Number(label.confidence || 0)]
    );
  }
}

async function getPosts(req, res) {
  try {
    const { tag, q, limit = 50 } = req.query;

    const values = [];
    const conditions = [];
    let joins = '';

    if (tag) {
      joins += ' JOIN post_tags ptf ON ptf.post_id = p.id JOIN tags tf ON tf.id = ptf.tag_id ';
      values.push(String(tag).toLowerCase());
      conditions.push(`tf.name = $${values.length}`);
    }

    if (q) {
      values.push(`%${String(q).toLowerCase()}%`);
      conditions.push(`LOWER(COALESCE(p.description, '')) LIKE $${values.length}`);
    }

    values.push(Number(limit));

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const postsResult = await pool.query(
      `
        SELECT DISTINCT p.id, p.user_id, p.image_url, p.description, p.created_at,
               u.username, u.full_name
        FROM posts p
        JOIN users u ON u.id = p.user_id
        ${joins}
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${values.length}
      `,
      values
    );

    const posts = await mapPostsWithRelations(postsResult.rows);
    return res.status(200).json({ posts });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while loading posts.' });
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
        SELECT p.id, p.user_id, p.image_url, p.description, p.created_at,
               u.username, u.full_name
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const posts = await mapPostsWithRelations(result.rows);
    return res.status(200).json({ post: posts[0] });
  } catch (error) {
    console.error('getPostById error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while loading the post.' });
  }
}

async function createPost(req, res) {
  try {
    const {
      userId,
      imageBase64,
      imageUrl,
      description,
      fileName,
      contentType,
    } = req.body;

    if (!userId || (!imageBase64 && !imageUrl)) {
      return res.status(400).json({
        error: 'userId and imageBase64 (or imageUrl) are required.',
      });
    }

    const userResult = await pool.query('SELECT id, email FROM users WHERE id = $1 LIMIT 1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    const finalImageUrl = imageUrl
      || await uploadImageAsset({
        imageBase64: normalizeBase64(imageBase64),
        fileName: fileName || `post-${userId}-${Date.now()}.jpg`,
        contentType: contentType || 'image/jpeg',
        email: user.email,
        prefix: 'posts',
      });

    const postResult = await pool.query(
      `
        INSERT INTO posts (user_id, image_url, description)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, image_url, description, created_at
      `,
      [userId, finalImageUrl, description || null]
    );

    const post = postResult.rows[0];

    const labels = imageUrl
      ? await detectLabelsFromImageUrl({ imageUrl: finalImageUrl, maxLabels: 12, minConfidence: 70 })
      : await detectLabelsFromImageBase64({ imageBase64, maxLabels: 12, minConfidence: 70 });

    await upsertPostLabels({ postId: post.id, labels });

    const joined = await pool.query(
      `
        SELECT p.id, p.user_id, p.image_url, p.description, p.created_at,
               u.username, u.full_name
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
      `,
      [post.id]
    );

    const hydrated = await mapPostsWithRelations(joined.rows);

    return res.status(201).json({
      message: 'Post created successfully.',
      post: hydrated[0],
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while creating post.' });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { userId, description } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const updated = await pool.query(
      `
        UPDATE posts
        SET description = $1
        WHERE id = $2 AND user_id = $3
        RETURNING id
      `,
      [description || null, id, userId]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found or not owned by this user.' });
    }

    const postResult = await pool.query(
      `
        SELECT p.id, p.user_id, p.image_url, p.description, p.created_at,
               u.username, u.full_name
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
      `,
      [id]
    );

    const hydrated = await mapPostsWithRelations(postResult.rows);
    return res.status(200).json({ message: 'Post updated.', post: hydrated[0] });
  } catch (error) {
    console.error('updatePost error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while updating post.' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const deleted = await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (deleted.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found or not owned by this user.' });
    }

    return res.status(200).json({ message: 'Post deleted.' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while deleting post.' });
  }
}

async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required.' });
    }

    const postExists = await pool.query('SELECT id FROM posts WHERE id = $1 LIMIT 1', [id]);
    if (postExists.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const commentResult = await pool.query(
      `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, post_id, user_id, content, created_at
      `,
      [id, userId, content]
    );

    return res.status(201).json({ message: 'Comment created.', comment: commentResult.rows[0] });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while adding comment.' });
  }
}

async function translatePostText(req, res) {
  try {
    const { id } = req.params;
    const { targetLanguageCode, commentId } = req.body;

    if (!targetLanguageCode || !ALLOWED_TRANSLATE_LANGUAGES.has(targetLanguageCode)) {
      return res.status(400).json({ error: 'targetLanguageCode must be one of: es, en, it, pt.' });
    }

    if (commentId) {
      const commentResult = await pool.query('SELECT content FROM comments WHERE id = $1 AND post_id = $2 LIMIT 1', [commentId, id]);
      if (commentResult.rowCount === 0) {
        return res.status(404).json({ error: 'Comment not found for this post.' });
      }

      const translated = await translateText({ text: commentResult.rows[0].content, targetLanguageCode });
      return res.status(200).json({ translated, source: 'comment', commentId: Number(commentId) });
    }

    const postResult = await pool.query('SELECT description FROM posts WHERE id = $1 LIMIT 1', [id]);
    if (postResult.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const sourceText = postResult.rows[0].description || '';
    const translated = await translateText({ text: sourceText, targetLanguageCode });
    return res.status(200).json({ translated, source: 'post', postId: Number(id) });
  } catch (error) {
    console.error('translatePostText error:', error);
    return res.status(500).json({ error: error.message || 'Unexpected error while translating text.' });
  }
}

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  translatePostText,
};
