export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
        this.currentLevel = 1;
        this.maxLevels = 100;
    }

    create() {
        this.score = 0;
        this.isGameOver = false;

        // Create ground
        this.platforms = this.physics.add.staticGroup();
        const groundY = this.scale.height - 150; // Leave space for UI at the bottom
        for (let x = 0; x < this.scale.width; x += 32) {
            this.platforms.create(x, groundY, 'ground').refreshBody();
            this.platforms.create(x, groundY - 32, 'ground').refreshBody();
        }

        // Create player
        this.player = this.physics.add.sprite(100, groundY - 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        
        // Player physics properties
        this.playerSpeed = 200;
        this.jumpVelocity = -400;

        // Collide player with platforms
        this.physics.add.collider(this.player, this.platforms);

        // Groups for bullets and enemies
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 30,
            runChildUpdate: true
        });

        this.enemies = this.physics.add.group();

        // Input handling (will be triggered by UIScene)
        this.inputState = {
            left: false,
            right: false,
            jump: false,
            shoot: false
        };

        this.events.on('moveLeft', () => this.inputState.left = true);
        this.events.on('stopLeft', () => this.inputState.left = false);
        this.events.on('moveRight', () => this.inputState.right = true);
        this.events.on('stopRight', () => this.inputState.right = false);
        this.events.on('jump', () => {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.jumpVelocity);
            }
        });
        this.events.on('shoot', () => this.shoot());

        // Enemy spawner
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        // Level text
        this.levelText = this.add.text(16, 16, `Level: ${this.currentLevel}`, { fontSize: '24px', fill: '#fff' });
    }

    update() {
        if (this.isGameOver) return;

        // Player movement
        if (this.inputState.left) {
            this.player.setVelocityX(-this.playerSpeed);
            this.player.flipX = true;
        } else if (this.inputState.right) {
            this.player.setVelocityX(this.playerSpeed);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
        }

        // Keep player in bounds
        if (this.player.x < 16) this.player.x = 16;
        if (this.player.x > this.scale.width - 16) this.player.x = this.scale.width - 16;
    }

    shoot() {
        if (this.isGameOver) return;
        const bullet = this.bullets.get(this.player.x, this.player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTexture('bullet');
            bullet.body.allowGravity = false;
            const direction = this.player.flipX ? -1 : 1;
            bullet.setVelocityX(400 * direction);
            
            // Destroy bullet after 2 seconds or when out of bounds
            this.time.delayedCall(2000, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }

    spawnEnemy() {
        if (this.isGameOver) return;
        const x = this.scale.width + 32;
        const groundY = this.scale.height - 150;
        const enemy = this.enemies.create(x, groundY - 100, 'enemy');
        enemy.setVelocityX(-100);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.1);
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);
        enemy.destroy();
        this.score += 10;
        
        // Simple level progression logic
        if (this.score >= this.currentLevel * 100) {
            this.nextLevel();
        }
    }

    hitPlayer(player, enemy) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.isGameOver = true;
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { 
            fontSize: '48px', 
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.levelText.setText(`Level: ${this.currentLevel}`);
            this.enemies.clear(true, true);
            // In a full implementation, this would load a new level layout
        }
    }
}