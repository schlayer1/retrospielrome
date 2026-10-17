export class TouchControls {
  public dx = 0;
  public dy = 0;
  public actionPressed = false;
  private container: HTMLDivElement | null = null;
  private knob: HTMLDivElement | null = null;
  private baseRect: DOMRect | null = null;
  private activeTouchId: number | null = null;
  private onMenuToggle?: (key: string) => void;

  constructor(onMenuToggle?: (key: string) => void) {
    this.onMenuToggle = onMenuToggle;
    this.initDOM();
  }

  public isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 900
    );
  }

  private initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls-overlay';
    this.container.className = 'touch-controls-overlay';
    if (!this.isTouchDevice()) {
      this.container.style.display = 'none';
    }

    // Left Joystick
    const joyBase = document.createElement('div');
    joyBase.className = 'touch-joystick-base';
    this.knob = document.createElement('div');
    this.knob.className = 'touch-joystick-knob';
    joyBase.appendChild(this.knob);

    joyBase.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.activeTouchId = touch.identifier;
        this.baseRect = joyBase.getBoundingClientRect();
        this.updateJoystick(touch.clientX, touch.clientY);
      },
      { passive: false }
    );

    joyBase.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === this.activeTouchId) {
            this.updateJoystick(t.clientX, t.clientY);
            break;
          }
        }
      },
      { passive: false }
    );

    const endTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.activeTouchId) {
          this.activeTouchId = null;
          this.dx = 0;
          this.dy = 0;
          if (this.knob) {
            this.knob.style.transform = 'translate(-50%, -50%)';
          }
          break;
        }
      }
    };

    joyBase.addEventListener('touchend', endTouch);
    joyBase.addEventListener('touchcancel', endTouch);

    // Right Action Buttons
    const btnGroup = document.createElement('div');
    btnGroup.className = 'touch-action-group';

    const createBtn = (label: string, sub: string, cls: string, onTap: () => void) => {
      const btn = document.createElement('button');
      btn.className = `touch-btn ${cls}`;
      btn.innerHTML = `<span class="touch-btn-main">${label}</span><span class="touch-btn-sub">${sub}</span>`;
      btn.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          onTap();
        },
        { passive: false }
      );
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        onTap();
      });
      return btn;
    };

    const btnAction = createBtn('E', 'Aktion', 'touch-btn-primary', () => {
      this.actionPressed = true;
      if (this.onMenuToggle) this.onMenuToggle('E');
    });

    const btnCraft = createBtn('C', 'Handwerk', 'touch-btn-secondary', () => {
      if (this.onMenuToggle) this.onMenuToggle('C');
    });

    const btnBuild = createBtn('B', 'Bauen', 'touch-btn-secondary', () => {
      if (this.onMenuToggle) this.onMenuToggle('B');
    });

    const btnInv = createBtn('I', 'Beutel', 'touch-btn-secondary', () => {
      if (this.onMenuToggle) this.onMenuToggle('I');
    });

    btnGroup.appendChild(btnInv);
    btnGroup.appendChild(btnBuild);
    btnGroup.appendChild(btnCraft);
    btnGroup.appendChild(btnAction);

    this.container.appendChild(joyBase);
    this.container.appendChild(btnGroup);
    document.body.appendChild(this.container);

    window.addEventListener('resize', () => {
      if (this.container) {
        this.container.style.display = this.isTouchDevice() ? 'flex' : 'none';
      }
    });
  }

  private updateJoystick(clientX: number, clientY: number) {
    if (!this.baseRect || !this.knob) return;
    const centerX = this.baseRect.left + this.baseRect.width / 2;
    const centerY = this.baseRect.top + this.baseRect.height / 2;
    const maxRadius = this.baseRect.width / 2 - 12;

    let offsetX = clientX - centerX;
    let offsetY = clientY - centerY;
    const dist = Math.hypot(offsetX, offsetY);

    if (dist > maxRadius && dist > 0) {
      offsetX = (offsetX / dist) * maxRadius;
      offsetY = (offsetY / dist) * maxRadius;
    }

    this.knob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

    const normX = offsetX / maxRadius;
    const normY = offsetY / maxRadius;
    this.dx = Math.abs(normX) > 0.22 ? normX : 0;
    this.dy = Math.abs(normY) > 0.22 ? normY : 0;
  }

  public consumeAction(): boolean {
    if (this.actionPressed) {
      this.actionPressed = false;
      return true;
    }
    return false;
  }

  public setVisible(visible: boolean) {
    if (!this.container) return;
    this.container.style.display = visible && this.isTouchDevice() ? 'flex' : 'none';
  }
}
