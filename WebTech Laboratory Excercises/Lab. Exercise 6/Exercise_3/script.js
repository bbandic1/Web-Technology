const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  

function hashPassword(password) {
    const hashed = password.split('').map(char => String.fromCharCode((char.charCodeAt(0) % 16) + 55)).join('');
    console.log(`[LOG] Hash password-a za '${password}': ${hashed}`);
    return hashed;
}

function loadUsers() {
    return new Promise((resolve, reject) => {
        const users = [];
        fs.createReadStream('users.csv')
            .pipe(csv())
            .on('data', (data) => {
                console.log(`[LOG] Učitani korisnik: ${JSON.stringify(data)}`);
                users.push(data);
            })
            .on('end', () => {
                console.log(`[LOG] Svi korisnici učitani: ${JSON.stringify(users)}`);
                resolve(users);
            })
            .on('error', (err) => {
                console.error(`[ERROR] Greska pri učitavanju korisnika: ${err.message}`);
                reject(err);
            });
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[LOG] Prijava pokušaj: username='${username}', password='${password}'`);

    try {
        const hashedPassword = hashPassword(password);
        const users = await loadUsers();

        const user = users.find(u => u.username === username && u.password === hashedPassword);
        const timestamp = new Date().toISOString();
        let response = '';

        if (user) {
            console.log(`[LOG] Korisnik pronađen: ${JSON.stringify(user)}`);

            let additionalParams = {};
            if (req.query.val1) {
                additionalParams.val1 = user[req.query.val1] || "No such field";
            }
            if (req.query.val2) {
                additionalParams.val2 = user[req.query.val2] || "No such field";
            }

            response = {
                success: true,
                timestamp: timestamp,
                user: {
                    username: user.username,
                    name: user.name,
                    surname: user.surname,
                    role: user.role
                },
                additionalParams: additionalParams
            };

        } else {
            console.log(`[LOG] Korisnik nije pronađen ili hash password-a ne odgovara.`);
            response = {
                success: false,
                timestamp: timestamp,
                message: "Invalid username or password"
            };
        }

        res.set('Content-Type', 'application/json');
        res.send(response);
    } catch (error) {
        console.error(`[ERROR] Greska tokom login procesa: ${error.message}`);
        res.status(500).send({
            success: false,
            message: "Server error"
        });
    }
});

app.listen(8080, () => {
    console.log('Server pokrenut na http://localhost:8080');
});