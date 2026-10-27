require('dotenv').config();

const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
  idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
};

// If DATABASE_URL is set (e.g. Neon/Vercel/Railway), use it directly;
// otherwise fall back to individual host/port/user/password/db vars.
const databaseUrl = process.env.DATABASE_URL;

const buildConfig = (logging) => {
  if (databaseUrl) {
    return {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: poolConfig,
      logging,
    };
  }
  return {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    dialect: 'postgres',
    pool: poolConfig,
    logging,
  };
};

module.exports = {
  development: buildConfig(process.env.DB_LOGGING === 'true' ? console.log : false),
  production: buildConfig(false),
};
