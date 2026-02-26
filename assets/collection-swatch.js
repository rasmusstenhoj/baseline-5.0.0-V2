// En mere robust initialisering der fungerer godt med defer
function initializeCollectionSwatches() {
  console.log("Collection swatch script initializing");
  
  // Find alle swatches i kollektionsvisningen
  const swatches = document.querySelectorAll(".collection-swatch");
  console.log("Found swatches:", swatches.length);
  
  if (!swatches.length) return;

  // Ekstraher farver fra produktbilleder
  swatches.forEach(function(swatch, index) {
    console.log(`Processing swatch ${index+1}`);
    
    // Sæt farve baseret på billedet
    let imgUrl = swatch.getAttribute("data-swatch-image");
    console.log(`Swatch ${index+1} image URL:`, imgUrl);
    
    if (!imgUrl) {
      console.error(`No image URL found for swatch ${index+1}`);
      return;
    }

    let img = new Image();
    img.crossOrigin = "Anonymous"; // Undgå CORS-problemer
    img.src = imgUrl;
    
    img.onload = function() {
      console.log(`Image loaded for swatch ${index+1}`);
      try {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = 5;
        canvas.height = 5;
        ctx.drawImage(img, 0, 0, 5, 5);
        let imageData = ctx.getImageData(2, 2, 1, 1).data;
        
        let r = imageData[0];
        let g = imageData[1];
        let b = imageData[2];
        
        let hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        console.log(`Color extracted: ${hexColor}`);
        
        swatch.style.backgroundColor = hexColor;
        swatch.setAttribute("data-color", hexColor);
      } catch (error) {
        console.error(`Error processing swatch:`, error);
        swatch.style.backgroundColor = "#CCCCCC"; // Fallback ved fejl
      }
    };
    
    img.onerror = function(error) {
      console.error(`Image could not be loaded:`, imgUrl);
      swatch.style.backgroundColor = "#CCCCCC"; // Fallback farve
    };

    // Tilføj click event handler
    swatch.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation(); // Stop event propagation
      
      // Ignorér klik på den aktive swatch
      if (swatch.classList.contains("current-swatch")) return;
      
      // Find parent produktkort
      const productTile = swatch.closest(".product-card") || 
                         swatch.closest("li") || 
                         swatch.closest(".group");
      
      if (!productTile) {
        console.error(`Could not find parent product tile`);
        return;
      }
      
      // Find produktbilledet og links
      const productImage = productTile.querySelector("img:first-child");
      const productLinks = productTile.querySelectorAll("a[href]");
      
      if (productImage) {
        // Opdater billedet med fade effect
        const newSrc = swatch.getAttribute("data-product-image");
        fadeImage(productImage, newSrc);
      }
      
      // Opdater alle links i produktkortet
      if (productLinks.length) {
        const newUrl = swatch.getAttribute("data-product-url");
        productLinks.forEach(link => {
          link.href = newUrl;
        });
      }
      
      // Opdater aktiv swatch
      const swatchContainer = swatch.closest(".swatch-container");
      if (swatchContainer) {
        swatchContainer.querySelectorAll(".swatch").forEach(s => {
          s.classList.remove("current-swatch");
          s.classList.remove("border-current");
          s.classList.add("border-transparent");
        });
        swatch.classList.add("current-swatch");
        swatch.classList.add("border-current");
        swatch.classList.remove("border-transparent");
      }
    });
  });
}

function fadeImage(imgElement, newSrc) {
  // Simpel fade transition
  imgElement.style.transition = "opacity 0.3s ease";
  imgElement.style.opacity = "0.5";
  
  setTimeout(() => {
    imgElement.addEventListener("load", function onLoad() {
      imgElement.style.opacity = "1";
      imgElement.removeEventListener("load", onLoad);
    }, { once: true });
    
    imgElement.src = newSrc;
  }, 200);
}

// Robuste initialisering der virker med defer
function init() {
  console.log("Collection swatch script loaded");
  initializeCollectionSwatches();
}

// Kør initialiseringen på den mest effektive måde
if (document.readyState === 'loading') {
  // Hvis dokumentet stadig indlæses, vent på DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Hvis DOMContentLoaded allerede er sket, kør med det samme
  init();
}