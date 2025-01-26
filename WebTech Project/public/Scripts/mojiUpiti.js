window.onload = function() {
    const tabelaBody = document.querySelector('#upitiTabela tbody');

    function prikaziUpite(error, upiti) {
        if (error) {
            alert(`Greška: ${error.statusText || 'Nepoznata greška'}`);
            return;
        }
    
        if (!upiti || upiti.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="2">Nema dostupnih upita.</td></tr>';
            return;
        }
    
        tabelaBody.innerHTML = ''; 
        upiti.forEach(upit => {
            console.log(upit);  
            const red = document.createElement('tr');
            red.innerHTML = `
                <td>${upit.nekretnina_id !== undefined ? upit.nekretnina_id : 'N/A'}</td> 
                <td>${upit.tekst}</td>
            `;
            tabelaBody.appendChild(red);
        });
    }

    PoziviAjax.getMojiUpiti(prikaziUpite);
}
