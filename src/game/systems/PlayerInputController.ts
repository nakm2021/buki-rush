import type Phaser from 'phaser';

export class PlayerInputController {
  private readonly scene: Phaser.Scene;
  private dragPointerId: number | null = null;
  private lastTapAt = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setup(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.downTime - this.lastTapAt < 280) {
        this.scene.events.emit('player-special-trigger');
      }
      this.lastTapAt = pointer.downTime;
      this.dragPointerId = pointer.pointerId;
      this.scene.events.emit('player-pointer-target', pointer.x, pointer.y);
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.dragPointerId !== pointer.pointerId) {
        return;
      }

      this.scene.events.emit('player-pointer-target', pointer.x, pointer.y);
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.dragPointerId === pointer.pointerId) {
        this.dragPointerId = null;
        this.scene.events.emit('player-pointer-release');
      }
    });

    this.scene.input.on('pointercancel', () => {
      this.dragPointerId = null;
      this.scene.events.emit('player-pointer-release');
    });
  }
}
