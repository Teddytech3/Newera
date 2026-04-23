import axios from 'axios';
import { replyText } from '../../utils/reply.js';

export default {
  name: 'joke',
  alias: ['jokes'],
  desc: 'Get random joke',
  run: async (sock, m) => {
    try {
      const res = await axios.get('https://api.dreaded.site/api/joke');
      if (!res.data.success) throw new Error('Failed');

      const joke = res.data.joke;
      await replyText(sock, m, `*😂 Random Joke*\n\n${joke}\n\n_Powered by TEDDY-XMD_`);
    } catch (e) {
      // Fallback jokes
      const jokes = [
        'Why don\'t scientists trust atoms? Because they make up everything!',
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
        'Why did the scarecrow win an award? He was outstanding in his field!',
        'What do you call a fake noodle? An impasta!',
        'Why don\'t skeletons fight each other? They don\'t have the guts.'
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      await replyText(sock, m, `*😂 Random Joke*\n\n${randomJoke}\n\n_Powered by TEDDY-XMD_`);
    }
  }
};