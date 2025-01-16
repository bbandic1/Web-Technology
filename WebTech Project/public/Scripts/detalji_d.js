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

            let upitiHTML = '';
            let trenutnaStranica = 0;  
            const upitiPoStranici = 3; 
            let position = 0;
            let sviUpiti = nekretnina.upiti.slice(0, upitiPoStranici); 

            function renderUpiti() {
                upitiHTML = '';

                sviUpiti.forEach(upit => {
                    upitiHTML += `<div class="upit"><p><strong>Username ${upit.korisnik_id}:</strong></p><p>${upit.tekst_upita}</p></div>`;
                    console.log("Dodavanje upita za korisnika:", upit.korisnik_id);
                });

                upitiHTML += `
                    <div class="carousel-navigation">
                        <div class="arrow left-arrow">&#9664;</div>
                        <div class="arrow right-arrow">&#9654;</div>
                    </div>
                `;

                document.querySelector('#upiti').innerHTML = upitiHTML;
                console.log("Upiti uspješno renderirani.");

                pokreniCarousel();
            }

            function loadNextPage() {
                PoziviAjax.getNextUpiti(nekretninaId, trenutnaStranica + 1, function(error, noviUpiti) {
                    if (error) {
                        console.error("Greška pri učitavanju novih upita:", error);
                        return;
                    }

                    if (noviUpiti && noviUpiti.length > 0) {
                        sviUpiti = sviUpiti.concat(noviUpiti); 
                        trenutnaStranica++;  
                        renderUpiti(); 
                    } else {
                        console.log("Nema više novih upita.");
                    }
                });
            }

            renderUpiti();

            const rightArrow = document.querySelector(".right-arrow");
            const leftArrow = document.querySelector(".left-arrow");
            rightArrow.addEventListener("click", function() {
                position++;
                if (sviUpiti.length === (position+1)) {
                    loadNextPage();
                }
            });
            leftArrow.addEventListener("click", function() {
                position--;
                if (position<0) {
                    position++;
                    loadNextPage();
                }
            });

        } else {
            console.error("Nekretnina sa ID-om " + nekretninaId + " nije pronađena.");
        }
    });
});
