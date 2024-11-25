
function prosjecnaKvadratura(kriterij) {
    const filtriraneNekretnine = nekretnine.filter(nekretnina => nekretnina[kriterij]);
    const totalnaKvadratura = filtriraneNekretnine.reduce((acc, nekretnina) => acc + nekretnina.kvadratura, 0);
    return filtriraneNekretnine.length ? totalnaKvadratura / filtriraneNekretnine.length : 0;
}

function outlier(kriterij, nazivSvojstva) {
    const filtriraneNekretnine = nekretnine.filter(nekretnina => nekretnina[kriterij]);
    const srednjaVrijednost = filtriraneNekretnine.reduce((acc, nekretnina) => acc + nekretnina[nazivSvojstva], 0) / filtriraneNekretnine.length;

    let maxDevijacija = 0;
    let outlierNekretnina = null;

    filtriraneNekretnine.forEach(nekretnina => {
        const devijacija = Math.abs(nekretnina[nazivSvojstva] - srednjaVrijednost);
        if (devijacija > maxDevijacija) {
            maxDevijacija = devijacija;
            outlierNekretnina = nekretnina;
        }
    });

    return outlierNekretnina;
}

function mojeNekretnine(korisnik) {
    const filtriraneNekretnine = nekretnine.filter(nekretnina => nekretnina.upiti.includes(korisnik));
    return filtriraneNekretnine.sort((a, b) => b.upiti.length - a.upiti.length);
}

function histogramCijena(periodi, rasponiCijena) {
    console.log("Pozvana funkcija histogramCijena...");
    console.log("Periodi:", periodi);
    console.log("Rasponi cijena:", rasponiCijena);

    const rezultat = [];

    periodi.forEach((period, periodIndex) => {
        console.log(`Obrada perioda ${periodIndex}:`, period);

        rasponiCijena.forEach((raspon, rasponIndex) => {
            console.log(`Obrada raspona cijena ${rasponIndex}:`, raspon);

            const brojNekretnina = nekretnine.filter(nekretnina =>
                nekretnina.godina >= period.od && nekretnina.godina <= period.do &&
                nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do
            ).length;

            console.log(`Broj nekretnina za period ${periodIndex} i raspon ${rasponIndex}:`, brojNekretnina);

            rezultat.push({
                indeksPerioda: periodIndex,
                indeksRasporedaCijena: rasponIndex,
                brojNekretnina: brojNekretnina,
            });
        });
    });

    console.log("Rezultat funkcije histogramCijena:", rezultat);
    return rezultat;
}

window.StatistikaNekretnina = {
    histogramCijena,
    prosjecnaKvadratura,
    outlier,
    mojeNekretnine
};
