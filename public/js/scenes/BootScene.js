export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 1. Sky Gradient Background
        const skyGraphics = this.add.graphics();
        skyGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        skyGraphics.fillRect(0, 0, 800, 600);
        skyGraphics.generateTexture('sky', 800, 600);
        skyGraphics.destroy();

        // 2. Parallax Mountains
        const mountainGraphics = this.add.graphics();
        mountainGraphics.fillStyle(0x1a1a2e, 1);
        mountainGraphics.beginPath();
        mountainGraphics.moveTo(0, 600);
        mountainGraphics.lineTo(100, 400);
        mountainGraphics.lineTo(250, 500);
        mountainGraphics.lineTo(400, 350);
        mountainGraphics.lineTo(600, 450);
        mountainGraphics.lineTo(800, 380);
        mountainGraphics.lineTo(800, 600);
        mountainGraphics.closePath();
        mountainGraphics.fillPath();
        mountainGraphics.generateTexture('mountain', 800, 600);
        mountainGraphics.destroy();

        // 3. Detailed Ground Tile
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x2d3436, 1); // Dark grey base
        groundGraphics.fillRect(0, 0, 64, 64);
        groundGraphics.fillStyle(0x00b894, 1); // Grass top
        groundGraphics.fillRect(0, 0, 64, 12);
        groundGraphics.fillStyle(0x55efc4, 0.3); // Grass highlight
        groundGraphics.fillRect(0, 0, 64, 4);
        groundGraphics.generateTexture('ground', 64, 64);
        groundGraphics.destroy();

        // 4. Animated Player Textures (3 frames: idle, run1, run2)
        this.createPlayerTexture('player_idle', 0);
        this.createPlayerTexture('player_run1', 1);
        this.createPlayerTexture('player_run2', 2);

        // 5. Detailed Enemy Texture (Robot/Soldier)
        const enemyGraphics = this.add.graphics();
        // Body
        enemyGraphics.fillStyle(0xd63031, 1);
        enemyGraphics.fillRect(4, 16, 24, 24);
        // Head
        enemyGraphics.fillStyle(0x636e72, 1);
        enemyGraphics.fillRect(8, 4, 16, 16);
        // Glowing eye
        enemyGraphics.fillStyle(0xfdcb6e, 1);
        enemyGraphics.fillRect(18, 8, 6, 4);
        // Cannon
        enemyGraphics.fillStyle(0x2d3436, 1);
        enemyGraphics.fillRect(0, 20, 12, 8);
        enemyGraphics.generateTexture('enemy', 32, 48);
        enemyGraphics.destroy();

        // 6. Glowing Bullet
        const bulletGraphics = this.add.graphics();
        bulletGraphics.fillStyle(0xf1c40f, 1);
        bulletGraphics.fillCircle(4, 4, 4);
        bulletGraphics.fillStyle(0xffffff, 0.8);
        bulletGraphics.fillCircle(4, 4, 2);
        bulletGraphics.generateTexture('bullet', 8, 8);
        bulletGraphics.destroy();

        // 7. Enemy Bullet
        const eBulletGraphics = this.add.graphics();
        eBulletGraphics.fillStyle(0xff7675, 1);
        eBulletGraphics.fillCircle(4, 4, 4);
        eBulletGraphics.generateTexture('enemy_bullet', 8, 8);
        eBulletGraphics.destroy();

        // 8. Particle textures
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xf1c40f, 1);
        sparkGraphics.fillCircle(2, 2, 2);
        sparkGraphics.generateTexture('spark', 4, 4);
        sparkGraphics.destroy();

        const smokeGraphics = this.add.graphics();
        smokeGraphics.fillStyle(0x636e72, 0.6);
        smokeGraphics.fillCircle(4, 4, 4);
        smokeGraphics.generateTexture('smoke', 8, 8);
        smokeGraphics.destroy();
    }

    createPlayerTexture(key, frame) {
        const g = this.add.graphics();
        const legOffset = frame === 1 ? 4 : (frame === 2 ? -4 : 0);
        
        // Legs
        g.fillStyle(0x2d3436, 1);
        g.fillRect(10 + legOffset, 32, 6, 16);
        g.fillRect(18 - legOffset, 32, 6, 16);
        
        // Body (Camo)
        g.fillStyle(0x00b894, 1);
        g.fillRect(8, 16, 16, 20);
        
        // Head
        g.fillStyle(0xffeaa7, 1);
        g.fillRect(10, 6, 12, 12);
        
        // Helmet
        g.fillStyle(0x0984e3, 1);
        g.fillRect(8, 2, 16, 8);
        g.fillRect(6, 6, 20, 4); // Helmet brim
        
        // Gun
        g.fillStyle(0x2d3436, 1);
        g.fillRect(20, 20, 14, 6); // Barrel
        g.fillRect(18, 20, 4, 10); // Handle
        
        g.generateTexture(key, 40, 48);
        g.destroy();
    }

    create() {
        this.anims.create({
            key: 'player_run',
            frames: [
                { key: 'player_idle' },
                { key: 'player_run1' },
                { key: 'player_run2' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.scene.start('PlayScene');
        this.scene.launch('UIScene');
    }
}