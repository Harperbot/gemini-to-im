// HSS-aware ecosystem config for gemini-to-im
// Secrets 動態從 macOS Keychain (HSS Vault) 取；配置值仍由 .env 載入。
// 2026-04-18 遷移。舊版備份在 ~/.harper/security/hss/migrations/gemini-to-im/backups-*/

const { execSync } = require('child_process');

const PROJECT = 'gemini-to-im';

function vaultGet(key) {
  try {
    return execSync(
      `/usr/bin/security find-generic-password -s "harper-hss.${PROJECT}.${key}" -a harper -w 2>/dev/null`,
      { encoding: 'utf8', shell: '/bin/bash' }
    ).trim();
  } catch {
    console.error(`[hss] ${PROJECT}/${key} not in Vault; set via: hss secret set ${PROJECT} ${key}`);
    return undefined;
  }
}

module.exports = {
  apps: [{
    name: PROJECT,
    script: './index.js',
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      // Secrets from HSS Vault (macOS Keychain)
      TELEGRAM_BOT_TOKEN: vaultGet('TELEGRAM_BOT_TOKEN'),
      GEMINI_API_KEY: vaultGet('GEMINI_API_KEY'),
      TDX_CLIENT_ID: vaultGet('TDX_CLIENT_ID'),
      TDX_CLIENT_SECRET: vaultGet('TDX_CLIENT_SECRET'),
      CWA_API_KEY: vaultGet('CWA_API_KEY'),
    }
  }]
};
