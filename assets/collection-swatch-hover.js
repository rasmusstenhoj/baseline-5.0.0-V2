/**
 * Click-Only Swatch Solution
 * Simpelt script, der ignorerer hover og fokuserer udelukkende på klik-funktionalitet
 */
(function() {
  console.log('===== CLICK-ONLY SWATCH SOLUTION LOADED =====');
  
  // Vent på at DOM er indlæst
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClickOnlySwatches);
  } else {
    initClickOnlySwatches();
  }
  
  function initClickOnlySwatches() {
    console.log('Initializing click-only swatch solution');
    
    // Først, lav en global delegeret event listener
    // Dette giver os både bedre performance og mulighed for at fange events fra dynamiske elementer
    document.addEventListener('click', function(event) {
      // Tjek om klikket var på en collection-swatch
      let target = event.target;
      const swatch = target.closest('.collection-swatch');
      
      // Hvis klikket ikke var på en swatch, gør intet
      if (!swatch) return;
      
      console.log('Swatch clicked:', swatch);
      
      // Stop event propagation for at forhindre andre klik-handlers
      event.stopPropagation();
      event.preventDefault();
      
      // Få data fra swatchen
      const imageUrl = swatch.getAttribute('data-product-image');
      const productUrl = swatch.getAttribute('data-product-url');
      
      if (!imageUrl) {
        console.warn('Swatch clicked but has no data-product-image attribute');
        return;
      }
      
      // Find produkt container
      const productContainer = findAncestorProductContainer(swatch);
      if (!productContainer) {
        console.error('Could not find product container for clicked swatch');
        return;
      }
      
      // Find billede container og billede
      const imageContainer = findImageContainer(productContainer);
      if (!imageContainer) {
        console.error('Could not find image container');
        return;
      }
      
      // Skab en visuel indikation af at swatchen er aktiv
      makeSwatchActive(swatch);
      
      // Opret en overlay med loading indikator
      showLoading(imageContainer);
      
      // Skift billedet
      const img = new Image();
      
      // Når billedet er indlæst, vis det
      img.onload = function() {
        // Find eksisterende billede i containeren
        const existingImg = imageContainer.querySelector('img');
        if (existingImg) {
          // Gem original src hvis det ikke allerede er gemt
          if (!productContainer.hasAttribute('data-original-image')) {
            productContainer.setAttribute('data-original-image', existingImg.src);
            
            if (existingImg.srcset) {
              productContainer.setAttribute('data-original-srcset', existingImg.srcset);
            }
          }
          
          // Skift billedet
          existingImg.src = imageUrl;
          
          // Fjern srcset for at sikre at det nye billede vises
          if (existingImg.srcset) {
            existingImg.setAttribute('data-temp-srcset', existingImg.srcset);
            existingImg.removeAttribute('srcset');
          }
        } else {
          // Hvis der ikke er et eksisterende billede, tilføj det nye
          imageContainer.appendChild(img);
        }
        
        // Opdater produktlinket hvis det er nødvendigt
        if (productUrl) {
          updateProductLinks(productContainer, productUrl);
        }
        
        // Fjern loading indikator
        hideLoading(imageContainer);
      };
      
      // Hvis billedet ikke kan indlæses, vis fejl
      img.onerror = function() {
        console.error('Failed to load image:', imageUrl);
        hideLoading(imageContainer);
      };
      
      // Start indlæsning af billedet
      let fixedImageUrl = imageUrl;
      if (imageUrl.startsWith('//')) {
        fixedImageUrl = window.location.protocol + imageUrl;
      }
      img.src = fixedImageUrl;
    });
    
    // Også tilføj en reset-metode ved at klikke på produktcontaineren, men ikke på en swatch
    document.addEventListener('click', function(event) {
      if (event.target.closest('.collection-swatch')) {
        return; // Skip hvis klikket var på en swatch
      }
      
      // Tjek om klikket var indenfor en produktcontainer
      const productContainer = event.target.closest('li') || event.target.closest('.group');
      if (!productContainer) return;
      
      // Tjek om der er en aktiv swatch i denne container
      const activeSwatch = productContainer.querySelector('.active-swatch');
      if (!activeSwatch) return;
      
      // Reset aktiv swatch
      resetActiveSwatches(productContainer);
      
      // Gendan originale billede og links
      restoreOriginals(productContainer);
    });
    
    console.log('Click-only swatch solution ready');
  }
  
  // Gør en swatch visuelt aktiv og deaktiver andre swatches i samme container
  function makeSwatchActive(swatch) {
    // Find container
    const container = swatch.closest('.collection-color-swatches') || swatch.closest('.swatch-container');
    if (!container) return;
    
    // Reset alle swatches i containeren
    const allSwatches = container.querySelectorAll('.collection-swatch');
    allSwatches.forEach(s => {
      s.classList.remove('active-swatch');
      s.style.transform = '';
      s.style.borderColor = '';
    });
    
    // Gør denne swatch aktiv
    swatch.classList.add('active-swatch');
    swatch.style.transform = 'scale(1.2)';
    swatch.style.borderColor = 'currentColor';
  }
  
  // Reset alle aktive swatches i en container
  function resetActiveSwatches(container) {
    if (!container) return;
    
    const activeSwatches = container.querySelectorAll('.active-swatch');
    activeSwatches.forEach(swatch => {
      swatch.classList.remove('active-swatch');
      swatch.style.transform = '';
      swatch.style.borderColor = '';
    });
  }
  
  // Gendan originalt billede og links
  function restoreOriginals(container) {
    if (!container) return;
    
    // Gendan originalt billede
    const originalImage = container.getAttribute('data-original-image');
    if (originalImage) {
      const imageContainer = findImageContainer(container);
      if (imageContainer) {
        const img = imageContainer.querySelector('img');
        if (img) {
          img.src = originalImage;
          
          // Gendan srcset
          const originalSrcset = container.getAttribute('data-original-srcset');
          if (originalSrcset && img.hasAttribute('data-temp-srcset')) {
            img.setAttribute('srcset', originalSrcset);
            img.removeAttribute('data-temp-srcset');
          }
        }
      }
    }
    
    // Gendan originale links
    const originalUrl = container.getAttribute('data-original-url');
    if (originalUrl) {
      updateProductLinks(container, originalUrl);
    }
  }
  
  // Vis loading indikator
  function showLoading(container) {
    // Tjek om der allerede er en loading indikator
    if (container.querySelector('.swatch-loading')) return;
    
    // Opret loading element
    const loading = document.createElement('div');
    loading.className = 'swatch-loading';
    loading.style.position = 'absolute';
    loading.style.top = '0';
    loading.style.left = '0';
    loading.style.right = '0';
    loading.style.bottom = '0';
    loading.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    loading.style.display = 'flex';
    loading.style.alignItems = 'center';
    loading.style.justifyContent = 'center';
    loading.style.zIndex = '40';
    
    // Tilføj spinner
    const spinner = document.createElement('div');
    spinner.className = 'swatch-spinner';
    spinner.style.border = '3px solid rgba(0, 0, 0, 0.1)';
    spinner.style.borderTop = '3px solid rgba(0, 0, 0, 0.5)';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '30px';
    spinner.style.height = '30px';
    spinner.style.animation = 'swatch-spin 1s linear infinite';
    
    // Tilføj keyframes for spin animation
    if (!document.querySelector('#swatch-spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'swatch-spin-keyframes';
      style.textContent = `
        @keyframes swatch-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    loading.appendChild(spinner);
    container.appendChild(loading);
  }
  
  // Fjern loading indikator
  function hideLoading(container) {
    const loading = container.querySelector('.swatch-loading');
    if (loading) {
      loading.remove();
    }
  }
  
  // Opdater produkt-links
  function updateProductLinks(container, url) {
    // Gem original URL hvis ikke allerede gemt
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
  
  // Find produkt-container (går op i DOM hierarkiet)
  function findAncestorProductContainer(element) {
    // Check op til 10 levels op
    let current = element;
    let depth = 0;
    
    while (current && depth < 10) {
      // Tjek for typiske produktcontainer elementer
      if (current.tagName === 'LI' || 
          current.classList.contains('group') ||
          current.classList.contains('product-tile')) {
        return current;
      }
      
      current = current.parentElement;
      depth++;
    }
    
    return null;
  }
  
  // Find billedcontainer
  function findImageContainer(container) {
    // Prøv forskellige selektorer
    const selectors = [
      'div.relative[style*="padding-top"]',
      'div.relative',
      'img',
      '.image-container',
      '.product-image'
    ];
    
    for (const selector of selectors) {
      try {
        const element = container.querySelector(selector);
        if (element) {
          // Hvis det er et <img> element, returner dets parent
          if (element.tagName === 'IMG') {
            return element.parentElement;
          }
          return element;
        }
      } catch (e) {
        // Ignorer fejl i selektorer
      }
    }
    
    // Fallback til første element der indeholder et billede
    const imgs = container.querySelectorAll('img');
    if (imgs.length > 0) {
      return imgs[0].parentElement;
    }
    
    return null;
  }
})();