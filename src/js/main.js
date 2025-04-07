import { MazeGenerator } from './MazeGenerator.js';
import { UIHandler } from './UIHandler.js';
import { CONFIG } from './config.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/styles.css';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializējam labirinta ģeneratoru
  const canvas = document.getElementById('maze');
  const mazeGenerator = new MazeGenerator(canvas);
  mazeGenerator.initialize();

  // Inicializējam UI handleri
  const uiHandler = new UIHandler(mazeGenerator);

  // Iestatām noklusētās vērtības
  document.getElementById('cols').value = CONFIG.defaultCols;
  document.getElementById('rows').value = CONFIG.defaultRows;
  document.getElementById('generationSpeed').value = CONFIG.defaultSpeed;
  document.getElementById('generationSpeedValue').textContent = `${CONFIG.defaultSpeed}ms`;

  // Sākuma zona
  document.getElementById('startX').value = CONFIG.defaultStartArea.x;
  document.getElementById('startY').value = CONFIG.defaultStartArea.y;
  document.getElementById('startW').value = CONFIG.defaultStartArea.w;
  document.getElementById('startH').value = CONFIG.defaultStartArea.h;

  // Kontroles punkta zona
  document.getElementById('checkpointX').value = CONFIG.defaultCheckpointArea.x;
  document.getElementById('checkpointY').value = CONFIG.defaultCheckpointArea.y;
  document.getElementById('checkpointW').value = CONFIG.defaultCheckpointArea.w;
  document.getElementById('checkpointH').value = CONFIG.defaultCheckpointArea.h;

  // Beigu zona
  document.getElementById('finishX').value = CONFIG.defaultFinishArea.x;
  document.getElementById('finishY').value = CONFIG.defaultFinishArea.y;
  document.getElementById('finishW').value = CONFIG.defaultFinishArea.w;
  document.getElementById('finishH').value = CONFIG.defaultFinishArea.h;

  // Randomizācijas parametri
  document.getElementById('minBranches').value = CONFIG.randomization.minBranches;
  document.getElementById('maxBranches').value = CONFIG.randomization.maxBranches;
  document.getElementById('minDistance').value = CONFIG.randomization.minDistance;
  document.getElementById('edgeChangeProb').value = CONFIG.randomization.edgeChangeProb;
  document.getElementById('changeProb').value = CONFIG.randomization.changeProb;
  document.getElementById('edgeChangeProbValue').textContent = `${CONFIG.randomization.edgeChangeProb}%`;
  document.getElementById('changeProbValue').textContent = `${CONFIG.randomization.changeProb}%`;

  // Sākam pirmo labirinta ģenerēšanu
  mazeGenerator.generateNewMaze();
}); 