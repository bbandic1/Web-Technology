const links = document.querySelectorAll('.tabs a');
        const contentDiv = document.getElementById('content');

        links.forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const page = link.getAttribute('data-page');

                fetch(page)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Greška prilikom učitavanja sadržaja.');
                        }
                        return response.text();
                    })
                    .then(data => {
                        contentDiv.innerHTML = data;
                    })
                    .catch(error => {
                        contentDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
                    });
            });
        });