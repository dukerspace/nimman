module.exports = {
  apps: [
    {
      name: 'api',
      script: 'npm',
      args: 'run start:prod',
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
      args: 'run preview',
      env_dev: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      cwd: '/var/www/nimman/project/apps/web'
    }
  ]
}
