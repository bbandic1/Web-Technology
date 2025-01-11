const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'tajna sifra',  
  resave: true,           
  saveUninitialized: false,   
  cookie: {
    secure: false,         
    httpOnly: true,       
  }
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

const logAttempt = (username, status) => {
  const timestamp = new Date().toISOString(); // Get the current date and time
  const logMessage = `[${timestamp}] - username: "${username}" - status: "${status}"\n`;
  
  fs.appendFile('prijave.txt', logMessage, (err) => {
    if (err) {
      console.error("Failed to log attempt", err);
    }
  });
};

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

const loginAttempts = {}; // In-memory store for login attempts (should be persisted for production)

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const currentTime = Date.now();

  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);

    // Fetch the user data from in-memory store or initialize a new entry
    const userData = loginAttempts[username] || { count: 0, blockedUntil: 0 };

    // Check if the user is blocked due to too many failed login attempts
    if (currentTime < userData.blockedUntil) {
      return res.status(429).json({ greska: 'Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.' });
    }

    // Find the user by username
    const korisnik = korisnici.find(user => user.username === username);

    if (!korisnik) {
      // User not found, handle failed login
      loginAttempts[username] = { count: userData.count + 1, blockedUntil: 0 };
      logAttempt(username, 'neuspješno');
      return res.status(401).json({ greska: 'Neispravan korisnički naziv ili lozinka' });
    }

    // Temporarily using string comparison for testing
    const isPasswordMatched = password === korisnik.password;
    // const isPasswordMatched = await bcrypt.compare(password, korisnik.password); // Use bcrypt in production

    if (isPasswordMatched) {
      req.session.username = korisnik.username;
      loginAttempts[username] = { count: 0, blockedUntil: 0 }; // Reset the count and block time on successful login
      logAttempt(username, 'uspješno');
      return res.status(200).json({ message: 'Uspješna prijava' });
    } else {
      // Handle failed login
      loginAttempts[username] = {
        count: userData.count + 1,
        blockedUntil: userData.count + 1 >= 3 ? currentTime + 60000 : 0, // Block user for 1 minute after 3 failed attempts
      };

      logAttempt(username, 'neuspješno');

      if (loginAttempts[username].count >= 3) {
        return res.status(429).json({ greska: 'Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.' });
      }

      return res.status(401).json({ greska: 'Neispravan korisnički naziv ili lozinka' });
    }
  } catch (err) {
    console.error('Greška pri čitanju korisnika:', err);
    return res.status(500).json({ greska: 'Interna greška servera' });
  }
});


/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

