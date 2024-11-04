let odgovor1 = prompt("Kako se zoves?", "Imenom i prezimenom(default)");
if (odgovor1!=null && odgovor1!="")
{
     let r=confirm("Pritisnite OK da prikazete ime u alertboxu a Cancel za prikaz direktno na stranici");
     if (r==true)  // ili if(r)
           alert(odgovor1);
     else
           document.write(odgovor1);
}

let odgovor2 = prompt("Koji ti je omiljeni film?");
if (odgovor2 != null && odgovor2 != "") {
    let obrnutiOdgovor = odgovor2.split("").reverse().join("");
    alert(obrnutiOdgovor);
}
