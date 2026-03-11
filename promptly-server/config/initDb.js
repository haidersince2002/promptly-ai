import sql from "./db.js";

// Initializes database schema if missing.
// Safe to run on every startup (uses IF NOT EXISTS guards).
export default async function initDb() {
  // Check if table exists
  const result = await sql`SELECT to_regclass('public.creations') AS exists`;
  if (!result[0].exists) {
    console.log("[DB] Creating table: creations");
  }

  await sql`CREATE TABLE IF NOT EXISTS creations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT,
    content TEXT,
    type TEXT NOT NULL,
    publish BOOLEAN DEFAULT FALSE,
    likes TEXT[] DEFAULT ARRAY[]::text[],
    original_prompt TEXT,
    version INT DEFAULT 1,
    parent_id BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // Add columns if they don't exist (for existing databases)
  await sql`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creations' AND column_name='original_prompt') THEN
      ALTER TABLE creations ADD COLUMN original_prompt TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creations' AND column_name='version') THEN
      ALTER TABLE creations ADD COLUMN version INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creations' AND column_name='parent_id') THEN
      ALTER TABLE creations ADD COLUMN parent_id BIGINT NULL;
    END IF;
  END $$`;

  // Indexes (filtered and regular)
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_publish ON creations(publish) WHERE publish = TRUE`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_type ON creations(type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_parent_id ON creations(parent_id)`;

  // Templates table
  const templateResult = await sql`SELECT to_regclass('public.templates') AS exists`;
  if (!templateResult[0].exists) {
    console.log("[DB] Creating table: templates");
  }

  await sql`CREATE TABLE IF NOT EXISTS templates (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    prompt_template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // Seed default templates if table is empty
  const templateCount = await sql`SELECT COUNT(*) as count FROM templates`;
  if (parseInt(templateCount[0].count) === 0) {
    console.log("[DB] Seeding default templates");
    await sql`INSERT INTO templates (title, description, category, prompt_template) VALUES
      ('LinkedIn Post Generator', 'Create engaging LinkedIn posts that drive engagement and build your professional brand.', 'Social Media', 'Write a professional LinkedIn post about {topic}. Tone: {tone}. Length: {length}. Include relevant hashtags and a call-to-action.'),
      ('Startup Pitch Generator', 'Generate compelling startup pitches for investors and stakeholders.', 'Business', 'Write a startup pitch for a company that {description}. Target audience: {audience}. Key differentiator: {differentiator}. Include problem statement, solution, and market opportunity.'),
      ('Product Description Generator', 'Create persuasive product descriptions that convert browsers into buyers.', 'E-Commerce', 'Write a compelling product description for {product_name}. Key features: {features}. Target customer: {target}. Tone: {tone}. Include benefits and a call-to-action.'),
      ('Email Reply Generator', 'Draft professional email replies quickly and effectively.', 'Communication', 'Write a professional email reply to the following message: "{original_email}". Tone: {tone}. Key points to address: {key_points}. Keep it concise and professional.'),
      ('Blog Outline Generator', 'Create structured blog post outlines with sections and key points.', 'Content', 'Create a detailed blog post outline about {topic}. Target audience: {audience}. Include an introduction, {num_sections} main sections with sub-points, and a conclusion.'),
      ('Social Media Caption', 'Generate catchy social media captions for various platforms.', 'Social Media', 'Write a catchy {platform} caption about {topic}. Tone: {tone}. Include emojis and relevant hashtags. Maximum length: {max_length} characters.')
    `;
  }

  console.log("[DB] Schema ensured.");
}
