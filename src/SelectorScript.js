document.addEventListener("DOMContentLoaded", function() {
    // Path to your CSV file
    const csvFilePath = 'http://localhost:8000/Tier.csv';

    // Function to populate dropdowns based on CSV data
    function populateDropdowns(data) {
        const tiers = {
            A: document.querySelector('#tierA select'),
            B: document.querySelector('#tierB select'),
            C: document.querySelector('#tierC select'),
            D: document.querySelector('#tierD select'),
            E: document.querySelector('#tierE select'),
            F: document.querySelector('#tierF select')
        };

        // Clear previous options
        for (let tier in tiers) {
            if (tiers.hasOwnProperty(tier)) {
                tiers[tier].innerHTML = '';
            }
        }

        data.forEach(row => {
            // For each row, handle each tier separately
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    const tier = key.split(' ')[1]; // Extract the tier (A, B, C, etc.)
                    const player = row[key];

                    if (tiers[tier] && player) {
                        const option = document.createElement('option');
                        option.value = player;
                        option.textContent = player;
                        tiers[tier].appendChild(option);
                    }
                }
            }
        });
    }

    // Read the CSV file
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            console.log('Parsed CSV Data:', results.data); // Log the parsed data to the console for debugging
            populateDropdowns(results.data);
        },
        error: function(error) {
            console.error('Error fetching data:', error.message);
        }
    });

    // Handle form submission
    document.getElementById('playerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const output = document.getElementById('output');

        const username = formData.get('username');
        const selections = {
            tierA: formData.getAll('tierA'),
            tierB: formData.getAll('tierB'),
            tierC: formData.getAll('tierC'),
            tierD: formData.getAll('tierD'),
            tierE: formData.getAll('tierE'),
            tierF: formData.getAll('tierF')
        };

        output.innerHTML = '<h2>Your Selections</h2>';

        if (!username) {
            output.innerHTML += `<p>Please enter a username.</p>`;
            return;
        }

        let valid = true;
        for (const [tier, players] of Object.entries(selections)) {
            if (players.length !== 3) {
                output.innerHTML += `<p>You must select exactly 3 players from ${tier}. You selected ${players.length}.</p>`;
                valid = false;
            }
        }

        if (valid) {
            const payload = {
                username,
                tierA: selections.tierA,
                tierB: selections.tierB,
                tierC: selections.tierC,
                tierD: selections.tierD,
                tierE: selections.tierE,
                tierF: selections.tierF
            };

            fetch('http://localhost:3000/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.text())
            .then(data => {
                output.innerHTML += `<p>${data}</p>`;
            })
            .catch(error => {
                console.error('Error:', error);
                output.innerHTML += `<p>An error occurred: ${error.message}</p>`;
            });

            output.innerHTML += `<h3>Username: ${username}</h3>`;
            for (const [tier, players] of Object.entries(selections)) {
                output.innerHTML += `<h3>${tier}</h3>`;
                output.innerHTML += '<ul>';
                players.forEach(player => {
                    output.innerHTML += `<li>${player}</li>`;
                });
                output.innerHTML += '</ul>';
            }
        }
    });
});
