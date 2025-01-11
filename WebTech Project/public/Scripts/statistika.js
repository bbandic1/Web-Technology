const statistika = StatistikaNekretnina();
statistika.init(listaNekretnina, listaKorisnika);

const opcije = {
    tip_nekretnine: ["Stan", "Kuća"],
    naziv: ["Useljiv stan Sarajevo", "Mali poslovni prostor"],
    kvadratura: [58, 20],
    cijena: [232000, 32000, 70000],
    tip_grijanja: ["plin", "struja"],
    godina_izgradnje: [2019, 2005],
    datum_objave: ["01.10.2023.", "01.10.2009.", "01.10.2003.", "20.08.2023."],
    opis: ["Sociis natoque penatibus.", "Magnis dis parturient montes."]
};

function azurirajOpcije(suffix) {
    const kriterijId = `kriterij-${suffix}`;
    const vrijednostId = `vrijednost-${suffix}`;

    const kriterij = document.getElementById(kriterijId).value;
    const vrijednostSelect = document.getElementById(vrijednostId);
    
    vrijednostSelect.innerHTML = `<option value="">Izaberite vrijednost</option>`;
    
    if (kriterij && opcije[kriterij]) {
        opcije[kriterij].forEach(opcija => {
            const novaOpcija = document.createElement("option");
            novaOpcija.value = opcija;
            novaOpcija.textContent = opcija;
            vrijednostSelect.appendChild(novaOpcija);
        });
    }
}

function prikaziProsjecnuKvadraturu() {
    const kriterij = document.getElementById("kriterij-1").value;
    let vrijednost = document.getElementById("vrijednost-1").value;

    if (kriterij == "cijena" || kriterij == "kvadratura" || kriterij == "godina_izgradnje") {
        vrijednost = parseInt(vrijednost);
    }

    if (!kriterij || !vrijednost) {
        alert("Molimo izaberite oba kriterija.");
        return;
    }

    const jsonKriterij = {};
    jsonKriterij[kriterij] = vrijednost;
    
    const rezultat = statistika.prosjecnaKvadratura(jsonKriterij);
    if (rezultat) {
        document.getElementById("rezultat-kvadrature").innerText = `Prosječna kvadratura: ${rezultat.toFixed(2)} m²`;
    } else {
        document.getElementById("rezultat-kvadrature").innerText = "Nema podataka za navedeni kriterij.";
    }
}

function prikaziOutlier() {
    const kriterij = document.getElementById("kriterij-2").value;
    let vrijednost = document.getElementById("vrijednost-2").value;

    if (kriterij == "cijena" || kriterij == "kvadratura" || kriterij == "godina_izgradnje") {
        vrijednost = parseInt(vrijednost);
    }

    if (!kriterij || !vrijednost) {
        alert("Molimo izaberite oba kriterija.");
        return;
    }

    const jsonKriterij = {};
    jsonKriterij[kriterij] = vrijednost;

    const nazivSvojstva = document.getElementById("naziv-svojstva").value;
    const rezultat = statistika.outlier(jsonKriterij, nazivSvojstva);
    const rezultatDiv = document.getElementById("rezultat-outlier");
    if (rezultat) {
        rezultatDiv.innerText = `Outlier: ${rezultat.naziv}, Vrijednost: ${rezultat[nazivSvojstva]}`;
    } else {
        rezultatDiv.innerText = "Nema outlier-a za proslijeđeni kriterij.";
    }
}

function prikaziMojeNekretnine() {
    const korisnikId = parseInt(document.getElementById("korisnik-id").value);
    const korisnik = listaKorisnika.find(k => k.id === korisnikId);
    
    const mojeNekretnine = statistika.mojeNekretnine(korisnik);
    if (mojeNekretnine.length > 0) {
        const nekretnineHTML = mojeNekretnine.map(nekretnina => `<p>${nekretnina.naziv} (${nekretnina.cijena} KM)</p>`).join("");
        document.getElementById("rezultat-nekretnine").innerHTML = nekretnineHTML; }
}

function iscrtajHistogram() {
    const divHistogrami = document.getElementById("histogrami");

    const periodiInput = document.getElementById("periodi").value.trim();
    const rasponiCijenaInput = document.getElementById("rasponi-cijena").value.trim();

    console.log("Raw input za periode:", periodiInput);
    console.log("Raw input za raspon cijena:", rasponiCijenaInput);

    let periodi, rasponiCijena;
    try {
        periodi = transformišiPeriodi(periodiInput);

        rasponiCijena = transformišiRasponiCijena(rasponiCijenaInput);

        console.log("Parsiran periodi:", periodi);
        console.log("Parsiran rasponi cijena:", rasponiCijena);
    } catch (error) {
        console.error("Greška pri parsiranju perioda ili raspona cijena:", error);
        alert("Greška: Unesite podatke u ispravnom formatu!");
        return;
    }

    const histogramPodaci = statistika.histogramCijena(periodi, rasponiCijena);
    console.log("Histogram podaci:", histogramPodaci);

    divHistogrami.innerHTML = "";

    periodi.forEach((period, indeksPerioda) => {
        console.log(`Pravim histogram za period ${period.od} - ${period.do} (indeks ${indeksPerioda})`);

        const podaciZaPeriod = histogramPodaci.filter(
            pod => pod.indeksPerioda === indeksPerioda
        );

        console.log(`Podaci za period (${period.od}-${period.do}):`, podaciZaPeriod);

        const labels = rasponiCijena.map(
            raspon => `${raspon.od}-${raspon.do}`
        );
        console.log(`Labele za period (${period.od}-${period.do}):`, labels);

        const data = rasponiCijena.map(
            (_, indeksRaspona) => {
                const pod = podaciZaPeriod.find(p => p.indeksRasponaCijena === indeksRaspona);
                return pod ? pod.brojNekretnina : 0;
            }
        );
        console.log(`Data za period (${period.od}-${period.do}):`, data);

        const canvas = document.createElement("canvas");
        canvas.id = `chart-${indeksPerioda}`;
        divHistogrami.appendChild(canvas);

        console.log(`Kreiram chart za period (${period.od}-${period.do})...`);
        new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: `Period ${period.od} - ${period.do}`,
                    data: data,
                    backgroundColor: "rgba(0, 0, 0)",
                    borderColor: "rgba(0, 0, 0)",
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
        console.log(`Chart za period (${period.od}-${period.do}) je kreiran.`);
    });
}

function transformišiPeriodi(input) {
    const periodi = input.split("],").map(period => {
        period = period.replace("[", "").replace("]", "");
        const [od, do_] = period.split(",");
        return { od: parseInt(od.trim()), do: parseInt(do_.trim()) };
    });
    return periodi;
}

function transformišiRasponiCijena(input) {
    const rasponi = input.split("],").map(raspon => {
        raspon = raspon.replace("[", "").replace("]", "");
        const [od, do_] = raspon.split(",");
        return { od: parseInt(od.trim()), do: parseInt(do_.trim()) };
    });
    return rasponi;
}

//[{"od":2000,"do":2010},{"od":2010,"do":2024}]
//[{"od":10000,"do":150000},{"od":150000,"do":1000000}]