document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded event triggered.");

    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = parseInt(urlParams.get('id'));
    console.log("Učitavanje podataka za nekretninu sa ID-om:", nekretninaId);

    PoziviAjax.getNekretnina(nekretninaId, function(error, nekretnina) {
        if (error) {
            console.error("Greška pri učitavanju podataka:", error);
            return;
        }

        console.log("Podaci o nekretnini uspješno učitani:", nekretnina);

        if (nekretnina) {
            
            const nekretninaSlika = document.querySelector('#nekretnina-slika');
            if (nekretninaSlika) {
                nekretninaSlika.src = `../Resources/Stan/stan1.jpg`;
                console.log("Slika nekretnine postavljena.");
            } else {
                console.error("Element sa ID 'nekretnina-slika' nije pronađen.");
            }

            const osnovnoElem = document.querySelector('#osnovno');
            if (osnovnoElem) {

            const nazivElem = document.createElement('p');
            nazivElem.innerHTML = `<strong>Naziv:</strong> ${nekretnina.naziv}`;
            osnovnoElem.appendChild(nazivElem);

            const kvadraturaElem = document.createElement('p');
            kvadraturaElem.innerHTML = `<strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²`;
            osnovnoElem.appendChild(kvadraturaElem);

    
            const cijenaElem = document.createElement('p');
            cijenaElem.innerHTML = `<strong>Cijena:</strong> ${nekretnina.cijena} KM`;
            osnovnoElem.appendChild(cijenaElem);

            console.log("Osnovni podaci o nekretnini postavljeni.");
            } else {
            console.error("Element sa ID 'osnovno' nije pronađen.");
            }

            const detaljiElem = document.querySelector('#detalji');

if (detaljiElem) {
    const kolona1Elem = detaljiElem.querySelector('#kolona1');
    const kolona2Elem = detaljiElem.querySelector('#kolona2');
    const opisElem = detaljiElem.querySelector('#opis p');

    if (kolona1Elem) {
        kolona1Elem.innerHTML = ''; 

        const tipGrijanjaElem = document.createElement('p');
        tipGrijanjaElem.innerHTML = `<strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}`;
        kolona1Elem.appendChild(tipGrijanjaElem);

        const lokacijaLink = document.createElement('a');
        lokacijaLink.href = '#';
        lokacijaLink.innerHTML = `<strong>Lokacija:</strong> ${nekretnina.lokacija}`;
        lokacijaLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            console.log(`Kliknuta lokacija: ${nekretnina.lokacija}`);

            PoziviAjax.getTop5Nekretnina(nekretnina.lokacija, function(error, topNekretnine) {
                if (error) {
                    console.error("Greška pri dohvaćanju Top 5 nekretnina:", error);
                    return;
                }
                sessionStorage.setItem('top5Nekretnine', JSON.stringify(topNekretnine));
                window.location.href = 'getTop5Nekretnina.html';
            });
        });

        kolona1Elem.appendChild(lokacijaLink);
    }

    if (kolona2Elem) {
        kolona2Elem.innerHTML = ''; 

        const godinaIzgradnjeElem = document.createElement('p');
        const godinaIzgradnje = nekretnina.godina_izgradnje ? nekretnina.godina_izgradnje : 'Nema podataka';
        godinaIzgradnjeElem.innerHTML = `<strong>Godina izgradnje:</strong> ${godinaIzgradnje}`;
        kolona2Elem.appendChild(godinaIzgradnjeElem);

        const datumObjaveElem = document.createElement('p');
        datumObjaveElem.innerHTML = `<strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}`;
        kolona2Elem.appendChild(datumObjaveElem);
    }

    if (opisElem) {
        opisElem.innerHTML = `<strong>Opis:</strong> ${nekretnina.opis}`;
    }

    console.log("Detalji nekretnine postavljeni.");
} else {
    console.error("Element sa ID 'detalji' nije pronađen.");
}

const tipInteresovanja = document.querySelector("#tip-interesovanja");
const interesovanjeFields = document.querySelector("#interesovanje-fields");
const interesovanjeForm = document.querySelector("#interesovanje-form");

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("Fetching query parameter:", param);
    return urlParams.get(param);
}

const urlParams = new URLSearchParams(window.location.search);
const nekretninaId = getQueryParam("id");
console.log("Retrieved nekretninaId:", nekretninaId);


if (!nekretninaId) {
    document.body.innerHTML = "<p>Nekretnina nije pronađena!</p>";
    return;
}

