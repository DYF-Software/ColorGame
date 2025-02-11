const rows = 5; // Kutu sayısı
const colors = ['orange', 'green', 'blue']; // Kullanılacak renkler
const boxes = []; // Kutu dizisi (2D)
let selectedBlock = null; // Seçilen blok

// Fisher-Yates algoritmasıyla karıştırma
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Üst üste üç aynı renk olup olmadığını kontrol et
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

// Oyunu başlat
function initializeGame() {
  let blocks;
  const createBlocks = () => colors.flatMap(color => Array(6).fill(color));

  do {
    blocks = createBlocks();
    shuffle(blocks);
    for (let i = 0; i < rows; i++) {
      boxes[i] = [];
    }
    blocks.forEach((block, index) => {
      boxes[index % rows].push(block);
    });
  } while (!isValidDistribution());

  updateBoxes();
}

function updateBoxes() {
  const boxElements = document.querySelectorAll('.box');
  boxElements.forEach((boxElement, boxIndex) => {
    boxElement.innerHTML = '';
    boxes[boxIndex].forEach(blockColor => {
      const blockElement = document.createElement('div');
      blockElement.classList.add('block', blockColor);
      boxElement.appendChild(blockElement);
    });
  });

  document.querySelectorAll('.block').forEach(block => block.classList.remove('selected'));
  if (selectedBlock) {
    const boxElement = document.querySelectorAll('.box')[selectedBlock.box];
    const blockElements = boxElement.querySelectorAll('.block');
    const topBlock = blockElements[blockElements.length - 1];
    if (topBlock) {
      topBlock.classList.add('selected');
    }
  }

  checkWinCondition();
}

document.querySelectorAll('.box').forEach((box, boxIndex) => {
  box.addEventListener('click', () => {
    if (selectedBlock && selectedBlock.box === boxIndex) {
      selectedBlock = null;
      updateBoxes();
      return;
    }

    if (selectedBlock) {
      if (selectedBlock.box !== boxIndex && boxes[boxIndex].length < 6) {
        const movedBlock = boxes[selectedBlock.box].pop();
        boxes[boxIndex].push(movedBlock);
        selectedBlock = null;
        checkForExplosions();
        updateBoxes();
      }
    } else {
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

function checkForExplosions() {
  boxes.forEach((box, boxIndex) => {
    const boxStack = boxes[boxIndex];
    for (let i = boxStack.length - 1; i >= 2; i--) {
      const group = boxStack.slice(i - 2, i + 1);
      if (group.every(color => color === group[0])) {
        boxStack.splice(i - 2, 3);
        i -= 2;
      }
    }
  });
  updateBoxes();
}

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

initializeGame();
