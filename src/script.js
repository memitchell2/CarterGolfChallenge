document.addEventListener("DOMContentLoaded", function() {
    const url = 'http://localhost:3000/fetch-espn';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const playerRows = doc.querySelectorAll('.Table__TBODY .PlayerRow__Overview');

            const tbody = document.querySelector('#leaderboard tbody');
            tbody.innerHTML = '';

            if (playerRows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No players found.</td></tr>';
                return;
            }

            playerRows.forEach(row => {
                const playerPositionElement = row.querySelector('.Table__TD:nth-child(2)'); // Adjust the selector if needed
                const playerNameElement = row.querySelector('.plyr .leaderboard_player_name');
                const playerToParElement = row.querySelector('.Table__TD:nth-child(4)');

                if (playerPositionElement && playerNameElement && playerToParElement) {
                    const playerPosition = playerPositionElement.innerText.trim();
                    const playerName = playerNameElement.innerText.trim();
                    const playerToPar = playerToParElement.innerText.trim();

                    const tr = document.createElement('tr');
                    const positionTd = document.createElement('td');
                    const nameTd = document.createElement('td');
                    const scoreTd = document.createElement('td');

                    positionTd.textContent = playerPosition;
                    nameTd.textContent = playerName;
                    scoreTd.textContent = playerToPar;

                    tr.appendChild(positionTd);
                    tr.appendChild(nameTd);
                    tr.appendChild(scoreTd);
                    tbody.appendChild(tr);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const tbody = document.querySelector('#leaderboard tbody');
            tbody.innerHTML = `<tr><td colspan="3">Failed to load content: ${error.message}</td></tr>`;
        });
});
