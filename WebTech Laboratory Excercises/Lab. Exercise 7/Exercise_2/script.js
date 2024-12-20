const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

function loadTasks() {
    return new Promise((resolve, reject) => {
        const tasks = [];
        fs.createReadStream('zadaci.csv')
            .pipe(csv())
            .on('data', (data) => tasks.push(data))
            .on('end', () => resolve(tasks))
            .on('error', (err) => reject(err));
    });
}

function addTask(task) {
    return new Promise((resolve, reject) => {
        const newLine = `${task.id},${task.naziv},${task.opis}\n`;
        fs.appendFile('zadaci.csv', newLine, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function updateTaskInFile(tasks) {
    return new Promise((resolve, reject) => {
        const updatedData = tasks.map(task => `${task.id},${task.naziv},${task.opis}`).join('\n') + '\n';
        fs.writeFile('zadaci.csv', updatedData, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'forma.html'));
});

app.get('/zadaci', async (req, res) => {
    try {
        const tasks = await loadTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ status: 'Greška prilikom čitanja zadataka.' });
    }
});

app.post('/zadatak', async (req, res) => {
    const { id, naziv, opis } = req.body;

    if (!id || !naziv || !opis) {
        return res.status(400).json({ status: 'Nedostaju podaci u zahtjevu!' });
    }

    try {
        const tasks = await loadTasks();

        const taskExists = tasks.some(task => task.id === id.toString());
        if (taskExists) {
            return res.status(400).send(`
                <h1>Greška</h1>
                <p>ID zadatka već postoji! <a href="/">Vrati se na formu</a></p>
            `);
        }

        await addTask({ id, naziv, opis });
        res.send(`
            <h1>Uspjeh</h1>
            <p>Zadatak je uspješno dodan! <a href="/">Vrati se na formu</a></p>
        `);
    } catch (error) {
        res.status(500).send(`
            <h1>Greška</h1>
            <p>Došlo je do greške prilikom dodavanja zadatka. <a href="/">Vrati se na formu</a></p>
        `);
    }
});

app.put('/zadatak/:id', async (req, res) => {
    const { id } = req.params;
    const { naziv, opis } = req.body;

    if (!naziv || !opis) {
        return res.status(400).json({ status: 'Nedostaju podaci u zahtjevu!' });
    }

    try {
        const tasks = await loadTasks();

        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ status: 'Id ne postoji!' });
        }

        tasks[taskIndex].naziv = naziv;
        tasks[taskIndex].opis = opis;

        await updateTaskInFile(tasks);
        res.json({ status: 'Zadatak je uspjesno azuriran!' });
    } catch (error) {
        res.status(500).json({ status: 'Greška prilikom ažuriranja zadatka.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
