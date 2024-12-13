const http = require('http');
const fs = require('fs');

const PORT = 8080;
const FILE_NAME = 'imenik.txt';

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Read the file
        fs.readFile(FILE_NAME, 'utf-8', (err, data) => {
            if (err) {
                // Handle file read error
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Could not read the file' }));
                return;
            }

            // Parse file content
            const rows = data.split('\n').filter(row => row.trim() !== ''); // Split by newline and filter out empty lines
            const jsonData = rows.map(row => {
                const [ime, prezime, adresa, broj_telefona] = row.split(',');
                return {
                    ime: ime.trim(),
                    prezime: prezime.trim(),
                    adresa: adresa.trim(),
                    broj_telefona: broj_telefona.trim()
                };
            });

            // Respond with JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(jsonData));
        });
    } else {
        // Handle unsupported routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
