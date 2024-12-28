const express = require('express');
const app = express();

app.use(express.static(__dirname));

const PORT = 3030;
app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
});
