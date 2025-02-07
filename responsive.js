// responsive.js

// Pencere genişliğine bağlı olarak tasarım ölçeğini hesaplar.
// Örneğin: Tasarımda 5 kutu ve 4 boşluk için toplam genişlik 680px olarak belirlendi.
function calculateScale() {
    const designBase = 680; // Tasarım genişliği (örneğin, 5 * 120px + 4 * 20px)
    const winWidth = window.innerWidth;
    let scale = winWidth / designBase;
    // Ölçek faktörünü 0.5 ile 1 arasında sınırla
    scale = Math.max(0.5, Math.min(scale, 1));
    return scale;
  }
  
  function adjustGameResponsive() {
    const scale = calculateScale();
    
    // Base değerler (tasarımda kullanılan)
    const baseBoxWidth = 120;      // Orijinal kutu genişliği (px)
    const baseBoxHeight = 300;     // Orijinal kutu yüksekliği (px)
    const baseBlockHeight = 50;    // Orijinal blok yüksekliği (px)
    const baseGap = 20;            // Orijinal kutular arası boşluk (px)
    
    // Yeni (ölçeklenmiş) değerler:
    const newBoxWidth = baseBoxWidth * scale;
    const newBoxHeight = baseBoxHeight * scale;
    const newBlockHeight = baseBlockHeight * scale;
    const newGap = baseGap * scale;
    
    // Kutu (box) elementlerini güncelle
    const boxElements = document.querySelectorAll('.box');
    boxElements.forEach(box => {
      box.style.width = newBoxWidth + 'px';
      box.style.height = newBoxHeight + 'px';
      // Padding de orantılı ayarlanabilir (örneğin, 10px base)
      box.style.padding = (10 * scale) + 'px';
    });
    
    // Blok (block) elementlerini güncelle
    const blockElements = document.querySelectorAll('.block');
    blockElements.forEach(block => {
      block.style.height = newBlockHeight + 'px';
      block.style.marginBottom = (5 * scale) + 'px';
    });
    
    // Oyun kapsayıcısı (game-container) ayarlarını güncelle:
    // Örneğin, 5 kutu yatayda yer alıyorsa:
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      const containerWidth = (5 * newBoxWidth) + (4 * newGap);
      gameContainer.style.width = containerWidth + 'px';
      // Eğer kutular arası boşluk inline olarak ayarlanmak isteniyorsa:
      gameContainer.style.gap = newGap + 'px';
    }
    
    // İsteğe bağlı: Eğer oyunun tamamının ekrana sığması için ölçeklendirme gerekiyorsa,
    // (örneğin, yatay modda) container'ı da yeniden ölçekleyebilirsiniz:
    updateGameScale();
  }
  
  function updateGameScale() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // Header ve kelime listesinin yüksekliğini çıkararak kullanılabilir alanı hesaplayalım.
    const header = document.querySelector("header");
    const wordList = document.getElementById("word-list");
    const headerHeight = header ? header.offsetHeight : 0;
    const wordListHeight = wordList ? wordList.offsetHeight : 0;
    
    const availableHeight = window.innerHeight - headerHeight - wordListHeight - 40; // 40px ekstra margin
    
    // Oyun kapsayıcısının orijinal genişliği:
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    
    // Eğer oyun kapsayıcısı mevcut alanı aşıyorsa ölçek faktörü hesaplayalım:
    const scaleFactor = Math.min(1, availableHeight / containerHeight, window.innerWidth / containerWidth);
    
    gameContainer.style.transform = `scale(${scaleFactor})`;
    gameContainer.style.transformOrigin = "top center";
  }
  
  // Olay dinleyicileri:
  document.addEventListener('DOMContentLoaded', () => {
    adjustGameResponsive();
  });
  window.addEventListener('resize', () => {
    adjustGameResponsive();
  });
  