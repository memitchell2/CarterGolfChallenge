const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const { JSDOM } = require('jsdom');

const app = express();
const port = 3000;

// Middleware to handle CORS
app.use(cors());

// Middleware to handle JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to fetch ESPN data
app.get('/fetch-espn', async (req, res) => {
    try {
        const response = await fetch('https://www.espn.com/golf/leaderboard/_/tournamentId/401580351');
        const text = await response.text();

        // Write the fetched HTML content to a file for inspection
        fs.writeFileSync('fetched.html', text);

        res.send(text);
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
        res.status(500).send('Error fetching data');
    }
});

const csvWriter = createCsvWriter({
    path: 'responses.csv',
    header: [
        { id: 'Username', title: 'Username' },
        { id: 'Tier A', title: 'Tier A' },
        { id: 'Tier B', title: 'Tier B' },
        { id: 'Tier C', title: 'Tier C' },
        { id: 'Tier D', title: 'Tier D' },
        { id: 'Tier E', title: 'Tier E' },
        { id: 'Tier F', title: 'Tier F' }
    ],
    append: true
});

app.post('/submit', (req, res) => {
    const { username, tierA, tierB, tierC, tierD, tierE, tierF } = req.body;
    const record = [{
        Username: username,
        'Tier A': tierA.join(','),
        'Tier B': tierB.join(','),
        'Tier C': tierC.join(','),
        'Tier D': tierD.join(','),
        'Tier E': tierE.join(','),
        'Tier F': tierF.join(',')
    }];

    csvWriter.writeRecords(record)
        .then(() => {
            res.send('Your selections have been recorded successfully!');
        })
        .catch((error) => {
            console.error('Error writing to CSV:', error);
            res.status(500).send('An error occurred while recording your selections.');
        });
});

app.get('/leaderboard', async (req, res) => {
    try {
        // Fetch ESPN leaderboard data
        const leaderboardResponse = await fetch('http://localhost:3000/fetch-espn');
        const leaderboardHtml = await leaderboardResponse.text();

        // Parse the leaderboard data
        const leaderboard = parseLeaderboard(leaderboardHtml);

        // Read and parse user responses
        const responses = await readCsv('responses.csv');

        // Calculate scores for each user
        const scores = calculateScores(responses, leaderboard);

        // Sort users by their total scores
        scores.sort((a, b) => a.totalScore - b.totalScore);

        res.json(scores);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).send('Error fetching leaderboard data');
    }
});

function parseLeaderboard(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const playerRows = document.querySelectorAll('.Table__TBODY .PlayerRow__Overview');
    const leaderboard = [];

    playerRows.forEach(row => {
        const playerNameElement = row.querySelector('.plyr .leaderboard_player_name');
        const playerPositionElement = row.querySelector('.pos');
        const playerToParElement = row.querySelector('.Table__TD:nth-child(4)');

        if (playerNameElement && playerPositionElement) {
            const playerName = playerNameElement.innerText.trim();
            let playerPosition = playerPositionElement.innerText.trim();
            const playerToPar = playerToParElement.innerText.trim();

            if (playerToPar === 'CUT') {
                playerPosition = 79;
            } else {
                playerPosition = parseInt(playerPosition.replace('T', ''), 10);
            }

            leaderboard.push({ name: playerName, position: playerPosition });
        }
    });

    return leaderboard;
}

function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

function calculateScores(responses, leaderboard) {
    // Create a map of player names to their positions for quick lookup
    const leaderboardMap = leaderboard.reduce((map, player) => {
        map[player.name.toLowerCase().trim()] = player.position;
        return map;
    }, {});

    console.log("Leaderboard Map:", leaderboardMap);

    return responses.map(response => {
        const tiers = ['Tier A', 'Tier B', 'Tier C', 'Tier D', 'Tier E', 'Tier F'];
        let totalScore = 0;

        tiers.forEach(tier => {
            const players = response[tier] ? response[tier].split(',') : [];
            players.forEach(player => {
                const normalizedPlayerName = player.trim().toLowerCase();
                const position = leaderboardMap[normalizedPlayerName] || 79;
                totalScore += position;
                console.log(`User: ${response.Username}, Player: ${player.trim()}, Position: ${position}, Total Score: ${totalScore}`);
            });
        });

        return { username: response.Username, totalScore };
    });
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
