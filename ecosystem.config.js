export default {
  apps: [{
    name: "growup-api",
    script: "dist/index.js",
    instances: "max",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    interpreter_args: "--experimental-specifier-resolution=node", // هذا السطر المهم
    env: {
      NODE_ENV: "production",
      DB_HOST: "your_db_host"
    }
  }]
}