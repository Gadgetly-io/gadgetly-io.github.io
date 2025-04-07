export class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.blocked = false;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.color = '#e0e5ec';
  }

  draw(ctx, cellSize) {
    const x = this.x * cellSize;
    const y = this.y * cellSize;

    // Aizpildām šūnu ar fona krāsu
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, cellSize, cellSize);

    // Zīmējam sienas
    ctx.strokeStyle = "#2d3436";
    ctx.lineWidth = 2;

    if (this.walls[0]) this.drawLine(ctx, x, y, x + cellSize, y);
    if (this.walls[1]) this.drawLine(ctx, x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls[2]) this.drawLine(ctx, x + cellSize, y + cellSize, x, y + cellSize);
    if (this.walls[3]) this.drawLine(ctx, x, y + cellSize, x, y);
  }

  drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  removeWallBetween(otherCell) {
    const dx = otherCell.x - this.x;
    const dy = otherCell.y - this.y;

    if (dx === 1) {
      this.walls[1] = false;
      otherCell.walls[3] = false;
    } else if (dx === -1) {
      this.walls[3] = false;
      otherCell.walls[1] = false;
    } else if (dy === 1) {
      this.walls[2] = false;
      otherCell.walls[0] = false;
    } else if (dy === -1) {
      this.walls[0] = false;
      otherCell.walls[2] = false;
    }
  }
} 