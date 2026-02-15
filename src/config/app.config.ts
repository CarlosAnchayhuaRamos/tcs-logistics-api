export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      user: process.env.POSTGRES_USER || 'logistics_user',
      password: process.env.POSTGRES_PASSWORD || 'logistics_pass',
      db: process.env.POSTGRES_DB || 'logistics_db',
    },
    mongo: {
      uri:
        process.env.MONGODB_URI || 'mongodb://localhost:27017/logistics_tracking',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