app.get('/nekretnine/top5', async (req, res) => {
  console.log(req.session.username);
  const lokacija = req.query.lokacija; 

  if (!lokacija) {
    return res.status(400).json({ greska: 'Lokacija nije navedena.' });
  }

  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'nekretnine.json'), 'utf-8');
    const nekretnine = JSON.parse(data);

    const filteredNekretnine = nekretnine.filter((nekretnina) => nekretnina.lokacija === lokacija);

    filteredNekretnine.sort((a, b) => new Date(b.datumObjave) - new Date(a.datumObjave));

    const top5 = filteredNekretnine.slice(0, 5);

    res.status(200).json(top5);
  } catch (error) {
    console.error('Greška pri dohvaćanju nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/upit', async (req, res) => {
  console.log(req.session.username);
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { id, tekst_upita } = req.body;

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');

    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      return res.status(400).json({ greska: 'Korisnik nije pronađen' });
    }

    const nekretnina = nekretnine.find((property) => property.id === id);

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${id} ne postoji` });
    }

    const korisnikoviUpiti = nekretnina.upiti.filter(
      (upit) => upit.korisnik_id === loggedInUser.id
    );

    if (korisnikoviUpiti.length >= 3) {
      return res.status(429).json({ greska: 'Previše upita za istu nekretninu.' });
    }

    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita,
    });

    await fs.writeFile('data/nekretnine.json', JSON.stringify(nekretnine, null, 2));

    res.status(200).json({ poruka: 'Upit je uspješno dodat.' });
  } catch (err) {
    console.error('Greška:', err);
    res.status(500).json({ greska: 'Interna greška servera' });
  }
});


app.get('/upiti/moji', async (req, res) => {
  console.log('Početak GET zahtjeva za /upiti/moji');
  console.log('Korisničko ime iz sesije:', req.session.username);

  if (!req.session.username) { 
    console.log('Neautorizovan pristup: korisnik nije prijavljen');
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    console.log('Dohvaćam korisnike...');
    const korisniciData = await readJsonFile('korisnici');
    const loggedInUsername = req.session.username;
    console.log('Korisničko ime za filtriranje upita:', loggedInUsername);

    const korisnik = korisniciData.find(user => user.username === loggedInUsername);
    if (!korisnik) {
      console.log('Korisnik nije pronađen');
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }
    const korisnikId = korisnik.id;
    console.log('Korisnički ID:', korisnikId);

    console.log('Dohvaćam nekretnine...');
    const nekretnine = await readJsonFile('nekretnine');

    const korisnikoviUpiti = nekretnine.flatMap((nekretnina) => {
      console.log(`Provjeravam nekretninu: ${nekretnina.naziv}`);
      return nekretnina.upiti
        .filter((upit) => upit.korisnik_id === korisnikId)
        .map((upit) => {
          console.log(`Nađeni upit za korisnika: ${upit.tekst_upita}`);
          return {
            korisnik_id: nekretnina.id,  
            tekst_upita: upit.tekst_upita,
          };
        });
    });

    if (korisnikoviUpiti.length === 0) {
      console.log('Nema upita za ovog korisnika');
      return res.status(404).json([]);
    }

    console.log('Nađeni upiti:', korisnikoviUpiti);
    res.status(200).json(korisnikoviUpiti);
  } catch (error) {
    console.error('Greška pri dohvatu korisnikovih upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnineData = await readJsonFile('nekretnine');
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);  

  try {
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find((property) => property.id === nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} ne postoji` });
    }

    const upiti = nekretnina.upiti.slice(-3);

    const upitiZaPage = upiti.map(upit => ({
      korisnik_id: upit.korisnik_id,
      tekst_upita: upit.tekst_upita,
    }));

    if (upitiZaPage.length === 0) {
      return res.status(404).json([]); 
    }

    res.status(200).json({
      id: nekretnina.id,
      naziv: nekretnina.naziv,
      tip_nekretnine: nekretnina.tip_nekretnine,
      kvadratura: nekretnina.kvadratura,
      cijena: nekretnina.cijena,
      tip_grijanja: nekretnina.tip_grijanja,
      lokacija: nekretnina.lokacija,
      datum_objave: nekretnina.datum_objave,
      opis: nekretnina.opis,
      upiti: upitiZaPage
    });

  } catch (error) {
    console.error('Greška pri dohvaćanju upita za nekretninu:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const page = parseInt(req.query.page, 10);

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ greska: 'Parametar page mora biti broj >= 1' });
  }

  try {
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find((property) => property.id === nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} ne postoji` });
    }

    let upiti = nekretnina.upiti;

    upiti = upiti.slice(0, upiti.length - 3);

    const totalUpiti = upiti.length;

    if (totalUpiti < page * 3) {
      return res.status(404).json([]); 
    }

    const startIndex = (page - 1) * 3;
    const endIndex = startIndex + 3;

    const upitiZaPage = [];
    let currentIndex = startIndex;
    let count = 0;

    while (count < 3 && currentIndex < totalUpiti) {
      upitiZaPage.push({
        korisnik_id: upiti[currentIndex].korisnik_id,
        tekst_upita: upiti[currentIndex].tekst_upita,
      });
      currentIndex++;
      count++;
    }

    if (upitiZaPage.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(upitiZaPage);

  } catch (error) {
    console.error('Greška pri dohvaćanju upita za nekretninu:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
