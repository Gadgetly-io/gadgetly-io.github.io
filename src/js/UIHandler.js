export class UIHandler {
  constructor(mazeGenerator) {
    this.mazeGenerator = mazeGenerator;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Tab funkcionalitāte
    document.querySelectorAll('.neumorphic-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.handleTabClick(tab);
      });
    });

    // Pogu animācijas
    document.querySelectorAll('.neumorphic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleButtonClick(btn);
      });
    });

    // Range input vērtību atjaunināšana
    document.getElementById('edgeChangeProb').addEventListener('input', (e) => {
      this.updateRangeValue('edgeChangeProbValue', e.target.value, '%');
    });

    document.getElementById('changeProb').addEventListener('input', (e) => {
      this.updateRangeValue('changeProbValue', e.target.value, '%');
    });

    document.getElementById('generationSpeed').addEventListener('input', (e) => {
      this.updateRangeValue('generationSpeedValue', e.target.value, 'ms');
      this.mazeGenerator.generationSpeed = parseInt(e.target.value);
    });

    // Ģenerēšanas un lejupielādes pogas
    document.getElementById('generateBtn').addEventListener('click', () => {
      this.mazeGenerator.generateNewMaze();
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
      this.mazeGenerator.downloadMaze();
    });
  }

  handleTabClick(tab) {
    tab.classList.add('animate-tab');
    
    document.querySelectorAll('.neumorphic-tab').forEach(t => {
      t.classList.remove('active');
      t.classList.remove('bg-primary', 'text-white');
      t.classList.add('text-gray-700');
    });

    tab.classList.add('active');
    tab.classList.remove('text-gray-700');
    tab.classList.add('bg-primary', 'text-white');

    document.querySelectorAll('[id$="-tab"]').forEach(section => {
      section.classList.add('hidden');
    });

    const tabId = tab.getAttribute('data-tab');
    const targetSection = document.getElementById(`${tabId}-tab`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      targetSection.style.opacity = '0';
      targetSection.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        targetSection.style.transition = 'all 0.3s ease';
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
      }, 50);
    }

    setTimeout(() => {
      tab.classList.remove('animate-tab');
    }, 300);
  }

  handleButtonClick(btn) {
    btn.classList.add('animate-btn');
    setTimeout(() => {
      btn.classList.remove('animate-btn');
    }, 300);
  }

  updateRangeValue(elementId, value, suffix) {
    const valueDisplay = document.getElementById(elementId);
    valueDisplay.textContent = `${value}${suffix}`;
    valueDisplay.classList.add('animate-value');
    setTimeout(() => valueDisplay.classList.remove('animate-value'), 300);
  }
} 