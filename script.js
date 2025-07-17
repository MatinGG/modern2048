const size = 4,
      grid = document.getElementById('grid');

// Pastel palette – feel free to tweak values or add more hues
// 🌈 Cute & punchy 2048 palette: bold warm → playful vivid
const PALETTE = [
  '#FFC96C', //   2 – peachy orange
  '#FFA447', //   4 – tangerine
  '#FF7A59', //   8 – coral
  '#FF3B30', //  16 – 🍓 strawberry red (milestone!)
  '#FF5DA2', //  32 – pink lemonade
  '#D96CFF', //  64 – violet candy
  '#8F7CFF', // 128 – blueberry pop
  '#4AC8ED', // 256 – bubblegum blue
  '#00DFA2', // 512 – mint jelly
  '#A2E04F', // 1024 – sour apple
  '#F9E84C'  // 2048+ – 🍯 honey gold sparkle
  
];



let board = Array.from({ length: size }, () => Array(size).fill(0));
let prevBoard = board.map(r => [...r]);

// Build placeholder cells
for (let i = 0; i < size * size; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  grid.appendChild(cell);
}

function spawn() {
  const empty = [];
  board.forEach((row, y) => row.forEach((v, x) => !v && empty.push([y, x])));
  if (empty.length) {
    const [y, x] = empty[Math.random() * empty.length | 0];
    board[y][x] = Math.random() < 0.9 ? 2 : 4;
  }
}

function slide(row) {
  row = row.filter(Boolean);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      row.splice(i + 1, 1);
    }
  }
  return [...row, ...Array(size - row.length).fill(0)];
}

const rotate = b => b[0].map((_, i) => b.map(r => r[i]).reverse());

function move(dir) {
  let r = board;
  const k = { left: 0, up: 3, right: 2, down: 1 }[dir];
  for (let i = 0; i < k; i++) r = rotate(r);
  const before = JSON.stringify(r);
  r = r.map(slide);
  for (let i = 0; i < (4 - k) % 4; i++) r = rotate(r);
  if (before !== JSON.stringify(r)) {
    board = r;
    spawn();
    draw();
  }
}

function bounce(el) {
  el.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.12)' },
    { transform: 'scale(1)' }
  ], {
    duration: 200,
    easing: 'ease-out'
  });
}

function getColor(v) {
  if (v === 0) return '#EDE4D4'; // empty tile color
  const idx = Math.log2(v) - 1;
  if (idx < PALETTE.length) return PALETTE[idx];
  // fallback: pastel hue wheel
  const h = (idx * 42) % 360;
  return `hsl(${h}, 70%, 85%)`;
}

function draw() {
  [...grid.children].forEach((cell, i) => {
    const y = Math.floor(i / size);
    const x = i % size;
    const v = board[y][x];
    const old = prevBoard[y][x];

    // No numbers displayed – purely color blocks
    cell.textContent = '';
    cell.style.backgroundColor = getColor(v);

    // Bounce animation on change
    if (v !== old && v !== 0) bounce(cell);
  });

  prevBoard = board.map(r => [...r]);
}

// Controls
const keys = {
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down'
};

document.addEventListener('keydown', ({ key }) => {
  const dir = keys[key.toLowerCase()];
  if (dir) move(dir);
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  if (e.changedTouches.length !== 1) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Avoid accidental taps
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

spawn();
spawn();
draw();