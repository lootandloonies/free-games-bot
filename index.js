const express = require('express');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/free-games', async (req, res) => {
  try {
    const response = await fetch('https://www.gamerpower.com/api/giveaways?platform=pc');
    const data = await response.json();

    // Debug: log all unique types returned by the API
    console.log('Types returned:', [...new Set(data.map(game => game.type))]);
    data.forEach(game => {
  console.log(`Title: "${game.title}", Type: "${game.type}"`);
});


    // Looser filter: type contains "full" (case-insensitive)
    const allowedTypes = ['full game', 'game', 'full'];

const filteredGames = data.filter(game =>
  game.type &&
  allowedTypes.some(type =>
    game.type.toLowerCase().includes(type)
  )
);


    let message = '🎮 Free Games: ';

    if (filteredGames.length === 0) {
      message += 'No full games available right now. Check back later!';
    } else {
      const freeGames = filteredGames.slice(0, 3).map(game => {
        const worth = game.worth || 'Free';
        return `${game.title} [${worth}] ➜ ${game.open_giveaway_url}`;
      });

      message += freeGames.join(' | ');

      if (message.length > 400) {
        message = message.slice(0, 397) + '...';
      }
    }

    res.send(message);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).send('Failed to fetch free games');
  }
});

app.get('/free-betas', async (req, res) => {
  try {
    const response = await fetch('https://www.gamerpower.com/api/giveaways?platform=pc');
    const data = await response.json();

    const filteredBetas = data.filter(game =>
      game.type.toLowerCase().includes('beta') ||
      game.type.toLowerCase().includes('early access')
    );

    const betaGames = filteredBetas.slice(0, 3).map(game => {
      const worth = game.worth || 'Free';
      return `${game.title} [${worth}] ➜ ${game.open_giveaway_url}`;
    });

    let message = '🧪 Betas & Early Access: ' + betaGames.join(' | ');

    if (message.length > 400) {
      message = message.slice(0, 397) + '...';
    }

    res.send(message);
  } catch (error) {
    console.error('Error fetching betas:', error);
    res.status(500).send('Failed to fetch betas');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
