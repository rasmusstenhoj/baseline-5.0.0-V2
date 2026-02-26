/**
 * Collection Swatch Hover for Top Position
 * Enkel implementation der håndterer swatches placeret øverst på produktkortet
 */
(function() {
  console.log('===== COLLECTION SWATCH HOVER FOR TOP POSITION LOADED =====');
  
  // Initialiser når DOM er klar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwatchHover);
  } else {
    initSwatchHover();
  }
  
  function initSwatchHover() {
    console.log('Initializing swatch hover for top position');
    
    // Find alle swatches
    const swatches = document.querySelectorAll('.collection-swatch');
    console.log(`Found ${swatches.length} swatches`);
    
    if (swatches.length === 0) return;
    
    // For hver swatch, tilføj hover og klik event listeners
    swatches.forEach((swatch, index) => {
      // Ignorer den aktuelle/nuværende swatch
      if (swatch.classList.contains('current-swatch')) return;
      
      // Hent data fra swatchen
      const productImageUrl = swatch.getAttribute('data-product-image');
      const productUrl = swatch.getAttribute('data-product-url');
      
      if (!productImageUrl) {
        console.warn(`Swatch #${index} has no product image URL`);
        return;
      }
      
      // Find produktcontainer (li, group eller lignende)
      const productContainer = findProductContainer(swatch);
      if (!productContainer) {
        console.warn(`Could not find product container for swatch #${index}`);
        return;
      }
      
      // Hover event - viser alternativt billede
      swatch.addEventListener('mouseenter', function() {
        // Find og gem den aktuelle valgte swatch
        const currentActive = productContainer.querySelector('.collection-swatch.hover-active');
        
        // Fremhæv denne swatch og de-highlight andre
        if (currentActive && currentActive !== swatch) {
          currentActive.classList.remove('hover-active');
        }
        swatch.classList.add('hover-active');
        
        // Find og opdater billede
        const productImage = findProductImage(productContainer);
        if (productImage) {
          // Gem original billede hvis det ikke allerede er gemt
          if (!productContainer.hasAttribute('data-original-image')) {
            productContainer.setAttribute('data-original-image', productImage.src);
            if (productImage.srcset) {
              productContainer.setAttribute('data-original-srcset', productImage.srcset);
            }
          }
          
          // Sæt nyt billede
          productImage.src = productImageUrl;
          
          // Fjern midlertidigt srcset for at sikre, at det rigtige billede vises
          if (productImage.srcset) {
            productImage.setAttribute('data-temp-srcset', productImage.srcset);
            productImage.removeAttribute('srcset');
          }
          
          // Opdater også produkt URL'er
          if (productUrl) {
            updateProductLinks(productContainer, productUrl);
          }
        }
      });
      
      // Mouseleave event - går tilbage til det oprindelige billede
      swatch.addEventListener('mouseleave', function() {
        // Vi fjerner kun hover-active klassen, men genopretter ikke billedet endnu
        // da brugeren kan flytte musen til en anden swatch
        swatch.classList.remove('hover-active');
        
        // Tjek om der er andre aktive swatches
        const anyActive = productContainer.querySelector('.collection-swatch.hover-active');
        
        // Hvis der ikke er nogen aktive swatches, gendan det oprindelige billede
        if (!anyActive) {
          restoreOriginal(productContainer);
        }
      });
      
      // Klik event - vælger denne swatch permanent
      swatch.addEventListener('click', function(event) {
        // Stop event propagation for at sikre, at klikket ikke propageres
        event.preventDefault();
        event.stopPropagation();
        
        // Marker denne swatch som valgt og fjern fra andre
        const allSwatches = productContainer.querySelectorAll('.collection-swatch');
        allSwatches.forEach(s => s.classList.remove('selected-swatch'));
        swatch.classList.add('selected-swatch');
        
        // Find og opdater billede (samme som ved hover)
        const productImage = findProductImage(productContainer);
        if (productImage) {
          productImage.src = productImageUrl;
          
          if (productImage.srcset) {
            productImage.setAttribute('data-temp-srcset', productImage.srcset);
            productImage.removeAttribute('srcset');
          }
        }
        
        // Opdater også produkt URL'er
        if (productUrl) {
          updateProductLinks(productContainer, productUrl);
        }
      });
    });
    
    // Tilføj global event listener for at detektere klik udenfor swatches
    document.addEventListener('click', function(event) {
      if (event.target.closest('.collection-swatch')) return;
      
      // Reset alle valgte swatches ved klik udenfor
      document.querySelectorAll('.collection-swatch.selected-swatch').forEach(swatch => {
        swatch.classList.remove('selected-swatch');
        
        // Find produktcontaineren
        const productContainer = findProductContainer(swatch);
        if (productContainer) {
          restoreOriginal(productContainer);
        }
      });
    });
    
    console.log('Swatch hover initialization complete');
  }
  
  // Hjælpefunktion til at finde produktcontaineren
  function findProductContainer(element) {
    // Start med nærmeste swatch container
    let container = element.closest('.collection-swatch-top-container');
    
    // Hvis det ikke er den øverste container, prøv at gå op
    if (!container) {
      container = element.closest('.collection-color-swatches');
    }
    
    // Gå til nærmeste li eller produktcontainer
    if (container) {
      // Hvis vi fandt en container, gå til dens sibling eller parent li/group
      let sibling = container.nextElementSibling;
      while (sibling) {
        if (sibling.classList.contains('group') || 
            sibling.tagName === 'LI' || 
            sibling.classList.contains('product-tile')) {
          return sibling;
        }
        sibling = sibling.nextElementSibling;
      }
      
      // Hvis ingen sibling fundet, prøv parent
      let parent = container.parentElement;
      while (parent) {
        if (parent.classList.contains('group') || 
            parent.tagName === 'LI' || 
            parent.classList.contains('product-tile')) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }
    
    // Alternativt, prøv direkte parent navigation
    return element.closest('.group') || 
           element.closest('li') || 
           element.closest('.product-tile');
  }
  
  // Hjælpefunktion til at finde produktbilledet
  function findProductImage(container) {
    // Prioriteret liste af selektorer
    const selectors = [
      'image-fit img', // Typisk struktur i dette tema
      'image-with-placeholder img',
      'img[loading="lazy"]',
      'img:not([aria-hidden="true"])',
      '.relative img',
      'img' // Fallback til ethvert billede
    ];
    
    // Prøv hver selektor
    for (const selector of selectors) {
      try {
        const img = container.querySelector(selector);
        if (img && img.tagName === 'IMG') {
          return img;
        }
      } catch (e) {
        // Ignorer eventuelle fejl i selektorer
      }
    }
    
    return null;
  }
  
  // Opdater alle produkt-URL'er
  function updateProductLinks(container, url) {
    // Gem den oprindelige URL, hvis den ikke allerede er gemt
    if (!container.hasAttribute('data-original-url')) {
      const firstLink = container.querySelector('a[href*="/products/"]');
      if (firstLink) {
        container.setAttribute('data-original-url', firstLink.getAttribute('href'));
      }
    }
    
    // Opdater alle links
    const links = container.querySelectorAll('a[href*="/products/"]');
    links.forEach(link => {
      link.setAttribute('href', url);
    });
  }
  
  // Gendan det oprindelige billede og links
  function restoreOriginal(container) {
    if (!container) return;
    
    // Gendan det oprindelige billede
    const originalImage = container.getAttribute('data-original-image');
    if (originalImage) {
      const productImage = findProductImage(container);
      if (productImage) {
        productImage.src = originalImage;
        
        // Gendan srcset
        const originalSrcset = container.getAttribute('data-original-srcset');
        if (originalSrcset && productImage.hasAttribute('data-temp-srcset')) {
          productImage.setAttribute('srcset', originalSrcset);
          productImage.removeAttribute('data-temp-srcset');
        }
      }
    }
    
    // Gendan de oprindelige links
    const originalUrl = container.getAttribute('data-original-url');
    if (originalUrl) {
      const links = container.querySelectorAll('a[href*="/products/"]');
      links.forEach(link => {
        link.setAttribute('href', originalUrl);
      });
    }
  }
})();