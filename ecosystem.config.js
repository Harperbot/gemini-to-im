module.exports = {
  apps: [{
    name: "gemini-to-im",
    script: "./index.js",
    watch: false,
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "production",
    }
  }]
}