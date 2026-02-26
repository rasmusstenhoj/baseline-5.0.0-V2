document.addEventListener("DOMContentLoaded", function () {
  console.log("Swatch color script loaded!"); // Debug
  document.querySelectorAll(".swatch").forEach(function (swatch) {
    let imgUrl = swatch.getAttribute("data-image");
    if (!imgUrl) return;
    let img = new Image();
    img.src = imgUrl;
    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      canvas.width = 5;
      canvas.height = 5;
      ctx.drawImage(img, 0, 0, 5, 5);
      
      // I stedet for at bruge en enkelt pixel, tag en 3x3 matrix fra midten
      // og find den mest dominerende farve
      let colorCounts = {};
      let maxColor = null;
      let maxCount = 0;
      
      // Tjek de 9 pixels i midten (koordinater 1,1 til 3,3)
      for (let x = 1; x <= 3; x++) {
        for (let y = 1; y <= 3; y++) {
          let pixel = ctx.getImageData(x, y, 1, 1).data;
          let r = pixel[0];
          let g = pixel[1];
          let b = pixel[2];
          
          // Lav en simpel RGB-nøgle
          let colorKey = `${r},${g},${b}`;
          
          // Tæl denne farve
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
          
          // Tjek om denne farve er mest hyppig
          if (colorCounts[colorKey] > maxCount) {
            maxCount = colorCounts[colorKey];
            maxColor = [r, g, b];
          }
        }
      }
      
      // Hvis vi fandt en dominerende farve, brug den
      if (maxColor) {
        let r = maxColor[0];
        let g = maxColor[1];
        let b = maxColor[2];
        let hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        console.log(`Swatch Color Applied: ${hexColor} to`, swatch); // Debug
        swatch.style.backgroundColor = hexColor;
        swatch.setAttribute("data-color", hexColor);
      } else {
        // Fallback til den originale metode med en enkelt pixel
        let imageData = ctx.getImageData(2, 2, 1, 1).data;
        let r = imageData[0];
        let g = imageData[1];
        let b = imageData[2];
        let hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        console.log(`Fallback Swatch Color Applied: ${hexColor} to`, swatch); // Debug
        swatch.style.backgroundColor = hexColor;
        swatch.setAttribute("data-color", hexColor);
      }
    };
    
    img.onerror = function () {
      console.error("Image could not be loaded:", imgUrl);
      swatch.style.backgroundColor = "#CCCCCC"; // Fallback farve
    };
  });
});