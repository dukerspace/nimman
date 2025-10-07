module.exports = {
  apps: [
    {
      name: 'api',
      script: 'npm',
      args: 'run start',
      env_dev: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      cwd: '/var/www/nimman/project/apps/api'
    },
    {
      name: 'ui',
      script: 'npm',
      args: 'run start',
      env_dev: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      cwd: '/var/www/nimman/project/apps/web'
    }
  ]
