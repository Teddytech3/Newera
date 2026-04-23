import mongoose from 'mongoose';

// 1. CONFIG SCHEMA - For bot settings/toggles
const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

ConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 2. GROUP SCHEMA - For group-specific settings
const GroupSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  welcome: { type: Boolean, default: false },
  antilink: { type: Boolean, default: false },
  antibot: { type: Boolean, default: false },
  reactEmojis: { type: [String], default: ['❤️', '🔥', '😂', '😮', '😢', '🙏'] },
  nsfw: { type: Boolean, default: false },
  mute: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 3. USER SCHEMA - For banned users, warnings
const UserSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  banned: { type: Boolean, default: false },
  warnings: { type: Number, default: 0 },
  name: { type: String, default: '' },
  lastSeen: { type: Date, default: Date.now },
  cmdCount: { type: Number, default: 0 }
});

// 4. BOT SCHEMA - For multi-bot connections
const BotSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  session: { type: String, required: true },
  active: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now },
  lastConnected: { type: Date, default: Date.now }
});

// 5. MESSAGE SCHEMA - For anti-delete storage (optional)
const MessageSchema = new mongoose.Schema({
  msgId: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
});

// TTL index - auto delete messages after 24h to save space
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export const Config = mongoose.model('Config', ConfigSchema);
export const Group = mongoose.model('Group', GroupSchema);
export const User = mongoose.model('User', UserSchema);
export const Bot = mongoose.model('Bot', BotSchema);
export const Message = mongoose.model('Message', MessageSchema);