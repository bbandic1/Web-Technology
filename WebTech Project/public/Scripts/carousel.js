function postaviCarousel() {
    const upiti = document.querySelectorAll("#upiti .upit");
    const leftArrow = document.querySelector(".carousel-navigation .left-arrow");
    const rightArrow = document.querySelector(".carousel-navigation .right-arrow");
    let trenutniIndex = 0;

    if (!upiti || upiti.length === 0 || !leftArrow || !rightArrow) {
        return;
    }

    function prikažiSveUpite() {
        upiti.forEach(upit => {
            upit.style.display = "block";
        });
    }

    function prikažiUpit(index) {
        upiti.forEach((upit, i) => {
            upit.style.display = i === index ? "block" : "none";
        });
    }

    function prikažiSljedeći() {
        trenutniIndex = (trenutniIndex + 1) % upiti.length;
        prikažiUpit(trenutniIndex);
    }

    function prikažiPrethodni() {
        trenutniIndex = (trenutniIndex - 1 + upiti.length) % upiti.length;
        prikažiUpit(trenutniIndex);
    }

    function ažurirajView() {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 599) {
            if (upiti.length > 1) {
                prikažiUpit(trenutniIndex);
                leftArrow.style.display = "block";
                rightArrow.style.display = "block";
            } else {
                prikažiUpit(0); 
                leftArrow.style.display = "none";
                rightArrow.style.display = "none";
            }
        } else {
            prikažiSveUpite();
            leftArrow.style.display = "none";
            rightArrow.style.display = "none";
        }
    }

    ažurirajView();

    if (upiti.length > 1) {
        leftArrow.addEventListener("click", prikažiPrethodni);
        rightArrow.addEventListener("click", prikažiSljedeći);
    }

    window.addEventListener("resize", ažurirajView);
}

document.addEventListener("DOMContentLoaded", postaviCarousel);
