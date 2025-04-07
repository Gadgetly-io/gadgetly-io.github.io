import { Cell } from './Cell.js';
import { CONFIG } from './config.js';

export class MazeGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cols = CONFIG.defaultCols;
    this.rows = CONFIG.defaultRows;
    this.cellSize = canvas.width / this.cols;
    this.grid = [];
    this.stack = [];
    this.isGenerating = false;
    this.generationTimeout = null;
    this.activeGrowthCount = 0;
    this.largeAreas = [
      CONFIG.defaultStartArea,
      CONFIG.defaultCheckpointArea,
      CONFIG.defaultFinishArea
    ];
  }

  initialize() {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid.push(new Cell(x, y));
      }
    }
  }

  getCell(x, y) {
    const index = x + y * this.cols;
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
    return this.grid[index];
  }

  markBlockedAreas() {
    this.largeAreas.forEach(area => {
      for (let dy = 0; dy < area.h; dy++) {
        for (let dx = 0; dx < area.w; dx++) {
          const cell = this.getCell(area.x + dx, area.y + dy);
          if (cell) {
            cell.visited = true;
            cell.color = CONFIG.colors.background;

            if (dx > 0) cell.walls[3] = false;
            if (dx < area.w - 1) cell.walls[1] = false;
            if (dy > 0) cell.walls[0] = false;
            if (dy < area.h - 1) cell.walls[2] = false;

            cell.blocked = dx === 0 || dx === area.w - 1 || dy === 0 || dy === area.h - 1;
          }
        }
      }
    });
  }

  createMainPath() {
    if (this.largeAreas.length < 2) {
      // Ja nav pietiekami daudz largeAreas, izveido ceļu no 0,0 uz maksimālo x,y
      const startPoint = { x: 0, y: 0 };
      const endPoint = { x: this.cols - 1, y: this.rows - 1 };

      // Izveido starppunktu
      const midPoint = this.generateRandomMidPoint(startPoint, endPoint);

      // Ģenerē ceļu
      this.generatePathWithMidPoint(startPoint, midPoint, endPoint);
      return;
    }

    // Izveido ceļu starp katru secīgo largeArea
    for (let i = 0; i < this.largeAreas.length - 1; i++) {
      const currentArea = this.largeAreas[i];
      const nextArea = this.largeAreas[i + 1];

      // Izveido ceļu no pašreizējā laukuma izejas uz nākamā laukuma ieeju
      const startPoint = {
        x: currentArea.x + currentArea.exit.x,
        y: currentArea.y + currentArea.exit.y
      };

      const endPoint = {
        x: nextArea.x + nextArea.entry.x,
        y: nextArea.y + nextArea.entry.y
      };

      // Izveido starppunktu
      const midPoint = this.generateRandomMidPoint(startPoint, endPoint);
      const midPoint2 = this.generateRandomMidPoint(startPoint, midPoint);

      // Ģenerē ceļu
      this.generatePathWithMidPoint(startPoint, endPoint, midPoint, midPoint2);
    }
  }

  generateRandomMidPoint(start, end) {
    // Aprēķina attālumu starp punktiem
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Izvēlas random attālumu no sākuma punkta (70-90% no kopējā ceļa)
    const progress = 0.7 + Math.random() * 0.2;
    
    // Aprēķina starppunkta koordinātas
    let midX = Math.floor(start.x + dx * progress);
    let midY = Math.floor(start.y + dy * progress);
    
    // Pārbauda, vai punkts nav ārpus labirinta robežām
    midX = Math.max(1, Math.min(midX, this.cols - 2));
    midY = Math.max(1, Math.min(midY, this.rows - 2));
    
    // Pārbauda, vai punkts nav pārāk tuvu mērķim
    const distanceToEnd = Math.abs(midX - end.x) + Math.abs(midY - end.y);
    if (distanceToEnd < 3) {
      // Ja punkts ir pārāk tuvu mērķim, pārvieto to tālāk
      midX = Math.floor(start.x + dx * (progress - 0.1));
      midY = Math.floor(start.y + dy * (progress - 0.1));
    }
    
    return { x: midX, y: midY };
  }

  generatePathWithMidPoint(start, end, ...mid) {
    // pa vidu var būt vairāki starppunkti, kur iegūtās ceļa daļas tiks apvienotas un no viena starppunkta aiziet un otra starppunkta ieeja
    // Pārbauda, vai ir vairāki starppunkti
    if (mid.length > 1) {
      // izveido loop, kur izveido ceļu no start uz mid[0], no mid[0] uz mid[1], no mid[1] uz end
      this.generatePathSegment(start, mid[0]);
      for (let i = 0; i < mid.length - 1; i++) {
        this.generatePathSegment(mid[i], mid[i + 1]);
      }
      this.generatePathSegment(mid[mid.length - 1], end);
    } else {
      // Ģenerē ceļu no start uz mid
      this.generatePathSegment(start, mid[0]);
      // Ģenerē ceļu no mid uz end
      this.generatePathSegment(mid[0], end);
    }
  }

  generatePathSegment(start, end) {
    let currentX = start.x;
    let currentY = start.y;
    const visited = new Set();
    visited.add(`${currentX},${currentY}`);

    while (currentX !== end.x || currentY !== end.y) {
      const cell = this.getCell(currentX, currentY);
      if (!cell) break;

      cell.visited = true;
      cell.color = CONFIG.colors.secondary;

      const possibleMoves = [];

      // Pārbauda iespējamos gājienus
      if (currentX < end.x && !visited.has(`${currentX + 1},${currentY}`)) {
        possibleMoves.push({ dx: 1, dy: 0 });
      }
      if (currentX > end.x && !visited.has(`${currentX - 1},${currentY}`)) {
        possibleMoves.push({ dx: -1, dy: 0 });
      }
      if (currentY < end.y && !visited.has(`${currentX},${currentY + 1}`)) {
        possibleMoves.push({ dx: 0, dy: 1 });
      }
      if (currentY > end.y && !visited.has(`${currentX},${currentY - 1}`)) {
        possibleMoves.push({ dx: 0, dy: -1 });
      }

      // Ja nav iespējamo gājienu, mēģina atrast alternatīvu ceļu
      if (possibleMoves.length === 0) {
        const neighbors = this.getUnvisitedNeighbors(cell);
        if (neighbors.length > 0) {
          const next = neighbors[Math.floor(Math.random() * neighbors.length)];
          cell.removeWallBetween(next.cell);
          currentX = next.cell.x;
          currentY = next.cell.y;
          visited.add(`${currentX},${currentY}`);
          continue;
        }
        break;
      }

      // Izvēlas random gājienu no iespējamiem
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const nextCell = this.getCell(currentX + move.dx, currentY + move.dy);

      if (nextCell) {
        cell.removeWallBetween(nextCell);
        currentX += move.dx;
        currentY += move.dy;
        visited.add(`${currentX},${currentY}`);
      }
    }
  }

  getUnvisitedNeighbors(cell) {
    const directions = [
      { dx: 0, dy: -1, dir: 0 },
      { dx: 1, dy: 0, dir: 1 },
      { dx: 0, dy: 1, dir: 2 },
      { dx: -1, dy: 0, dir: 3 }
    ];
    const neighbors = [];

    directions.forEach(({ dx, dy, dir }) => {
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      const neighbor = this.getCell(nx, ny);
      if (neighbor && !neighbor.visited && !neighbor.blocked) {
        const hasVisitedNeighbor = directions.some(({ dx: ddx, dy: ddy }) => {
          const checkX = nx + ddx;
          const checkY = ny + ddy;
          const checkCell = this.getCell(checkX, checkY);
          return checkCell && checkCell.visited && checkCell !== cell;
        });

        if (!hasVisitedNeighbor || Math.random() < 0.3) {
          neighbors.push({ cell: neighbor, dir });
        }
      }
    });
    return neighbors;
  }

  generateMazeStep(current) {
    if (!this.isGenerating) return;

    current.visited = true;
    current.color = CONFIG.colors.primary;
    const neighbors = this.getUnvisitedNeighbors(current);

    if (neighbors.length > 0) {
      const lastDirection = this.stack.length > 0 ?
        { dx: current.x - this.stack[this.stack.length - 1].x, dy: current.y - this.stack[this.stack.length - 1].y } :
        null;

      let next;
      if (lastDirection && this.stack.length > 2) {
        const isNearEdge = current.x <= 1 || current.x >= this.cols - 2 || current.y <= 1 || current.y >= this.rows - 2;
        const changeDirectionProbability = isNearEdge ? CONFIG.randomization.edgeChangeProb / 100 : CONFIG.randomization.changeProb / 100;

        if (Math.random() < changeDirectionProbability) {
          const perpendicularNeighbors = neighbors.filter(({ cell }) => {
            const dx = cell.x - current.x;
            const dy = cell.y - current.y;

            if (isNearEdge) {
              if (current.x <= 1 && dx <= 0) return false;
              if (current.x >= this.cols - 2 && dx >= 0) return false;
              if (current.y <= 1 && dy <= 0) return false;
              if (current.y >= this.rows - 2 && dy >= 0) return false;
            }

            return (dx !== lastDirection.dx && dy !== lastDirection.dy);
          });

          if (perpendicularNeighbors.length > 0) {
            next = perpendicularNeighbors[Math.floor(Math.random() * perpendicularNeighbors.length)];
          } else {
            const awayFromEdgeNeighbors = neighbors.filter(({ cell }) => {
              if (current.x <= 1) return cell.x > current.x;
              if (current.x >= this.cols - 2) return cell.x < current.x;
              if (current.y <= 1) return cell.y > current.y;
              if (current.y >= this.rows - 2) return cell.y < current.y;
              return true;
            });

            next = awayFromEdgeNeighbors.length > 0 ?
              awayFromEdgeNeighbors[Math.floor(Math.random() * awayFromEdgeNeighbors.length)] :
              neighbors[Math.floor(Math.random() * neighbors.length)];
          }
        } else {
          next = neighbors[Math.floor(Math.random() * neighbors.length)];
        }
      } else {
        next = neighbors[Math.floor(Math.random() * neighbors.length)];
      }

      current.removeWallBetween(next.cell);
      this.stack.push(current);
      this.draw();
      const speed = parseInt(document.getElementById('generationSpeed').value);
      this.generationTimeout = setTimeout(() => this.generateMazeStep(next.cell), speed);
    } else if (this.stack.length > 0) {
      const back = this.stack.pop();
      this.draw();
      const speed = parseInt(document.getElementById('generationSpeed').value);
      this.generationTimeout = setTimeout(() => this.generateMazeStep(back), speed);
    } else {
      this.activeGrowthCount--;
      if (this.activeGrowthCount === 0) {
        this.generationTimeout = setTimeout(() => this.finalizeMaze(), 500);
      }
    }
  }

  getMainPathCells() {
    return this.grid.filter(cell => cell.color === CONFIG.colors.secondary);
  }

  getBranchingPoints() {
    const mainPathCells = this.getMainPathCells();
    const branchingPoints = [];

    mainPathCells.forEach(cell => {
      const neighbors = this.getUnvisitedNeighbors(cell);
      if (neighbors.length >= 1) {
        if (Math.random() < 0.6) {
          branchingPoints.push(cell);
        }
      }
    });

    return branchingPoints;
  }

  generateBranchFromPoint(startCell) {
    const neighbors = this.getUnvisitedNeighbors(startCell);
    if (neighbors.length > 0) {
      const { cell: next } = neighbors[Math.floor(Math.random() * neighbors.length)];
      startCell.removeWallBetween(next);
      next.visited = true;
      next.color = CONFIG.colors.primary;
      return next;
    }
    return null;
  }

  generateBranches() {
    const branchingPoints = this.getBranchingPoints();
    if (branchingPoints.length === 0) return;

    const numBranches = Math.floor(Math.random() * (CONFIG.randomization.maxBranches - CONFIG.randomization.minBranches + 1)) + CONFIG.randomization.minBranches;
    const selectedPoints = [];

    for (let i = 0; i < Math.min(numBranches, branchingPoints.length); i++) {
      let attempts = 0;
      let found = false;

      while (!found && attempts < 10) {
        const randomIndex = Math.floor(Math.random() * branchingPoints.length);
        const point = branchingPoints[randomIndex];

        const isTooClose = selectedPoints.some(selectedPoint => {
          const dx = Math.abs(point.x - selectedPoint.x);
          const dy = Math.abs(point.y - selectedPoint.y);
          return dx + dy < CONFIG.randomization.minDistance;
        });

        if (!isTooClose) {
          selectedPoints.push(point);
          branchingPoints.splice(randomIndex, 1);
          found = true;
        }

        attempts++;
      }
    }

    selectedPoints.forEach(point => {
      const branchCell = this.generateBranchFromPoint(point);
      if (branchCell) {
        this.activeGrowthCount++;
        this.generateMazeStep(branchCell);
      }
    });
  }

  openUnvisitedCells() {
    const unvisitedCells = this.grid.filter(cell => !cell.visited && !cell.blocked);
    const shuffledCells = unvisitedCells.sort(() => Math.random() - 0.5);

    shuffledCells.forEach(cell => {
      if (cell.visited) return;

      const directions = [
        { dx: 0, dy: -1, dir: 0, wallIndex: 0 },
        { dx: 1, dy: 0, dir: 1, wallIndex: 1 },
        { dx: 0, dy: 1, dir: 2, wallIndex: 2 },
        { dx: -1, dy: 0, dir: 3, wallIndex: 3 }
      ];

      const shuffledDirections = directions.sort(() => Math.random() - 0.5);

      for (const { dx, dy, wallIndex } of shuffledDirections) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        const neighbor = this.getCell(nx, ny);

        if (neighbor &&
          !neighbor.blocked &&
          neighbor.color !== CONFIG.colors.secondary &&
          !this.largeAreas.some(area =>
            nx >= area.x && nx < area.x + area.w &&
            ny >= area.y && ny < area.y + area.h
          )) {

          cell.walls[wallIndex] = false;
          neighbor.walls[(wallIndex + 2) % 4] = false;

          cell.visited = true;
          neighbor.visited = true;

          cell.color = CONFIG.colors.accent;
          neighbor.color = CONFIG.colors.accent;

          break;
        }
      }
    });

    this.draw();
  }

  finalizeMaze() {
    this.openUnvisitedCells();
    setTimeout(() => {
      this.grid.forEach(cell => {
        cell.color = CONFIG.colors.background;
      });
      this.draw();
    }, 2000);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.forEach(cell => cell.draw(this.ctx, this.cellSize));
  }

  startBranching() {
    if (!this.isGenerating) return;

    if (this.activeGrowthCount === 0) {
      this.generateBranches();
      if (this.activeGrowthCount === 0) {
        this.generationTimeout = setTimeout(() => this.finalizeMaze(), 500);
      } else {
        this.generationTimeout = setTimeout(() => this.startBranching(), 50);
      }
    } else {
      this.generationTimeout = setTimeout(() => this.startBranching(), 50);
    }
  }

  stopGeneration() {
    this.isGenerating = false;
    if (this.generationTimeout) {
      clearTimeout(this.generationTimeout);
      this.generationTimeout = null;
    }
    this.stack = [];
    this.activeGrowthCount = 0;
  }

  generateNewMaze() {
    this.stopGeneration();

    this.cols = parseInt(document.getElementById('cols').value);
    this.rows = parseInt(document.getElementById('rows').value);
    this.cellSize = this.canvas.width / this.cols;

    this.largeAreas = [
      {
        x: parseInt(document.getElementById('startX').value),
        y: parseInt(document.getElementById('startY').value),
        w: parseInt(document.getElementById('startW').value),
        h: parseInt(document.getElementById('startH').value),
        type: 'start',
        entry: { x: 2, y: 1 },
        exit: { x: 2, y: 2 }
      },
      {
        x: parseInt(document.getElementById('checkpointX').value),
        y: parseInt(document.getElementById('checkpointY').value),
        w: parseInt(document.getElementById('checkpointW').value),
        h: parseInt(document.getElementById('checkpointH').value),
        type: 'checkpoint',
        entry: { x: 0, y: 1 },
        exit: { x: 2, y: 1 }
      },
      {
        x: parseInt(document.getElementById('finishX').value),
        y: parseInt(document.getElementById('finishY').value),
        w: parseInt(document.getElementById('finishW').value),
        h: parseInt(document.getElementById('finishH').value),
        type: 'finish',
        entry: { x: 0, y: 1 },
        exit: { x: 0, y: 2 }
      }
    ];

    this.initialize();
    this.isGenerating = true;
    this.markBlockedAreas();
    this.createMainPath();
    this.draw();
    this.generationTimeout = setTimeout(() => this.startBranching(), 1000);
  }

  downloadMaze() {
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');

    const scale = 4;
    downloadCanvas.width = this.canvas.width * scale;
    downloadCanvas.height = this.canvas.height * scale;

    downloadCtx.fillStyle = CONFIG.colors.background;
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    downloadCtx.scale(scale, scale);
    this.grid.forEach(cell => cell.draw(downloadCtx, this.cellSize));

    const link = document.createElement('a');
    link.download = 'labirints.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  }
} 