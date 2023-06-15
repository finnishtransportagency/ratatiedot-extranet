module.exports = {
  apps: [
    {
      name: 'npm',
      cwd: '/usr/share/nginx/html',
      script: 'npm',
      args: 'start',
      watch: true,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3000',
      },
    },
  ],
};
