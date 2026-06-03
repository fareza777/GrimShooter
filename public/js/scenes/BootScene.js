export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Generate placeholder textures programmatically so the game runs without external assets
        
        // Player texture
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00ff00, 1);
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player', 32, 48);
        playerGraphics.destroy();

        // Bullet texture
        const bulletGraphics = this.add.graphics();
        bulletGraphics.fillStyle(0xffff00, 1);
        bulletGraphics.fillRect(0, 0, 8, 8);
        bulletGraphics.generateTexture('bullet', 8, 8);
        bulletGraphics.destroy();

        // Enemy texture
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0xff0000, 1);
        enemyGraphics.fillRect(0, 0, 32, 48);
        enemyGraphics.generateTexture('enemy', 32, 48);
        enemyGraphics.destroy();

        // Ground texture
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x555555, 1);
        groundGraphics.fillRect(0, 0, 32, 32);
        groundGraphics.generateTexture('ground', 32, 32);
        groundGraphics.destroy();
    }

    create() {
        this.scene.start('PlayScene');
        this.scene.launch('UIScene');
    }
}