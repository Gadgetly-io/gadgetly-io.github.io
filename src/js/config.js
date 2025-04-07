export const CONFIG = {
  // Labirinta izmēri
  defaultCols: 25,
  defaultRows: 25,
  minSize: 10,
  maxSize: 50,

  // Ģenerēšanas ātrums
  defaultSpeed: 5,
  minSpeed: 1,
  maxSpeed: 20,

  // Sākuma zona
  defaultStartArea: {
    x: 0,
    y: 0,
    w: 3,
    h: 3,
    entry: { x: 2, y: 1 },
    exit: { x: 2, y: 2 }
  },

  // Kontroles punkta zona
  defaultCheckpointArea: {
    x: 11,
    y: 11,
    w: 6,
    h: 6,
    entry: { x: 0, y: 1 },
    exit: { x: 2, y: 1 }
  },

  // Beigu zona
  defaultFinishArea: {
    x: 22,
    y: 22,
    w: 3,
    h: 3,
    entry: { x: 0, y: 1 },
    exit: { x: 0, y: 2 }
  },

  // Randomizācijas parametri
  randomization: {
    minBranches: 30,
    maxBranches: 45,
    minDistance: 3,
    edgeChangeProb: 95,
    changeProb: 85
  },

  // Krāsas
  colors: {
    background: '#e0e5ec',
    primary: '#6c5ce7',
    secondary: '#00b894',
    accent: '#fdcb6e',
    text: '#2d3436'
  }
}; 