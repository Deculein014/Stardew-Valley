const ROWS = 24, COLS = 28;
const grid = Array.from({length: ROWS}, () => Array(COLS).fill(null));
let currentTool = 'normal';

const TOOLS = {
  normal:    { emoji: '💧', rangeClass: 'range-normal' },
  quality:   { emoji: '🚿', rangeClass: 'range-quality' },
  iridium:   { emoji: '⚙️', rangeClass: 'range-iridium' },
  scarecrow: { emoji: '🌾', rangeClass: 'range-scarecrow' },
};

function getRange(type, row, col) {
  const cells = [];
  if (type === 'normal') {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => cells.push([row+dr, col+dc]));
  } else if (type === 'quality') {
    for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
      if (dr===0 && dc===0) continue;
      cells.push([row+dr, col+dc]);
    }
  } else if (type === 'iridium') {
    for (let dr=-2; dr<=2; dr++) for (let dc=-2; dc<=2; dc++) {
      if (dr===0 && dc===0) continue;
      cells.push([row+dr, col+dc]);
    }
  } else if (type === 'scarecrow') {
    for (let dr=-8; dr<=8; dr++) for (let dc=-8; dc<=8; dc++) {
      if (dr===0 && dc===0) continue;
      if (Math.sqrt(dr*dr + dc*dc) <= 8) cells.push([row+dr, col+dc]);
    }
  }
  return cells.filter(([r,c]) => r>=0 && r<ROWS && c>=0 && c<COLS);
}

function buildGrid() {
  const container = document.getElementById('grid');
  container.innerHTML = '';
  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `c-${r}-${c}`;
      cell.onclick = () => handleClick(r, c);
      container.appendChild(cell);
    }
  }
}

function handleClick(r, c) {
  if (currentTool === 'erase') {
    grid[r][c] = null;
  } else {
    grid[r][c] = grid[r][c] === currentTool ? null : currentTool;
  }
  render();
}

function render() {
  const rangeTypes = {};
  for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
    const type = grid[r][c];
    if (!type) continue;
    for (const [rr,cc] of getRange(type, r, c)) {
      const key = `${rr},${cc}`;
      if (!rangeTypes[key]) rangeTypes[key] = new Set();
      rangeTypes[key].add(type);
    }
  }

  let counts = {normal:0, quality:0, iridium:0, scarecrow:0};
  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS; c++) {
      const cell = document.getElementById(`c-${r}-${c}`);
      const type = grid[r][c];
      const key = `${r},${c}`;
      cell.className = 'cell';
      cell.innerHTML = '';
      if (type) {
        counts[type]++;
        cell.innerHTML = TOOLS[type].emoji;
      } else if (rangeTypes[key]) {
        const types = [...rangeTypes[key]];
        cell.classList.add(TOOLS[types[0]].rangeClass);
      }
    }
  }

  const parts = [];
  if (counts.normal) parts.push(`${counts.normal} sprinkler`);
  if (counts.quality) parts.push(`${counts.quality} quality`);
  if (counts.iridium) parts.push(`${counts.iridium} iridium`);
  if (counts.scarecrow) parts.push(`${counts.scarecrow} scarecrow`);
  document.getElementById('info').textContent = parts.length
    ? 'Placed: ' + parts.join(' · ')
    : 'Select a tool and click tiles to place items.';
}

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function clearAll() {
  for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) grid[r][c] = null;
  render();
}

buildGrid();
render();