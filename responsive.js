// responsive.js

// Oyun temel ayarları
const rows = 5; // Kutu sayısı
const colors = ['orange', 'green', 'blue']; // Kullanılacak blok renkleri
let boxes = []; // Her kutu için blok dizileri (2D dizi)
let selectedBlock = null; // Seçilen blok bilgisi

// Tasarım ölçek faktörünü hesapla
function calculateScale() {
  const designBase = 680; // Örnek tasarım genişliği (5 kutu * 120px + 4 boşluk * 20px)
  const winWidth = window.innerWidth;
  let scale = winWidth / designBase;
  // Ölçek faktörünü 0.5 ile 1 arasında sınırla
  scale = Math.max(0.5, Math.min(scale, 1));
  return scale;
}

// Responsive stil ayarlarını güncelle
function adjustGameResponsive() {
  const scale = calculateScale();

  // Tasarımda kullanılan orijinal değerler
  const baseBoxWidth = 120;      // Orijinal kutu genişliği (px)
  const baseBoxHeight = 300;     // Orijinal kutu yüksekliği (px)
  const baseBlockHeight = 50;    // Orijinal blok yüksekliği (px)
  const baseGap = 20;            // Orijinal kutular arası boşluk (px)

  // Ölçeklenmiş değerler:
  const newBoxWidth = baseBoxWidth * scale;
  const newBoxHeight = baseBoxHeight * scale;
  const newBlockHeight = baseBlockHeight * scale;
  const newGap = baseGap * scale;

  // Her kutu (box) elementine stil uygulama:
  document.querySelectorAll('.box').forEach(box => {
    box.style.width = newBoxWidth + 'px';
    box.style.height = newBoxHeight + 'px';
    // Padding orantılı ayarlanıyor (örneğin, 10px base)
    box.style.padding = (10 * scale) + 'px';
  });

  // Her blok (block) elementine stil uygulama:
  document.querySelectorAll('.block').forEach(block => {
    block.style.height = newBlockHeight + 'px';
    block.style.marginBottom = (5 * scale) + 'px';
  });

  // Oyun kapsayıcısı (game-container) ayarlarını güncelle:
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    // Örneğin, 5 kutu yatayda yer alıyorsa:
    const containerWidth = (5 * newBoxWidth) + (4 * newGap);
    gameContainer.style.width = containerWidth + 'px';
    // Kutular arası boşluk inline olarak ayarlanıyorsa:
    gameContainer.style.gap = newGap + 'px';
  }

  // Eğer oyunun tamamı ekrana sığması için ek ölçeklendirme gerekiyorsa:
  updateGameScale();
}

// Oyun kapsayıcısının ekrana sığması için yeniden ölçeklenmesi
function updateGameScale() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) return;

  const header = document.querySelector("header");
  const wordList = document.getElementById("word-list");
  const headerHeight = header ? header.offsetHeight : 0;
  const wordListHeight = wordList ? wordList.offsetHeight : 0;
  // 40px ekstra margin dikkate alınıyor:
  const availableHeight = window.innerHeight - headerHeight - wordListHeight - 40;

  const containerWidth = gameContainer.offsetWidth;
  const containerHeight = gameContainer.offsetHeight;

  // Uygun ölçek faktörünü hesapla:
  const scaleFactor = Math.min(1, availableHeight / containerHeight, window.innerWidth / containerWidth);

  gameContainer.style.transform = `scale(${scaleFactor})`;
  gameContainer.style.transformOrigin = "top center";
}

// Fisher-Yates algoritmasıyla diziyi karıştır
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Her kutuda üst üste üç aynı renkli blok olup olmadığını kontrol et
function isValidDistribution() {
  for (let i = 0; i < rows; i++) {
    const box = boxes[i];
    for (let j = 2; j < box.length; j++) {
      if (box[j] === box[j - 1] && box[j - 1] === box[j - 2]) {
        return false;
      }
    }
  }
  return true;
}

