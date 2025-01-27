function ispisi(error, token) {
    if (!error) console.log(token);
}

function getAccessToken(proslijedi) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                proslijedi(null, JSON.parse(ajax.responseText).access_token);
            } else {
                console.error("Greška kod dobivanja access tokena:", ajax.responseText);
                proslijedi(ajax.status, null);
            }
        }
    };

    ajax.open("POST", "https://bitbucket.org/site/oauth2/access_token", true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.setRequestHeader(
        "Authorization",
        "Basic " + btoa("***:***")
    );
    ajax.send("grant_type=" + encodeURIComponent("client_credentials"));
}

function listRepositories(error, token) {
    if (error) {
        console.error("Greška kod dobivanja tokena:", error);
        return;
    }

    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                let podaci = JSON.parse(ajax.responseText);

                if (!podaci.values || podaci.values.length === 0) {
                    console.log("Nema dostupnih repozitorija.");
                    return;
                }

                let tabela = document.createElement("table");
                tabela.style.borderCollapse = "collapse";
                tabela.style.width = "100%";

                let headerRow = document.createElement("tr");
                ["Repozitorij", "Vlasnik"].forEach((text) => {
                    let th = document.createElement("th");
                    th.textContent = text;
                    th.style.border = "1px solid black";
                    th.style.padding = "8px";
                    th.style.textAlign = "left";
                    th.style.backgroundColor = "#f2f2f2";
                    headerRow.appendChild(th);
                });
                tabela.appendChild(headerRow);

                podaci.values.forEach((repo) => {
                    let row = document.createElement("tr");

                    let nameCell = document.createElement("td");
                    nameCell.textContent = repo.name || "Nepoznato ime";
                    nameCell.style.border = "1px solid black";
                    nameCell.style.padding = "8px";

                    let ownerCell = document.createElement("td");
                    ownerCell.textContent = (repo.owner && repo.owner.username) || "Nepoznat vlasnik";
                    ownerCell.style.border = "1px solid black";
                    ownerCell.style.padding = "8px";

                    row.appendChild(nameCell);
                    row.appendChild(ownerCell);
                    tabela.appendChild(row);
                });

                let tabelaDiv = document.getElementById("tabela");
                tabelaDiv.innerHTML = ""; // Čišćenje stare tablice
                tabelaDiv.appendChild(tabela);
            } else {
                console.error("Greška kod dobivanja repozitorija:", ajax.status);
            }
        }
    };

    ajax.open("GET", "https://api.bitbucket.org/2.0/repositories?role=member", true);
    ajax.setRequestHeader("Authorization", "Bearer " + token);
    ajax.send();
}

getAccessToken(listRepositories);
