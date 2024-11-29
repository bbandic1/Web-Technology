const statistika = StatistikaNekretnina();
statistika.init(listaNekretnina, listaKorisnika);

function prikaziProsjecnuKvadraturu() {
    let kriterij;
    try {
        kriterij = JSON.parse(document.getElementById("kriterij-kvadrature").value);
    } catch (e) {
        alert("Greška: Unesite podatke u ispravnom formatu!");
        return;
    }
    const rezultat = statistika.prosjecnaKvadratura(kriterij);
    document.getElementById("rezultat-kvadrature").innerText = 
        rezultat ? `Prosječna kvadratura: ${rezultat.toFixed(2)} m²` : "Nema podataka za navedeni kriterij.";
}

function prikaziOutlier() {
    let kriterij;
    try {
        kriterij = JSON.parse(document.getElementById("kriterij_outlier").value);
    } catch (e) {
        alert("Greška: Unesite podatke u ispravnom formatu!");
        return;
    }
    const nazivSvojstva = document.getElementById("naziv-svojstva").value;
    const rezultat = statistika.outlier(kriterij, nazivSvojstva);
    document.getElementById("rezultat-outlier").innerText =
        rezultat ? `Outlier: ${rezultat.naziv}, Vrijednost: ${rezultat[nazivSvojstva]}` : "Nema outlier-a za proslijeđeni kriterij.";
}

function prikaziMojeNekretnine() {
    const korisnikId = parseInt(document.getElementById("korisnik-id").value);
    const korisnik = listaKorisnika.find(k => k.id === korisnikId);
    if (!korisnik) {
        alert("Grešla: id tog korisnika ne postoji.");
        return;
    }
    const mojeNekretnine = statistika.mojeNekretnine(korisnik);
    document.getElementById("rezultat-nekretnine").innerHTML =
        mojeNekretnine.length > 0 
            ? mojeNekretnine.map(nekretnina => `<p>${nekretnina.naziv} (${nekretnina.cijena} KM)</p>`).join("")
            : "Nema nekretnina za proslijeđeni id korisnika.";
}

function iscrtajHistogram() {
    const divHistogrami = document.getElementById("histogrami");

    const periodiInput = document.getElementById("periodi").value.trim();
    const rasponiCijenaInput = document.getElementById("rasponi-cijena").value.trim();

    let periodi, rasponiCijena;
    try {
        periodi = JSON.parse(periodiInput);
        rasponiCijena = JSON.parse(rasponiCijenaInput);
    } catch (error) {
        alert("Greška: Unesite podatke u ispravnom formatu!");
        return;
    }

    const histogramPodaci = statistika.histogramCijena(periodi, rasponiCijena);

    divHistogrami.innerHTML = "";

    periodi.forEach((period, indeksPerioda) => {
        const podaciZaPeriod = histogramPodaci.filter(
            pod => pod.indeksPerioda === indeksPerioda
        );

        const labels = rasponiCijena.map(
            raspon => `${raspon.od}-${raspon.do}`
        );
        const data = rasponiCijena.map(
            (_, indeksRaspona) => {
                const pod = podaciZaPeriod.find(p => p.indeksRasponaCijena === indeksRaspona);
                return pod ? pod.brojNekretnina : 0;
            }
        );

        const canvas = document.createElement("canvas");
        canvas.id = `chart-${indeksPerioda}`;
        divHistogrami.appendChild(canvas);

        new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: `Period ${period.od} - ${period.do}`,
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: `Histogram za period ${period.od} - ${period.do}` },
                },
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
    });
}

//[{"od":2000,"do":2010},{"od":2010, "do":2024}]
//[{"od":10000, "do":150000}, {"od":150000, "do":1000000}]