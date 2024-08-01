const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