function updateFormFields() {
    const selectedTip = tipInteresovanja.value;
    interesovanjeFields.innerHTML = ""; // briši prijašnje

    if (selectedTip === "upit") { //polja za upit
        interesovanjeFields.innerHTML = `
            <label for="tekst-upita">Tekst:</label>
            <textarea id="tekst-upita" name="tekst" required></textarea>
        `;
    } else if (selectedTip === "zahtjev") {
        interesovanjeFields.innerHTML = `
            <label for="tekst-zahtjeva">Tekst:</label>
            <textarea id="tekst-zahtjeva" name="tekst" required></textarea>
            <label for="trazeni-datum">Traženi datum:</label>
            <input type="date" id="trazeni-datum" name="trazeniDatum" required>
        `;
    } else if (selectedTip === "ponuda") {
        // Fetch linked offers if the user is logged in
        PoziviAjax.getLinkedPonude(nekretninaId, function (error, ponude) {
            if (error) {
                console.error("Greška pri dohvaćanju povezanih ponuda:", error);
                return;
            }
            console.log(ponude);
            const options = ponude.map((ponuda) =>
                `<option value="${ponuda.id}">Ponuda ID: ${ponuda.id} - ${ponuda.cijenaPonude} KM</option>`
            );
            const isDisabled = options.length === 0;

            interesovanjeFields.innerHTML = `
                <label for="tekst-ponude">Tekst:</label>
                <textarea id="tekst-ponude" name="tekst" required></textarea>
                <label for="ponuda-cijena">Ponuda cijena:</label>
                <input type="number" id="ponuda-cijena" name="ponudaCijene" required>
                <label for="datum-ponude">Datum ponude:</label>
                <input type="date" id="datum-ponude" name="datumPonude" required>
                <label for="vezana-ponuda">ID vezane ponude:</label>
                <select id="vezana-ponuda" name="idVezanePonude" ${isDisabled ? "disabled" : ""}>
                    <option value="" disabled selected>Odaberite vezanu ponudu</option>
                    ${options.join("")}
                </select>
                ${isDisabled ? "<p>Nema ranijih ponuda.</p>" : ""}
            `;
        });
    }
}

tipInteresovanja.addEventListener("change",updateFormFields);
updateFormFields(); //pocetna inicijalizacija

// predavanje forme

interesovanjeForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const formData = new FormData(interesovanjeForm);
    const tip = formData.get("tip");
    const body = {};
    body.nekretnina_id = nekretninaId;

    if (tip === "upit") {

        body.tekst = formData.get("tekst");

        PoziviAjax.postUpit(body.nekretnina_id, body.tekst, function (error, response) {
            if (error) {
                console.error("Greška pri dodavanju interesovanja: ", error);
                alert("Dodavanje interesovanja nije uspjelo!");
                return;
            }
            alert("Upit uspješno dodan!");
            interesovanjeForm.reset();
            updateFormFields(); // Reset fields
        });

    } else if (tip === "zahtjev") {
        body.tekst = formData.get("tekst");
        body.trazeni_datum = formData.get("trazeniDatum");

        PoziviAjax.postZahtjev(body.nekretnina_id, body.tekst, body.trazeni_datum, function (error, response) {
            if (error) {
                console.error("Greška pri dodavanju interesovanja: ", error);
                alert("Dodavanje interesovanja nije uspjelo!");
                return;
            }
            alert("Zahtjev uspješno dodan!");
            interesovanjeForm.reset();
            updateFormFields(); // Reset fields
        });

    } else if (tip === "ponuda") {
        body.tekst = formData.get("tekst");
        body.cijenaPonude = parseFloat(formData.get("ponudaCijene"));
        body.datumPonude = formData.get("datumPonude");
        body.vezanaPonuda = formData.get("idVezanePonude") || null;
        body.odbijenaPonuda = false; 

        PoziviAjax.postPonuda(body.nekretnina_id, body.tekst, body.cijenaPonude, body.datumPonude, body.vezanaPonuda, body.odbijenaPonuda,function (error, response) {
            if (error) {
                console.error("Greška pri dodavanju interesovanja: ", error);
                alert("Dodavanje interesovanja nije uspjelo!");
                return;
            }
            alert("Ponuda uspješno dodana!");
            interesovanjeForm.reset();
            updateFormFields(); // Reset fields
        });
    }
});
const upitiList = document.getElementById('upiti-list');
const zahtjeviList = document.getElementById('zahtjevi-list');
const ponudeList = document.getElementById('ponude-list');

// Globalne varijable
let upiti = [];
let zahtjevi = [];
let ponude = [];
let currentUpitIndex = 0;
let currentZahtjevIndex = 0;
let currentPonudaIndex = 0;
let username = ''; // Trenutni korisnički username

// Funkcija za učitavanje podataka
function loadData() {
    PoziviAjax.getInteresovanja(nekretninaId, function (error, data) {
        if (error) {
            console.error('Greška pri učitavanju interesovanja:', error);
            return;
        }

        console.log(data); // Provjera povrata podataka

        upiti = data.Upit || [];
        zahtjevi = data.Zahtjev || [];
        ponude = data.Ponuda || [];

        // Dohvaćanje trenutnog korisničkog imena
        PoziviAjax.getKorisnik(function (error, korisnik) {
            if (error) {
                console.error('Greška pri učitavanju korisničkih informacija:', error);
                return;
            }
            
            console.log(username);
            username = korisnik.username; // Postavljanje trenutnog username-a

            // Prikazivanje podataka
            displayData(upiti, upitiList, 'upit');
            displayData(zahtjevi, zahtjeviList, 'zahtjev');
            displayData(ponude, ponudeList, 'ponuda');

            // Prikazivanje prvih elemenata
            showItem(upiti, currentUpitIndex);
            showItem(zahtjevi, currentZahtjevIndex);
            showItem(ponude, currentPonudaIndex);
        });
    });
}

