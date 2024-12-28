document.getElementById("posalji").addEventListener("click", function () {
    const ime = document.getElementById("ime").value;
    const prezime = document.getElementById("prezime").value;
    const adresa = document.getElementById("adresa").value;
    const brojTelefona = document.getElementById("broj_telefona").value;

    const podaci = {
        ime: ime,
        prezime: prezime,
        adresa: adresa,
        broj_telefona: brojTelefona,
    };

    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState === 4 && ajax.status === 200) {
            const response = JSON.parse(ajax.responseText);

            let tabela = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
            tabela += "<tr><th>Ime</th><th>Prezime</th><th>Adresa</th><th>Broj Telefona</th></tr>";

            response.forEach((entry) => {
                tabela += `<tr>
                    <td>${entry.ime}</td>
                    <td>${entry.prezime}</td>
                    <td>${entry.adresa}</td>
                    <td>${entry.broj_telefona}</td>
                </tr>`;
            });

            tabela += "</table>";

            document.getElementById("tabela").innerHTML = tabela;
        }
    };

    ajax.open("POST", "http://localhost:8085/", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(podaci));
});
