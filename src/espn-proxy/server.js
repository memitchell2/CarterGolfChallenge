const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
        {id: 'username', title: 'Username'},
        {id: 'tierA', title: 'Tier A'},
        {id: 'tierB', title: 'Tier B'},
        {id: 'tierC', title: 'Tier C'},
        {id: 'tierD', title: 'Tier D'},
        {id: 'tierE', title: 'Tier E'},
        {id: 'tierF', title: 'Tier F'}
    ],
    append: true
});

app.post('/submit', (req, res) => {
    const { username, tierA, tierB, tierC, tierD, tierE, tierF } = req.body;
    const record = [{ username, tierA: tierA.join(','), tierB: tierB.join(','), tierC: tierC.join(','), tierD: tierD.join(','), tierE: tierE.join(','), tierF: tierF.join(',') }];

    csvWriter.writeRecords(record)
        .then(() => {
            res.send('Your selections have been recorded successfully!');
        })
        .catch((error) => {
            console.error('Error writing to CSV:', error);
            res.status(500).send('An error occurred while recording your selections.');
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
