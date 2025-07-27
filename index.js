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

    const allowedTypes = ['full game', 'game', 'full', 'free'];

   const filteredGames = data.filter(game => {
  // Normalize price to a number (or NaN if missing)
  const priceNum = Number(game.price);
  const isFreeByPrice = !isNaN(priceNum) && priceNum === 0;

  // Check isFree flag explicitly for boolean true
  const isFreeByFlag = game.isFree === true;

  // Check allowed types lowercase safely
  const typeAllowed = game.type && allowedTypes.some(type => game.type.toLowerCase().includes(type));

  // Platform might be string or array - handle both
  let isSteam = false;
  if (Array.isArray(game.platform)) {
    isSteam = game.platform.some(p => p.toLowerCase().includes('steam'));
  } else if (typeof game.platform === 'string') {
    isSteam = game.platform.toLowerCase().includes('steam');
  }

  // Debug log for each game considered
  console.log(`Game: "${game.title}", price: ${game.price}, isFree: ${game.isFree}, type: ${game.type}, platform: ${game.platform}, isFreeByPrice: ${isFreeByPrice}, isFreeByFlag: ${isFreeByFlag}, typeAllowed: ${typeAllowed}, isSteam: ${isSteam}`);

  return (isFreeByPrice || isFreeByFlag) && (typeAllowed || isSteam);
});


    let message = '🎮 Free Games: ';

    if (filteredGames.length === 0) {
      message += 'No full games available right now. Check back later!';
    } else {
      const paginatedGames = filteredGames.slice(start, end).map(game => {
        const worth = game.worth || 'Free';
        return `${game.title} [${worth}] ➜ ${game.open_giveaway_url}`;
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

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
