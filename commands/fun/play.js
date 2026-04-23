import { replyText } from '../../utils/reply.js';

const games = {
  dice: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
  coin: ['Heads', 'Tails'],
  rps: ['Rock 🪨', 'Paper 📄', 'Scissors ✂️']
};

export default {
  name: 'play',
  alias: ['game'],
  desc: 'Play mini games',
  run: async (sock, m, args) => {
    const game = args[0]?.toLowerCase();
    const choice = args[1]?.toLowerCase();

    if (!game) {
      return replyText(sock, m, `*🎮 MINI GAMES*\n\n*Usage:*\n.play dice - Roll dice\n.play coin - Flip coin\n.play rps <rock/paper/scissors> - Rock Paper Scissors\n.play 8ball <question> - Magic 8 Ball\n\nExample:.play rps rock`);
    }

    if (game === 'dice') {
      const roll = games.dice[Math.floor(Math.random() * 6)];
      return replyText(sock, m, `🎲 *You rolled:* ${roll}`);
    }

    if (game === 'coin') {
      const flip = games.coin[Math.floor(Math.random() * 2)];
      return replyText(sock, m, `🪙 *Coin flip:* ${flip}`);
    }

    if (game === 'rps') {
      if (!choice) return replyText(sock, m, '❌ *Choose:* rock, paper, or scissors\n\nExample:.play rps rock');

      const bot = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
      const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

      let result;
      if (choice === bot) result = '🤝 *Draw!*';
      else if (
        (choice === 'rock' && bot === 'scissors') ||
        (choice === 'paper' && bot === 'rock') ||
        (choice === 'scissors' && bot === 'paper')
      ) result = '🎉 *You win!*';
      else result = '😢 *You lose!*';

      return replyText(sock, m, `*Rock Paper Scissors*\n\nYou: ${emojis[choice]} ${choice}\nBot: ${emojis[bot]} ${bot}\n\n${result}`);
    }

    if (game === '8ball') {
      const question = args.slice(1).join(' ');
      if (!question) return replyText(sock, m, '❌ *Ask a question*\n\nExample:.play 8ball Will I be rich?');

      const answers = [
        'Yes ✅', 'No ❌', 'Maybe 🤔', 'Definitely! 💯', 'Never 😂',
        'Ask again later 🔮', 'Absolutely! 🎉', 'I doubt it 😅', 'Signs point to yes ✨'
      ];
      const answer = answers[Math.floor(Math.random() * answers.length)];
      return replyText(sock, m, `*🎱 Magic 8 Ball*\n\n*Q:* ${question}\n*A:* ${answer}`);
    }

    await replyText(sock, m, '❌ *Invalid game*\n\nAvailable: dice, coin, rps, 8ball');
  }
};