export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
        this.currentLevel = 1;
        this.maxLevels = 100;
    }

    create() {
        this.score = 0;
        this.isGameOver = false;
        const width = this.scale.width; // 600
        const height = this.scale.height; // 800
        const groundY = 700; // Leave bottom 100px for HTML controls

        // 1. Parallax Backgrounds
        this.bgSky = this.add.tileSprite(width / 2, height / 2, width, height, 'sky');
        this.bgMountains = this.add.tileSprite(width / 2, height - 150, width + 200, 400, 'mountain');
        this.bgMountains.setScrollFactor(0.5);

        // 2. Ground Platforms
        this.platforms = this.physics.add.staticGroup();
        for (let x = 0; x < width + 64; x += 64) {
            this.platforms.create(x, groundY, 'ground').refreshBody();
            this.platforms.create(x, groundY + 64, 'ground').refreshBody();
        }
        // Floating platforms
        this.platforms.create(width * 0.3, groundY - 150, 'ground').setScale(2, 1).refreshBody();
        this.platforms.create(width * 0.7, groundY - 220, 'ground').setScale(2, 1).refreshBody();

        // 3. Player Setup
        this.player = this.physics.add.sprite(100, groundY - 100, 'player_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        this.playerSpeed = 250;
        this.jumpVelocity = -450;
        this.player.canShoot = true;
        this.shootDelay = 200;

        this.physics.add.collider(this.player, this.platforms);

        // 4. Particle Emitters
        this.muzzleFlash = this.add.particles(0, 0, 'spark', {
            speed: 100, scale: { start: 1, end: 0 }, blendMode: 'ADD', lifespan: 100, on: false
        });
        this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
            speed: { min: 50, max: 150 }, angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 1.5 }, blendMode: 'NORMAL', lifespan: 600, gravityY: -50, on: false
        });

        // 5. Groups
        this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 30, runChildUpdate: true });
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 30, runChildUpdate: true });

        // 6. Collisions & Overlaps
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
        this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, null, this);

        // 7. Enemy Spawner
        this.spawnEvent = this.time.addEvent({
            delay: 2000, callback: this.spawnEnemy, callbackScope: this, loop: true
        });

        // 8. UI Text
        this.levelText = this.add.text(20, 20, `LEVEL ${this.currentLevel}`, { 
            fontSize: '28px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 
        });
        this.scoreText = this.add.text(20, 55, `SCORE: ${this.score}`, { 
            fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' 
        });
    }

    update() {
        if (this.isGameOver) return;

        // Read from global HTML input state for zero-latency mobile response
        const input = window.__input || {};

        // Player Movement & Animation
        if (input.left) {
            this.player.setVelocityX(-this.playerSpeed);
            this.player.flipX = true;
            this.player.anims.play('player_run', true);
        } else if (input.right) {
            this.player.setVelocityX(this.playerSpeed);
            this.player.flipX = false;
            this.player.anims.play('player_run', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('player_idle', true);
        }

        // Jump (one-shot)
        if (input.jumpPressed) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.jumpVelocity);
            }
            input.jumpPressed = false; // reset one-shot
        }

        // Continuous shooting
        if (input.shoot && this.player.canShoot) {
            this.shoot();
            this.player.canShoot = false;
            this.time.delayedCall(this.shootDelay, () => { this.player.canShoot = true; });
        }
        if (input.shootPressed) {
            input.shootPressed = false;
        }

        // Cleanup out-of-bounds entities
        this.bullets.children.entries.forEach(b => {
            if (b.active && (b.x < 0 || b.x > this.scale.width)) b.setActive(false).setVisible(false);
        });
        this.enemyBullets.children.entries.forEach(b => {
            if (b.active && (b.x < 0 || b.x > this.scale.width || b.y > this.scale.height)) b.setActive(false).setVisible(false);
        });
        this.enemies.children.entries.forEach(e => {
            if (e.y > this.scale.height + 50) e.destroy();
        });
    }

    shoot() {
        if (this.isGameOver) return;
        const bullet = this.bullets.get(this.player.x + (this.player.flipX ? -20 : 20), this.player.y - 5);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setTexture('bullet');
            bullet.body.allowGravity = false;
            const dir = this.player.flipX ? -1 : 1;
            bullet.setVelocityX(600 * dir);
            this.muzzleFlash.emitParticleAt(this.player.x + (dir * 25), this.player.y - 5, 5);
        }
    }

    spawnEnemy() {
        if (this.isGameOver) return;
        const groundY = 700;
        const x = this.scale.width + 50;
        const y = groundY - 100;
        
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocityX(-80 - (this.currentLevel * 5));
        enemy.setCollideWorldBounds(true);
        enemy.health = 2;

        this.time.addEvent({
            delay: 1500,
            callback: () => {
                if (!enemy.active || this.isGameOver) return;
                const eBullet = this.enemyBullets.get(enemy.x, enemy.y);
                if (eBullet) {
                    eBullet.setActive(true).setVisible(true).setTexture('enemy_bullet');
                    eBullet.body.allowGravity = false;
                    const angle = this.physics.moveToObject(eBullet, this.player, 250);
                    eBullet.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
                }
            },
            loop: true
        });
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false).setVisible(false);
        enemy.health--;
        enemy.setTint(0xffffff);
        this.time.delayedCall(100, () => { if(enemy.active) enemy.clearTint(); });

        if (enemy.health <= 0) {
            this.explosionEmitter.emitParticleAt(enemy.x, enemy.y, 15);
            enemy.destroy();
            this.score += 50;
            this.scoreText.setText(`SCORE: ${this.score}`);
            
            if (this.score >= this.currentLevel * 200) {
                this.nextLevel();
            }
        }
    }

    hitPlayer(player, source) {
        if (this.isGameOver) return;
        this.physics.pause();
        this.explosionEmitter.emitParticleAt(player.x, player.y, 30);
        player.setTint(0xff0000);
        this.isGameOver = true;
        
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { 
            fontSize: '56px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 
        }).setOrigin(0.5);

        this.time.delayedCall(2500, () => { this.scene.restart(); });
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.levelText.setText(`LEVEL ${this.currentLevel}`);
            this.enemies.clear(true, true);
            this.enemyBullets.clear(true, true);
            this.cameras.main.flash(500, 255, 255, 255);
        }
    }
}