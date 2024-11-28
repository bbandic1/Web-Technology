document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM je učitan!"); 

    let statistika = StatistikaNekretnina();

    console.log("StatistikaNekretnina objekat:", statistika);

    const button = document.querySelector("button");
    const canvas = document.getElementById("mojChart");

    button.addEventListener("click", () => {
        console.log("Dugme je kliknuto!"); 

        const periodOd = parseInt(document.getElementById("periodOd").value);
        const periodDo = parseInt(document.getElementById("periodDo").value);
        const cijenaOd = parseInt(document.getElementById("cijenaOd").value);
        const cijenaDo = parseInt(document.getElementById("cijenaDo").value);

        console.log({ periodOd, periodDo, cijenaOd, cijenaDo }); 

        if (isNaN(periodOd) || isNaN(periodDo) || isNaN(cijenaOd) || isNaN(cijenaDo)) {
            console.error("Nisu unesene sve vrednosti!"); 
            alert("Molimo unesite sve vrijednosti!");
            return;
        }

        const periodi = [{ od: periodOd, do: periodDo }];
        const rasponiCijena = [{ od: cijenaOd, do: cijenaDo }];

        console.log("Kreirani periodi i rasponi cijena:", periodi, rasponiCijena);

        const podaciHistograma = statistika.histogramCijena(periodi, rasponiCijena);
        console.log("Podaci za histogram:", podaciHistograma);

        const labels = rasponiCijena.map((raspon, index) => `Raspon ${index + 1}`);
        const data = podaciHistograma.map(d => d.brojNekretnina);

        iscrtajHistogram(canvas, labels, data);
    });

    function iscrtajHistogram(canvas, labels, data) {
        console.log("Počinje iscrtavanje histograma..."); 
        console.log("Canvas:", canvas);
        console.log("Labels za Chart.js:", labels);
        console.log("Data za Chart.js:", data);
        new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Broj nekretnina",
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
        console.log("Histogram iscrtan!");
    }
});
