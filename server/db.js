require('dotenv').config();
const { Pool } = require('pg');

// Set DATABASE_SSL=true only if your hosting provider requires an SSL connection
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
