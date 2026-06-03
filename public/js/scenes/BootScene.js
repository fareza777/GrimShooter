export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        console.log('BootScene: Preloading assets...');
        
        // Gunakan this.make.graphics({ add: false }) agar lebih aman di fase preload
        const createTexture = (key, width, height, drawFn) => {
            const g = this.make.graphics({ add: false });
            drawFn(g);
            g.generateTexture(key, width, height);
            g.destroy();
        };

        // 1. Sky
        createTexture('sky', 800, 600, (g) => {
            g.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
            g.fillRect(0, 0, 800, 600);
        });

        // 2. Stars
        createTexture('stars', 800, 600, (g) => {
            for (let i = 0; i < 50; i++) {
                g.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
                g.fillCircle(Math.random() * 800, Math.random() * 400, Math.random() * 2 + 0.5);
            }
        });

        // 3. Mountains
        createTexture('mountain', 800, 600, (g) => {
            g.fillStyle(0x1a1a2e, 1);
            g.beginPath();
            g.moveTo(0, 600);
            g.lineTo(100, 400);
            g.lineTo(250, 500);
            g.lineTo(400, 350);
            g.lineTo(600, 450);
            g.lineTo(800, 380);
            g.lineTo(800, 600);
            g.closePath();
            g.fillPath();
        });

        // 4. Ground
        createTexture('ground', 64, 64, (g) => {
            g.fillStyle(0x2d3436, 1);
            g.fillRect(0, 0, 64, 64);
            g.fillStyle(0x00b894, 1);
            g.fillRect(0, 0, 64, 12);
            g.fillStyle(0x55efc4, 0.3);
            g.fillRect(0, 0, 64, 4);
        });

        // 5. Player
        this.createPlayerTexture('player_idle', 0);
        this.createPlayerTexture('player_run1', 1);
        this.createPlayerTexture('player_run2', 2);

        // 6. Enemies
        createTexture('enemy', 32, 48, (g) => {
            g.fillStyle(0xd63031, 1); g.fillRect(4, 16, 24, 24);
            g.fillStyle(0x636e72, 1); g.fillRect(8, 4, 16, 16);
            g.fillStyle(0xfdcb6e, 1); g.fillRect(18, 8, 6, 4);
            g.fillStyle(0x2d3436, 1); g.fillRect(0, 20, 12, 8);
        });

        createTexture('enemy_drone', 32, 32, (g) => {
            g.fillStyle(0x6c5ce7, 1); g.fillCircle(16, 16, 12);
            g.fillStyle(0xfdcb6e, 1); g.fillCircle(16, 16, 4);
            g.fillStyle(0x2d3436, 1); g.fillRect(4, 10, 24, 4);
        });

        // 7. Bullets
        createTexture('bullet', 8, 8, (g) => {
            g.fillStyle(0xf1c40f, 1); g.fillCircle(4, 4, 4);
            g.fillStyle(0xffffff, 0.8); g.fillCircle(4, 4, 2);
        });

        createTexture('enemy_bullet', 8, 8, (g) => {
            g.fillStyle(0xff7675, 1); g.fillCircle(4, 4, 4);
        });

        // 8. Power-ups
        createTexture('powerup_weapon', 24, 24, (g) => {
            g.fillStyle(0x0984e3, 0.8); g.fillCircle(12, 12, 12);
            g.lineStyle(2, 0x74b9ff, 1); g.strokeCircle(12, 12, 12);
        });

        createTexture('powerup_armor', 24, 24, (g) => {
            g.fillStyle(0x00b894, 0.8); g.fillCircle(12, 12, 12);
            g.lineStyle(2, 0x55efc4, 1); g.strokeCircle(12, 12, 12);
        });

        // 9. Particles
        createTexture('spark', 4, 4, (g) => {
            g.fillStyle(0xf1c40f, 1); g.fillCircle(2, 2, 2);
        });

        createTexture('smoke', 8, 8, (g) => {
            g.fillStyle(0x636e72, 0.6); g.fillCircle(4, 4, 4);
        });

        console.log('BootScene: Preload complete.');
    }

    createPlayerTexture(key, frame) {
        const g = this.make.graphics({ add: false });
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
        console.log('BootScene: Creating animations and starting PlayScene...');
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

        console.log('BootScene: Starting PlayScene.');
        this.scene.start('PlayScene');
    }
}