import Phaser from 'phaser';

export interface TorchLight {
  glow: Phaser.GameObjects.Arc;
  core: Phaser.GameObjects.Arc;
  baseRadius: number;
  phase: number;
}

export class WorldDecorManager {
  private scene: Phaser.Scene;
  private torches: TorchLight[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public addTorchGlow(x: number, y: number, radius = 26, color = 0xf59e0b) {
    const glow = this.scene.add
      .circle(x, y, radius, color, 0.16)
      .setDepth(y + 50);
    const core = this.scene.add
      .circle(x, y, radius * 0.35, 0xfef08a, 0.28)
      .setDepth(y + 51);
    this.torches.push({
      glow,
      core,
      baseRadius: radius,
      phase: Math.random() * Math.PI * 2,
    });
  }

  public update(time: number) {
    for (const t of this.torches) {
      const pulse = Math.sin(time * 0.006 + t.phase) * 2.2;
      t.glow.setRadius(t.baseRadius + pulse);
      t.core.setRadius(t.baseRadius * 0.35 + pulse * 0.4);
    }
  }
}
