const express = require('express');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/free-games', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 3;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const response = await fetch('https://www.gamerpower.com/api/giveaways?platform=pc');
    const data = await response.json();
    console.log(`API returned ${data.length} games.`);
console.log('Sample games:', data.slice(0, 5).map(g => g.title));


    console.log('API sample data (first 5 games):', data.slice(0, 5)); // Debug log

    const allowedTypes = ['game', 'full', 'giveaway', 'key'];

const filteredGames = data.filter(game => {
  const type = (game.type || '').toLowerCase();
  const platform = (game.platform || '').toLowerCase();

  const isGame = allowedTypes.some(t => type.includes(t));
  const isPlatformInteresting = platform.includes('steam') || platform.includes('epic') || platform.includes('itch');

  // Optional: log some examples
  console.log(`Title: "${game.title}" | Type: "${type}" | Platform: "${platform}" | isGame: ${isGame} | isPlatformInteresting: ${isPlatformInteresting}`);

  return isGame || isPlatformInteresting;
});



    let message = '🎮 Free Games: ';

    if (filteredGames.length === 0) {
      message += 'No full games available right now. Check back later!';
    } else {
      const paginatedGames = filteredGames.slice(start, end).map(game => {
  const worth = game.worth || 'Free';
  const title = game.title || '';
  const url = game.open_giveaway_url || '';
  const platform = (game.platform || '').toLowerCase();

  // Platform detection
  let platformLabel = '';
  if (url.includes('steam') || title.toLowerCase().includes('steam') || platform.includes('steam')) {
    platformLabel = 'Steam';
  } else if (url.includes('epic') || title.toLowerCase().includes('epic') || platform.includes('epic')) {
    platformLabel = 'Epic';
  } else if (url.includes('itch') || title.toLowerCase().includes('itch') || platform.includes('itch')) {
    platformLabel = 'Itch.io';
  } else {
    platformLabel = 'PC';
  }

  return `${title} [${platformLabel}, ${worth}] ➜ ${url}`;
});


      if (paginatedGames.length === 0) {
        message += `No games found on page ${page}.`;
      } else {
        message += paginatedGames.join(' | ');

        const totalPages = Math.ceil(filteredGames.length / pageSize);
        message += ` (Page ${page} of ${totalPages})`;
      }

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
app.get('/free-steam', (req, res) => {
  const steamFreeGames = [
    {
      title: 'RogueStone',
      url: 'https://store.steampowered.com/app/1955990/RogueStone/',
      worth: 'Free'
    },
    // Add more Steam freebies here
  ];

  const message = steamFreeGames.map(game => `${game.title} [${game.worth}] ➜ ${game.url}`).join(' | ');

  res.send(`🎮 Free Steam Games: ${message}`);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
