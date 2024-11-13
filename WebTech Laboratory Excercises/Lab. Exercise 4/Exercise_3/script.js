function calculateVolume(event) {
    event.preventDefault(); 
    
    const radiusInput = document.getElementById('radius').value;
    const radius = parseFloat(radiusInput);
  
    if (radius > 0) {
      const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); 
      document.getElementById('volume').value = volume.toFixed(4); 
    } else {
      alert('Molimo unesite pozitivan poluprečnik!');
      document.getElementById('volume').value = "0.0000";
    }
  }
  