async function updateTask() {
    const id = document.getElementById('update-id').value;
    const naziv = document.getElementById('update-naziv').value;
    const opis = document.getElementById('update-opis').value;

    const response = await fetch(`/zadatak/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ naziv, opis }),
    });

    const data = await response.json();
    alert(data.status);
}