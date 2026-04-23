import dotenv from 'dotenv';
dotenv.config();

export const config = {
  BOT_NAME: 'TEDDY-XMD',
  BOT_VERSION: '2.0.0',
  OWNER_NAME: 'Teddy Tech',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '254712345678',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/teddy-xmd',
  SESSION_B64: process.env.SESSION_B64 || '',
  DREADED_API: 'https://api.dreaded.site',
  DEFAULT_PREFIX: '.',
  DEFAULT_MODE: 'public',
  SESSION_PATH: './session',
  TEMP_PATH: './temp',
  PORT: process.env.PORT || 3000,
  MSG: {
    OWNER_ONLY: '❌ *Owner only command*',
    ADMIN_ONLY: '❌ *Admin only command*',
    GROUP_ONLY: '❌ *Group command only*',
    BOT_ADMIN: '❌ *Bot must be admin*',
    ERROR: '❌ *Error occurred*\n\nTry again later'
  }
};

if (!config.OWNER_NUMBER) {
  console.error('❌ OWNER_NUMBER missing in .env');
  process.exit(1);
}

if (!config.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}