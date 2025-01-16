document.addEventListener('DOMContentLoaded', function() {

  PoziviAjax.getNekretnine(function(error, nekretninaData) {
    if (error) {
        console.error('Greška pri učitavanju podataka:', error);
        return;
    }

    const stanList = document.getElementById('stan-lista');
    nekretninaData.filter(item => item.tip_nekretnine.startsWith('Stan')).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/Stan/Stan1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        stanList.appendChild(div);
    });

    const kucaList = document.getElementById('kuca-lista');
    nekretninaData.filter(item => item.tip_nekretnine.startsWith('Kuća')).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/Kuca/Kuca1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        kucaList.appendChild(div);
    });

    const ppList = document.getElementById('pp-lista');
    nekretninaData.filter(item => item.tip_nekretnine === 'Poslovni prostor').forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/PP/pp1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        ppList.appendChild(div);
    });
    });
});