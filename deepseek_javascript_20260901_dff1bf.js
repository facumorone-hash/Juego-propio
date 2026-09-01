export class Controls {
  constructor(canvas) {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.isLocked = false;
    this.mouseDown = false;

    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('click', () => {
      if (!this.isLocked) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === canvas;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isLocked) {
        this.mouseX += e.movementX;
        this.mouseY += e.movementY;
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown = true;
    });

    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });
  }

  resetMouse() {
    this.mouseX = 0;
    this.mouseY = 0;
  }
}