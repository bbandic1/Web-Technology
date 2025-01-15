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
                    kolona1Elem.querySelector('p:nth-child(1)').innerHTML = `<strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}`;
                    kolona1Elem.querySelector('p:nth-child(2)').innerHTML = `<strong>Lokacija:</strong> ${nekretnina.lokacija}`;
                }

                if (kolona2Elem) {
                    const godinaIzgradnje = nekretnina.godina_izgradnje ? nekretnina.godina_izgradnje : 'Nema podataka';
                    kolona2Elem.querySelector('p:nth-child(1)').innerHTML = `<strong>Godina izgradnje:</strong> ${godinaIzgradnje}`;
                    kolona2Elem.querySelector('p:nth-child(2)').innerHTML = `<strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}`;
                }

                if (opisElem) opisElem.innerHTML = `<strong>Opis:</strong> ${nekretnina.opis}`;

                console.log("Detalji nekretnine postavljeni.");
            } else {
                console.error("Element sa ID 'detalji' nije pronađen.");
            }

            let upitiHTML = '';
            nekretnina.upiti.forEach(upit => {
                upitiHTML += `<div class="upit"><p><strong>Username ${upit.korisnik_id}:</strong></p><p>${upit.tekst_upita}</p></div>`;
                console.log("Dodavanje upita za korisnika:", upit.korisnik_id);
            });
            document.querySelector('#upiti').innerHTML = upitiHTML;
            console.log("Upiti uspješno dodani.");
        } else {
            console.error("Nekretnina sa ID-om " + nekretninaId + " nije pronađena.");
        }
    });
});
