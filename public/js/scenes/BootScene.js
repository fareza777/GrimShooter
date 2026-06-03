export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 1. Sky & Environment
        const skyGraphics = this.add.graphics();
        skyGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        skyGraphics.fillRect(0, 0, 800, 600);
        skyGraphics.generateTexture('sky', 800, 600);
        skyGraphics.destroy();

        // Stars for background
        const starGraphics = this.add.graphics();
        for (let i = 0; i < 50; i++) {
            starGraphics.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
            starGraphics.fillCircle(Math.random() * 800, Math.random() * 400, Math.random() * 2 + 0.5);
        }
        starGraphics.generateTexture('stars', 800, 600);
        starGraphics.destroy();

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

        // 2. Ground Tile
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x2d3436, 1);
        groundGraphics.fillRect(0, 0, 64, 64);
        groundGraphics.fillStyle(0x00b894, 1);
        groundGraphics.fillRect(0, 0, 64, 12);
        groundGraphics.fillStyle(0x55efc4, 0.3);
        groundGraphics.fillRect(0, 0, 64, 4);
        groundGraphics.generateTexture('ground', 64, 64);
        groundGraphics.destroy();

        // 3. Player Textures
        this.createPlayerTexture('player_idle', 0);
        this.createPlayerTexture('player_run1', 1);
        this.createPlayerTexture('player_run2', 2);

        // 4. Enemy Textures
        // Ground Enemy (Robot)
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0xd63031, 1);
        enemyGraphics.fillRect(4, 16, 24, 24);
        enemyGraphics.fillStyle(0x636e72, 1);
        enemyGraphics.fillRect(8, 4, 16, 16);
        enemyGraphics.fillStyle(0xfdcb6e, 1);
        enemyGraphics.fillRect(18, 8, 6, 4);
        enemyGraphics.fillStyle(0x2d3436, 1);
        enemyGraphics.fillRect(0, 20, 12, 8);
        enemyGraphics.generateTexture('enemy', 32, 48);
        enemyGraphics.destroy();

        // Flying Enemy (Drone)
        const droneGraphics = this.add.graphics();
        droneGraphics.fillStyle(0x6c5ce7, 1);
        droneGraphics.fillCircle(16, 16, 12);
        droneGraphics.fillStyle(0xfdcb6e, 1);
        droneGraphics.fillCircle(16, 16, 4);
        droneGraphics.fillStyle(0x2d3436, 1);
        droneGraphics.fillRect(4, 10, 24, 4); // Propeller
        droneGraphics.generateTexture('enemy_drone', 32, 32);
        droneGraphics.destroy();

        // 5. Bullets
        const bulletGraphics = this.add.graphics();
        bulletGraphics.fillStyle(0xf1c40f, 1);
        bulletGraphics.fillCircle(4, 4, 4);
        bulletGraphics.fillStyle(0xffffff, 0.8);
        bulletGraphics.fillCircle(4, 4, 2);
        bulletGraphics.generateTexture('bullet', 8, 8);
        bulletGraphics.destroy();

        const eBulletGraphics = this.add.graphics();
        eBulletGraphics.fillStyle(0xff7675, 1);
        eBulletGraphics.fillCircle(4, 4, 4);
        eBulletGraphics.generateTexture('enemy_bullet', 8, 8);
        eBulletGraphics.destroy();

        // 6. Power-ups
        // Weapon Upgrade (Blue Orb)
        const wpnGraphics = this.add.graphics();
        wpnGraphics.fillStyle(0x0984e3, 0.8);
        wpnGraphics.fillCircle(12, 12, 12);
        wpnGraphics.lineStyle(2, 0x74b9ff, 1);
        wpnGraphics.strokeCircle(12, 12, 12);
        wpnGraphics.generateTexture('powerup_weapon', 24, 24);
        wpnGraphics.destroy();

        // Armor (Green Shield)
        const armorGraphics = this.add.graphics();
        armorGraphics.fillStyle(0x00b894, 0.8);
        armorGraphics.fillCircle(12, 12, 12);
        armorGraphics.lineStyle(2, 0x55efc4, 1);
        armorGraphics.strokeCircle(12, 12, 12);
        armorGraphics.generateTexture('powerup_armor', 24, 24);
        armorGraphics.destroy();

        // 7. Particles
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
        
        g.fillStyle(0x2d3436, 1);
        g.fillRect(10 + legOffset, 32, 6, 16);
        g.fillRect(18 - legOffset, 32, 6, 16);
        
        g.fillStyle(0x00b894, 1);
        g.fillRect(8, 16, 16, 20);
        
        g.fillStyle(0xffeaa7, 1);
        g.fillRect(10, 6, 12, 12);
        
        g.fillStyle(0x0984e3, 1);
        g.fillRect(8, 2, 16, 8);
        g.fillRect(6, 6, 20, 4);
        
        g.fillStyle(0x2d3436, 1);
        g.fillRect(20, 20, 14, 6);
        g.fillRect(18, 20, 4, 10);
        
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
    }
}