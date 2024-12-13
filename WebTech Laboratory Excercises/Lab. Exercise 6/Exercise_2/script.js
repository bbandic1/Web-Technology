const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

function hashPassword(password) {
    const hashed = password.split('').map(char => String.fromCharCode((char.charCodeAt(0) % 16) + 55)).join('');
    console.log(`[LOG] Hashed password for '${password}': ${hashed}`);
    return hashed;
}

function loadUsers() {
    return new Promise((resolve, reject) => {
        const users = [];
        fs.createReadStream('users.csv')
            .pipe(csv())
            .on('data', (data) => {
                console.log(`[LOG] Loaded user: ${JSON.stringify(data)}`);
                users.push(data);
            })
            .on('end', () => {
                console.log(`[LOG] All users loaded: ${JSON.stringify(users)}`);
                resolve(users);
            })
            .on('error', (err) => {
                console.error(`[ERROR] Error loading users: ${err.message}`);
                reject(err);
            });
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[LOG] Login attempt: username='${username}', password='${password}'`);

    try {
        const hashedPassword = hashPassword(password);
        const users = await loadUsers();

        const user = users.find(u => u.username === username && u.password === hashedPassword);
        const timestamp = new Date().toISOString();
        let response = '';

        if (user) {
            console.log(`[LOG] User found: ${JSON.stringify(user)}`);
            response = `
            <response>
                <success>true</success>
                <timestamp>${timestamp}</timestamp>
                <user>
                    <username>${user.username}</username>
                    <name>${user.name}</name>
                    <surname>${user.surname}</surname>
                    <role>${user.role}</role>
                </user>
            </response>
            `;
        } else {
            console.log(`[LOG] User not found or password hash does not match.`);
            response = `
            <response>
                <success>false</success>
                <timestamp>${timestamp}</timestamp>
                <user>
                    <username>${username}</username>
                </user>
            </response>
            `;
        }

        res.set('Content-Type', 'application/xml');
        res.send(response);
    } catch (error) {
        console.error(`[ERROR] Error during login process: ${error.message}`);
        res.status(500).send('<response><success>false</success><message>Server error</message></response>');
    }
});

app.listen(8080, () => {
    console.log('Server running at http://localhost:8080');
});
