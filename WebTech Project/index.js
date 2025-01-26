const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const db = require('./public/Scripts/DB/db');
const sequelize = db.sequelize;

const importKorisnik = require('./public/Scripts/DB/Korisnik');
const Korisnik = importKorisnik(sequelize);
const importNekretnina = require('./public/Scripts/DB/Nekretnina');
const Nekretnina = importNekretnina(sequelize);
const importUpit = require('./public/Scripts/DB/Upit');
const Upit = importUpit(sequelize);
const importZahtjev = require('./public/Scripts/DB/Zahtjev');
const Zahtjev = importZahtjev(sequelize);
const importPonuda = require('./public/Scripts/DB/Ponuda');
const Ponuda = importPonuda(sequelize);

sequelize.sync({alter: true}).then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Error syncing databse:', err);
})

console.log(db);

const app = express();
const PORT = 3000;
const MAX_LOGIN_ATTEMPTS = 3;
const TIMEOUT = 60000;
let failedLoginAttempts = {};

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
  { route: '/vijesti.html', file: 'vijesti.html'},
  { route: '/statistika.html', file: 'statistika.html'},
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html'},
  { route: '/getTop5Nekretnina.html', file: 'getTop5Nekretnina.html'}
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

app.post('/login', async (req, res) => {
  const jsonObj = req.body;
  console.log('Received login attempt:', jsonObj.username, jsonObj.password);

  if (
    failedLoginAttempts[jsonObj.username] &&
    failedLoginAttempts[jsonObj.username].attempts >= MAX_LOGIN_ATTEMPTS &&
    Date.now() < failedLoginAttempts[jsonObj.username].blockUntil
  ) {
    logAttempt(jsonObj.username, 'neuspješno', 'blocked');
    console.log(`User "${jsonObj.username}" blocked. attempts: "${failedLoginAttempts[jsonObj.username].attempts}"`);
    return res.status(429).json({ greska: 'Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.' });
  }

  try {

    const korisnik = await db.Korisnik.findOne({where: {username: jsonObj.username}});

    // Locate the user by username

    if (korisnik) {
      // const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password); za testiranje
      const isPasswordMatched = jsonObj.password === korisnik.password; 

      if (isPasswordMatched) {
        // Successful login
        if (failedLoginAttempts[jsonObj.username]) {
          delete failedLoginAttempts[jsonObj.username];
        }

        logAttempt(jsonObj.username, 'uspješno');
        req.session.username = korisnik.username;
        return res.json({ poruka: 'Uspješna prijava' });
      }
    }
    if (!failedLoginAttempts[jsonObj.username]) {
      failedLoginAttempts[jsonObj.username] = { attempts: 0, blockUntil: 0 };
    }

    failedLoginAttempts[jsonObj.username].attempts++;

    if (
      failedLoginAttempts[jsonObj.username].attempts >= MAX_LOGIN_ATTEMPTS &&
      failedLoginAttempts[jsonObj.username].attempts % MAX_LOGIN_ATTEMPTS === 0
    ) {
      failedLoginAttempts[jsonObj.username].blockUntil = Date.now() + TIMEOUT;
      console.log(`User "${jsonObj.username}" blocked. attempts: "${failedLoginAttempts[jsonObj.username].attempts}"`);
    }

    console.log(`User "${jsonObj.username}" failed login. attempts: "${failedLoginAttempts[jsonObj.username].attempts}"`);
    logAttempt(jsonObj.username, 'neuspješno');
    return res.json({ poruka: 'Neuspješna prijava' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
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
    const top5 = await db.Nekretnina.findAll({
      where: { lokacija }, 
      order: [['datum_objave', 'DESC']], 
      limit: 5, 
    });

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
    const user = await db.Korisnik.findOne({
      where: {username},
      attributes : ['id','ime','prezime','username', 'password'],
    })

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    res.status(200).json(user);
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
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    const nekretnina = await db.Nekretnina.findByPk(id);

    if (!loggedInUser) {
      return res.status(400).json({ greska: 'Korisnik nije pronađen' });
    }

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${id} ne postoji` });
    }

    const korisnikoviUpiti = await db.Upit.count({
      where: { korisnik_id: loggedInUser.id, nekretnina_id: nekretnina.id },
    });

    if (korisnikoviUpiti >= 3) {
      return res.status(429).json({ greska: 'Previše upita za istu nekretninu.' });
    }

    await db.Upit.create({
      korisnik_id: loggedInUser.id,
      nekretnina_id: nekretnina.id,  
      tekst: tekst_upita,
    });

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
    const loggedInUsername = req.session.username;
    console.log('Korisničko ime za filtriranje upita:', loggedInUsername);

    const korisnik = await db.Korisnik.findOne({ where: { username: loggedInUsername } });

    if (!korisnik) {
      console.log('Korisnik nije pronađen');
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }
    const korisnikId = korisnik.id;
    console.log('Korisnički ID:', korisnikId);

    const korisnikoviUpiti = await db.Upit.findAll({
      where: { korisnik_id: korisnikId },
      include: [
        {
          model: db.Nekretnina,
          as: "Nekretnina",
          required: true,
          attributes: ['id', 'naziv', 'kvadratura', 'cijena', 'tip_grijanja', 'lokacija'], 
        },
      ],
    });

    if (korisnikoviUpiti.length === 0) {
      console.log('Nema upita za ovog korisnika');
      return res.status(404).json([]);
    }

    const rezultat = korisnikoviUpiti.map((upit) => ({
      nekretnina_id: upit.nekretnina_id,
      tekst_upita: upit.tekst,
    }));

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
  //Check if the user is authenticated
 if (!req.session.username) {
    //User is not logged in
   return res.status(401).json({ greska: 'Neautorizovan pristup' });
 }

 // Get data from the request body
 const { ime, prezime, username, password } = req.body;

 try {
   // Read user data from the JSON file
   const loggedInUser = await db.Korisnik.findOne({
     where: { username: req.session.username },
   })

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
   await loggedInUser.save();
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
    // Dohvatanje svih nekretnina iz baze
    const nekretnine = await db.Nekretnina.findAll();

    // Slanje odgovora sa podacima o nekretninama
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Greška pri dohvatanju podataka o nekretninama:', error);
    res.status(500).json({ greska: 'Interna greška servera' });
  }
});


app.get('/nekretnina/:id', async (req,res) => {
  const { id } = req.params;
  try {
    
    const nekretnina = await db.Nekretnina.findOne({
      where: {id: id},
      include: [{
        model: db.Upit,  
          as: 'Upit',  
          required: false,  
          limit: 3,   
      }
      ]
    });

    if(!nekretnina){
      return res.status(404).json({greska: 'Nekretnina nije pronađena'});
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
      godina_izgradnje: nekretnina.godina_izgradnje,
      opis: nekretnina.opis,
      upiti: nekretnina.upiti
    });
  }
  catch(error) {
    console.error('Error fetching queries for user: ', error);
    res.status(500).json({greska: 'Internal server error'});
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

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  try {
    // Find the logged-in user based on the session username
    let loggedInUser = null;
    if (req.session.username) {
      loggedInUser = await db.Korisnik.findOne({
        where: { username: req.session.username },
      });
    }

    const nekretninaId = req.params.id;

    // Fetch all related interesovanja for the nekretnina
    const interesovanja = await db.Nekretnina.findByPk(nekretninaId, {
      include: [
        { model: db.Upit, as: 'Upit' },
        { model: db.Zahtjev, as: 'Zahtjev' },
        {
          model: db.Ponuda,
          as: 'Ponuda',
          include: [{ model: db.Korisnik, as: 'Korisnik' }],
        },
      ],
    });

    if (!interesovanja) {
      return res.status(404).json({ message: 'Interesovanja not found' });
    }

    // Handle the case when there are no Ponuda or Zahtjev
    const ponude = interesovanja.Ponuda || [];
    const zahtjevi = interesovanja.Zahtjev || [];

    // If user is not logged in or is a regular user, filter sensitive fields
    if (!loggedInUser || !loggedInUser.admin) {
      // Filter Ponuda: remove cijenaPonude unless it's the user's own offer or linked offer
      const filteredPonude = ponude.map((ponuda) => {
        const ponudaData = ponuda.toJSON();
        const isOwner = ponudaData.korisnik_id === loggedInUser?.id;
        const isLinked = ponudaData.vezanaPonuda === loggedInUser?.id;

        // Remove cijenaPonude for non-owner users unless they own the offer or it's linked
        if (!isOwner && !isLinked) {
          delete ponudaData.cijenaPonude;
        }

        // Remove sensitive user info from Ponuda
        delete ponudaData.Korisnik?.password;
        delete ponudaData.Korisnik?.admin;
        delete ponudaData.Korisnik?.username;

        return ponudaData;
      });

      // Filter Zahtjev
      const filteredZahtjevi = zahtjevi.map((zahtjev) => {
        const zahtjevData = zahtjev.toJSON();
        // Remove sensitive user info from Zahtjev
        delete zahtjevData.Korisnik?.password;
        delete zahtjevData.Korisnik?.admin;
        delete zahtjevData.Korisnik?.username;

        if (loggedInUser?.admin) {
          return zahtjevData; // Admin sees everything
        }

        // Regular user sees less info
        if (zahtjevData.korisnik_id === loggedInUser?.id) {
          return zahtjevData;
        }

        return {
          id: zahtjevData.id,
          tekst: zahtjevData.tekst,
          odobren: zahtjevData.odobren ? "Odobreno" : "Odbijeno",
          trazeniDatum: zahtjevData.trazeniDatum,
        };
      });

      const filteredData = {
        ...interesovanja.toJSON(),
        Ponuda: filteredPonude,
        Zahtjev: filteredZahtjevi,
      };

      return res.json(filteredData);
    }

    // Admin sees everything
    return res.json(interesovanja);
  } catch (error) {
    console.error('Error fetching interesovanja:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// 
app.post("/nekretnina/:id/ponuda", async (req, res) => {
  try {
    const nekretninaId = req.params.id; 
    const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;

    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const nekretnina = await db.Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ message: "Nekretnina sa tim id ne postoji." });
    }

    let vezanaPonuda = null;
    if (idVezanePonude != null) {
      vezanaPonuda = await db.Ponuda.findByPk(idVezanePonude);
      if (!vezanaPonuda) {
        return res.status(404).json({ message: "Vezana ponuda ne postoji." });
      }

      const chainHasRejectedPonuda = await db.Ponuda.findOne({
        where: { vezana_ponuda_id: idVezanePonude, odbijenaPonuda: true },
      });

      if (chainHasRejectedPonuda) {
        return res.status(400).json({
          message: "Daljnje ponude se ne mogu postaviti jer je prijasnja ponuda u lancu odbijena.",
        });
      }

      
      const isAdmin = loggedInUser.admin;
      const isUserLinkedToPonuda =
        vezanaPonuda.korisnik_id === loggedInUser.id || vezanaPonuda.idVezanePonude === loggedInUser.id;

      if (!isAdmin && !isUserLinkedToPonuda) {
        return res.status(403).json({
          message: "Nemate permisije odgovoriti ovoj ponudi.",
        });
      }
    }

    
    if (odbijenaPonuda && idVezanePonude === null) {
      return res.status(406).json({
        message: "Odbijena ponuda mora biti vezana za prijašnju ponudu.",
      });
    }

    
    const currentDate = new Date();
    if (new Date(datumPonude) > currentDate) {
      return res.status(407).json({
        message: "datumPonude invalid.",
      });
    }
    console.log("Mapped fields:");
    console.log({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst,
      nekretnina_id: nekretninaId,
      cijena_ponude: ponudaCijene,
      datum_ponude: datumPonude,
      odbijena_ponuda: odbijenaPonuda,
      vezana_ponuda_id: idVezanePonude,
    });
    
    const newPonuda = await db.Ponuda.create({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst,
      nekretnina_id: nekretninaId,
      cijenaPonude: ponudaCijene,
      datumPonude: datumPonude,
      odbijenaPonuda: odbijenaPonuda,
      vezanaPonudaId: idVezanePonude,
    });
  
    
    res.json(newPonuda);
  } catch (error) {
    console.error("Error creating ponuda:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/ponude/:nekretninaId", async (req, res) => {

  const nekretninaId = req.params.nekretninaId;

  const loggedInUser = await db.Korisnik.findOne({
    where: { username: req.session.username },
  });

  if (!loggedInUser) {
    return res.status(403).json({ message: "Unauthorized." });
  }
  const id = loggedInUser.id;
  const isAdmin = loggedInUser.admin; 
  console.log(isAdmin);
  try {
      const ponude = await db.Ponuda.findAll({
          where: isAdmin
              ? { nekretnina_id: nekretninaId } 
              : { nekretnina_id: nekretninaId, korisnik_id: id}, 
          order: [["datumPonude", "DESC"]],
      });

      res.status(200).json(ponude);
  } catch (error) {
      console.error("Error fetching ponude:", error);
      res.status(500).json({ error: "Failed to fetch ponude." });
  }
});

app.post("/nekretnina/:id/zahtjev", async (req, res) => {
  try {

    let loggedInUser = null;
           if (req.session.username) {
             loggedInUser = await db.Korisnik.findOne({
               where: { username: req.session.username },
             });
           } 

    const nekretninaId = req.params.id; 
    const { tekst, trazeniDatum } = req.body; 
 
    const nekretnina = await db.Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ message: "Nekretnina sa tim id ne postoji" });
    }

    
    const currentDate = new Date();
    const requestedDate = new Date(trazeniDatum);

    if (isNaN(requestedDate.getTime()) || requestedDate < currentDate) {
      return res.status(404).json({
        message: "Invalid trazeniDatum. Ne može biti u prošlosti",
      });
    }


    const newZahtjev = await db.Zahtjev.create({
      korisnik_id: loggedInUser.id,
      nekretnina_id: nekretninaId,
      tekst,
      trazeniDatum,
      odobren: false, // dok ne bude odobren
    });

 
    res.json(newZahtjev);
  } catch (error) {
    console.error("Error creating zahtjev:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/nekretnina/:id/zahtjev/:zid", async (req, res) => {
  try {
    const nekretninaId = req.params.id; 
    const zahtjevId = req.params.zid; 
    const { odobren, addToTekst } = req.body; 
    console.log(addToTekst);
    
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    
    if (!loggedInUser) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    
    if (!loggedInUser.admin) {
      return res.status(403).json({ message: "Admin only" });
    }

    
    const zahtjev = await db.Zahtjev.findOne({
      where: { id: zahtjevId, nekretnina_id: nekretninaId },
    });

    if (!zahtjev) {
      return res
        .status(404)
        .json({ message: "Zahtjev sa tim id ne postoji." });
    }

    
    if (odobren === false && (!addToTekst || addToTekst.trim() === "")) {
      return res.status(400).json({
        message:
          "addToTekst mora postojati ako je odobren null.",
      });
    }

    
    const updatedZahtjev = await zahtjev.update({
      odobren,
      tekst: odobren
        ? `${zahtjev.tekst || ""} ODGOVOR ADMINA: ${addToTekst}`
        : `${zahtjev.tekst || ""} ODGOVOR ADMINA: ${addToTekst}`,
    });

    
    res.json(updatedZahtjev);
  } catch (error) {
    console.error("Error updating zahtjev:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
