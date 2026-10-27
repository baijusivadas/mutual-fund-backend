// ecosystem.config.js — PM2 production configuration
// Usage:
//   npm install -g pm2
//   pm2 start ecosystem.config.js --env production
//   pm2 save && pm2 startup   (auto-restart on reboot)

module.exports = {
  apps: [
    {
      name: 'mutual-fund-backend',
      script: 'app.js',

      // ── Clustering ─────────────────────────────────────────────────────────
      // 'max' = one worker per CPU core; change to a number to cap workers.
      instances: process.env.WEB_CONCURRENCY || 'max',
      exec_mode: 'cluster',

      // ── Environment ────────────────────────────────────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },

      // ── Reliability ────────────────────────────────────────────────────────
      max_memory_restart: '512M',
      restart_delay: 3000,
      max_restarts: 10,

      // ── Logging ────────────────────────────────────────────────────────────
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // ── Watch (disable in production) ──────────────────────────────────────
      watch: false,
    },
  ],
};