// Funkcija za prikazivanje podataka u carousel-u
function displayData(list, container, type) {
    container.innerHTML = '';
    list.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('carousel-item');

        if (type === 'upit') {
            div.innerHTML = `
                <p><strong>ID:</strong> ${item.id}</p>
                ${username === 'admin' ? `<p><strong>Korisnik ID:</strong> ${item.korisnik_id}</p>` : ''}
                <p><strong>Tekst:</strong> ${item.tekst}</p>
                ${username === 'admin' ? `<p><strong>Nekretnina ID:</strong> ${item.nekretnina_id}</p>` : ''}
            `;
        } else if (type === 'zahtjev') {
            div.innerHTML = `
                <p><strong>ID:</strong> ${item.id}</p>
                ${username === 'admin' ? `<p><strong>Korisnik ID:</strong> ${item.korisnik_id}</p>` : ''}
                <p><strong>Tekst:</strong> ${item.tekst}</p>
                ${username === 'admin' ? `<p><strong>Nekretnina ID:</strong> ${item.nekretnina_id}</p>` : ''}
                <p><strong>Traženi datum:</strong> ${item.trezeniDatum || 'N/A'}</p>
                <p><strong>Odobren:</strong> ${item.odobren ? 'Da' : 'Ne'}</p>
            `;
        } else if (type === 'ponuda') {
            div.innerHTML = `
                <p><strong>ID:</strong> ${item.id}</p>
                ${username === 'admin' ? `<p><strong>Korisnik ID:</strong> ${item.korisnik_id}</p>` : ''}
                <p><strong>Tekst upita:</strong> ${item.tekst_upita}</p>
                ${username === 'admin' ? `<p><strong>Nekretnina ID:</strong> ${item.nekretnina_id}</p>` : ''}
                ${username === 'admin' ? `<p><strong>Cijena ponude:</strong> ${item.cijenaPonude}</p>` : ''}
                <p><strong>Datum ponude:</strong> ${item.datumPonude}</p>
                ${username === 'admin' ? `<p><strong>Odbijena ponuda:</strong> ${item.odbijenaPonuda ? 'Da' : 'Ne'}</p>` : ''}
                ${username === 'admin' ? `<p><strong>Vezana ponuda:</strong> ${item.vezanaPonuda || 'N/A'}</p>` : ''}
                ${username === 'admin' ? `<p><strong>Korisnik:</strong> ${item.Korisnik ? `${item.Korisnik.ime} ${item.Korisnik.prezime}` : 'N/A'}</p>` : ''}
            `;
        }

        container.appendChild(div);
    });
}

// Funkcija za prikazivanje trenutnog elementa
function showItem(list, index) {
    const container = list === upiti ? upitiList : list === zahtjevi ? zahtjeviList : ponudeList;
    const items = container.getElementsByClassName('carousel-item');
    Array.from(items).forEach(item => item.style.display = 'none');
    if (items[index]) {
        items[index].style.display = 'block';
    }
}

// Navigacijske funkcije s kružnim ponašanjem
document.getElementById('prev-upit').addEventListener('click', () => {
    currentUpitIndex = (currentUpitIndex - 1 + upiti.length) % upiti.length;
    showItem(upiti, currentUpitIndex);
});

document.getElementById('next-upit').addEventListener('click', () => {
    currentUpitIndex = (currentUpitIndex + 1) % upiti.length;
    showItem(upiti, currentUpitIndex);
});

document.getElementById('prev-zahtjev').addEventListener('click', () => {
    currentZahtjevIndex = (currentZahtjevIndex - 1 + zahtjevi.length) % zahtjevi.length;
    showItem(zahtjevi, currentZahtjevIndex);
});

document.getElementById('next-zahtjev').addEventListener('click', () => {
    currentZahtjevIndex = (currentZahtjevIndex + 1) % zahtjevi.length;
    showItem(zahtjevi, currentZahtjevIndex);
});

document.getElementById('prev-ponuda').addEventListener('click', () => {
    currentPonudaIndex = (currentPonudaIndex - 1 + ponude.length) % ponude.length;
    showItem(ponude, currentPonudaIndex);
});

document.getElementById('next-ponuda').addEventListener('click', () => {
    currentPonudaIndex = (currentPonudaIndex + 1) % ponude.length;
    showItem(ponude, currentPonudaIndex);
});

// Učitavanje podataka na početku
loadData();
    
     } else {
            console.error("Nekretnina sa ID-om " + nekretninaId + " nije pronađena.");
        }
    });
});
