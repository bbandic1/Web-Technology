function iscrtavanjeTabele() {
    document.write('<table>');
    
    for (let i = 0; i <= 10; i++) {
        document.write('<tr>');
        
        for (let j = 0; j <= 10; j++) {
            if (i === 0 && j === 0) {
                document.write('<th class="header">X</th>');
            } else if (i === 0) {
                document.write('<th class="header">' + j + '</th>');
            } else if (j === 0) {
                document.write('<th class="header">' + i + '</th>');
            } else {
                if (i % 2 === 0) {
                    document.write('<td class="highlight">' + (i * j) + '</td>');
                } else {
                    document.write('<td>' + (i * j) + '</td>');
                }
            }
        }
        
        document.write('</tr>');
    }
    
    document.write('</table>');
}

iscrtavanjeTabele();