function pokreniCarousel() {
    console.log("Ponovna inicijalizacija carousel-a.");

    const upiti = document.querySelectorAll("#upiti .upit");
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");

    let trenutniIndex = 0;

    function prikaziUpit(index) {
        upiti.forEach((upit, i) => {
            upit.classList.remove("show");
            upit.style.display = "none";
        });

        const trenutniUpit = upiti[index];
        trenutniUpit.classList.add("show");
        trenutniUpit.style.display = "block";
    }

    function prikaziSljedeci() {
        trenutniIndex = (trenutniIndex + 1) % upiti.length;
        prikaziUpit(trenutniIndex);
    }

    function prikaziPrethodni() {
        trenutniIndex = (trenutniIndex - 1 + upiti.length) % upiti.length;
        prikaziUpit(trenutniIndex);
    }

    if (upiti.length > 1) {
        leftArrow.addEventListener("click", prikaziPrethodni);
        rightArrow.addEventListener("click", prikaziSljedeci);
    }

    prikaziUpit(trenutniIndex);
}
