const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const csv = require('csv-parser');

// Fetch the latest leaderboard data
async function fetchLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/fetch-espn');
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const leaderboard = [];
        const playerRows = doc.querySelectorAll('.Table__TBODY .PlayerRow__Overview');

        playerRows.forEach(row => {
            const playerPositionElement = row.querySelector('.Table__TD:nth-child(2)');
            const playerNameElement = row.querySelector('.plyr .leaderboard_player_name');

            if (playerPositionElement && playerNameElement) {
                const playerPosition = parseInt(playerPositionElement.innerText.trim(), 10);
                const playerName = playerNameElement.innerText.trim();
                leaderboard.push({ name: playerName, position: playerPosition });
            }
        });

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
    }
}

// Read the responses.csv file
function readResponses(filePath) {
    return new Promise((resolve, reject) => {
        const responses = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => responses.push(data))
            .on('end', () => resolve(responses))
            .on('error', (error) => reject(error));
    });
}

// Calculate scores for each user
function calculateScores(leaderboard, responses) {
    const scores = responses.map(response => {
        const selections = [
            ...response['tierA'].split(','),
            ...response['tierB'].split(','),
            ...response['tierC'].split(','),
            ...response['tierD'].split(','),
            ...response['tierE'].split(','),
            ...response['tierF'].split(',')
        ];

        const totalScore = selections.reduce((score, player) => {
            const leaderboardEntry = leaderboard.find(entry => entry.name === player.trim());
            return leaderboardEntry ? score + leaderboardEntry.position : score;
        }, 0);

        return { username: response.username, totalScore };
    });

    return scores.sort((a, b) => a.totalScore - b.totalScore);
}

// Main function to rank users
async function rankUsers() {
    const leaderboard = await fetchLeaderboard();
    const responses = await readResponses('responses.csv');
    const scores = calculateScores(leaderboard, responses);

    console.log('User Rankings:');
    scores.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} - Total Score: ${user.totalScore}`);
    });
}

// Run the ranking process
rankUsers();