// Oyunu başlat ve blok dağılımını oluştur
function initializeGame() {
  let blocks;
  const createBlocks = () => colors.flatMap(color => Array(6).fill(color));

  do {
    blocks = createBlocks();
    shuffle(blocks);
    // Her kutuyu boş dizi olarak başlat
    boxes = [];
    for (let i = 0; i < rows; i++) {
      boxes[i] = [];
    }
    // Blokları kutulara sırayla yerleştir
    blocks.forEach((block, index) => {
      boxes[index % rows].push(block);
    });
  } while (!isValidDistribution());

  updateBoxes();
}

// Kutulardaki blokları güncelle ve DOM'u yeniden oluştur
function updateBoxes() {
  const boxElements = document.querySelectorAll('.box');
  boxElements.forEach((boxElement, boxIndex) => {
    // Önce kutu içeriğini temizle
    boxElement.innerHTML = '';
    boxes[boxIndex].forEach(blockColor => {
      const blockElement = document.createElement('div');
      blockElement.classList.add('block', blockColor);
      boxElement.appendChild(blockElement);
    });
  });

  // Tüm bloklardan 'selected' sınıfını kaldır
  document.querySelectorAll('.block').forEach(block => block.classList.remove('selected'));
  // Seçilen bloğun en üstteki haline 'selected' sınıfı ekle
  if (selectedBlock) {
    const boxElement = document.querySelectorAll('.box')[selectedBlock.box];
    const blockElements = boxElement.querySelectorAll('.block');
    if (blockElements.length > 0) {
      const topBlock = blockElements[blockElements.length - 1];
      topBlock.classList.add('selected');
    }
  }

  checkWinCondition();

  // Önemli: Yeni oluşturulan elemanlara responsive stil ayarlarını tekrar uyguluyoruz.
  adjustGameResponsive();
}

// Her kutuya tıklama olaylarını ekle
function attachBoxClickEvents() {
  document.querySelectorAll('.box').forEach((box, boxIndex) => {
    box.addEventListener('click', () => {
      // Aynı kutu seçiliyorsa seçimi kaldır
      if (selectedBlock && selectedBlock.box === boxIndex) {
        selectedBlock = null;
        updateBoxes();
        return;
      }

      if (selectedBlock) {
        // Farklı bir kutuya tıklandıysa ve hedef kutu dolu değilse, bloğu taşı:
        if (selectedBlock.box !== boxIndex && boxes[boxIndex].length < 6) {
          const movedBlock = boxes[selectedBlock.box].pop();
          boxes[boxIndex].push(movedBlock);
          selectedBlock = null;
          checkForExplosions();
          updateBoxes();
        }
      } else {
        // Eğer tıklanan kutuda en az bir blok varsa, en üstteki bloğu seç:
        if (boxes[boxIndex].length > 0) {
          selectedBlock = {
            color: boxes[boxIndex][boxes[boxIndex].length - 1],
            box: boxIndex
          };
          updateBoxes();
        }
      }
    });
  });
}

// Üst üste gelen üç aynı renkli blok varsa bunları patlat
function checkForExplosions() {
  boxes.forEach((box, boxIndex) => {
    // En üstten başlayarak kontrol et
    for (let i = box.length - 1; i >= 2; i--) {
      const group = box.slice(i - 2, i + 1);
      if (group.every(color => color === group[0])) {
        // Üçlü grubu sil:
        box.splice(i - 2, 3);
        // Döngü sayacını ayarla
        i -= 2;
      }
    }
  });
  updateBoxes();
}

// Oyunun kazanma durumunu kontrol et
function checkWinCondition() {
  const isWin = boxes.every(box => box.length === 0);
  const messageElement = document.getElementById('message');
  if (isWin) {
    messageElement.innerText = 'Tebrikler, kazandınız!';
    messageElement.style.color = '#2e7d32';
  } else {
    messageElement.innerText = '';
  }
}

// Sayfa yüklendiğinde ve pencere yeniden boyutlandırıldığında responsive ayarları uygulanır.
document.addEventListener('DOMContentLoaded', () => {
  adjustGameResponsive();
  initializeGame();
  attachBoxClickEvents();
});

window.addEventListener('resize', () => {
  adjustGameResponsive();
});
