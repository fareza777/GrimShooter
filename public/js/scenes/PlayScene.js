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
        
        // 1. Dynamic Level Width (semakin tinggi level, semakin panjang)
        this.levelWidth = 1600 + (this.currentLevel * 200);
        this.physics.world.setBounds(0, 0, this.levelWidth, height);

        // 2. Parallax Background (Lebar mengikuti level)
        this.bgSky = this.add.tileSprite(this.levelWidth / 2, height / 2, this.levelWidth, height, 'sky');
        this.bgSky.setScrollFactor(0); // Tetap di tempat relatif terhadap kamera, atau bisa di-set 0.1 untuk parallax
        this.bgMountains = this.add.tileSprite(this.levelWidth / 2, height - 150, this.levelWidth, 400, 'mountain');
        this.bgMountains.setScrollFactor(0.2);

        // 3. Ground & Pits (Jurang)
        this.platforms = this.physics.add.staticGroup();
        const segmentWidth = 64;
        const totalSegments = Math.ceil(this.levelWidth / segmentWidth);
        let skipNext = 0;

        for (let i = 0; i < totalSegments; i++) {
            const x = i * segmentWidth;
            const isStartOrEnd = i < 5 || i > totalSegments - 10; // Aman di awal dan akhir
            
            if (!isStartOrEnd && skipNext <= 0 && Math.random() < 0.15) {
                // Buat jurang (skip 1-2 segmen)
                skipNext = Math.floor(Math.random() * 2) + 1;
                continue; 
            }
            
            if (skipNext > 0) {
                skipNext--;
                continue;
            }

            // Ground dasar
            this.platforms.create(x, 700, 'ground').refreshBody();
            this.platforms.create(x, 764, 'ground').refreshBody();
        }

        // 4. Floating Platforms (Di atas jurang atau sebagai tangga)
        this.createFloatingPlatforms();

        // 5. Player Setup
        this.player = this.physics.add.sprite(100, 600, 'player_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        this.playerSpeed = 250;
        this.jumpVelocity = -450;
        this.player.canShoot = true;
        this.shootDelay = 200;

        // 6. Camera Follow
        this.cameras.main.setBounds(0, 0, this.levelWidth, height);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        this.physics.add.collider(this.player, this.platforms);

        // 7. Particle Emitters
        this.muzzleFlash = this.add.particles(0, 0, 'spark', {
            speed: 100, scale: { start: 1, end: 0 }, blendMode: 'ADD', lifespan: 100, on: false
        });
        this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
            speed: { min: 50, max: 150 }, angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 1.5 }, blendMode: 'NORMAL', lifespan: 600, gravityY: -50, on: false
        });

        // 8. Groups
        this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 50, runChildUpdate: true });
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 30, runChildUpdate: true });

        // 9. Collisions
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
        this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, null, this);

        // 10. Goal / Exit Portal
        this.createGoal();

        // 11. Enemy Spawner (Place enemies on platforms)
        this.spawnEnemiesForLevel();

        // 12. UI Text (Fixed to camera)
        this.levelText = this.add.text(20, 20, `LEVEL ${this.currentLevel}`, { 
            fontSize: '28px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 
        }).setScrollFactor(0);
        this.scoreText = this.add.text(20, 55, `SCORE: ${this.score}`, { 
            fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' 
        }).setScrollFactor(0);
    }

    createFloatingPlatforms() {
        const numPlatforms = 4 + Math.floor(this.currentLevel / 5);
        for (let i = 0; i < numPlatforms; i++) {
            const x = 300 + Math.random() * (this.levelWidth - 600);
            const y = 400 + Math.random() * 200; // Tinggi antara 400 - 600
            const platformWidth = 2 + Math.floor(Math.random() * 3); // 2-4 blok
            
            for (let j = 0; j < platformWidth; j++) {
                this.platforms.create(x + (j * 64), y, 'ground').refreshBody();
            }
        }
    }

    createGoal() {
        const goalX = this.levelWidth - 150;
        const goalY = 636; // Di atas ground
        
        // Visual portal
        this.goal = this.add.rectangle(goalX, goalY, 60, 120, 0x00ff00, 0.3);
        this.goal.setStrokeStyle(4, 0x00ff00);
        this.physics.add.existing(this.goal, true); // Static body
        
        // Particle effect untuk portal
        this.goalParticles = this.add.particles(goalX, goalY, 'spark', {
            speed: 50, scale: { start: 0.5, end: 0 }, blendMode: 'ADD', lifespan: 800, frequency: 100
        });

        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
        
        // Teks petunjuk
        this.add.text(goalX, goalY - 80, 'GOAL', {
            fontSize: '20px', fill: '#00ff00', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0); // Tetap di atas portal
    }

    spawnEnemiesForLevel() {
        const numEnemies = 3 + Math.floor(this.currentLevel / 3);
        const groundY = 700;
        
        for (let i = 0; i < numEnemies; i++) {
            const x = 400 + Math.random() * (this.levelWidth - 800);
            const y = groundY - 100;
            
            const enemy = this.enemies.create(x, y, 'enemy');
            enemy.setCollideWorldBounds(true);
            enemy.health = 2 + Math.floor(this.currentLevel / 10);
            enemy.speed = 60 + (this.currentLevel * 2);
            enemy.direction = -1; // Mulai berjalan ke kiri
            
            // Enemy shooting logic
            this.time.addEvent({
                delay: 1500 - (this.currentLevel * 5), // Semakin tinggi level, semakin cepat nembak
                callback: () => this.enemyShoot(enemy),
                loop: true
            });
        }
    }

    enemyShoot(enemy) {
        if (!enemy.active || this.isGameOver) return;
        // Hanya tembak jika player dalam jangkauan tertentu
        if (Math.abs(enemy.x - this.player.x) < 400) {
            const eBullet = this.enemyBullets.get(enemy.x, enemy.y - 10);
            if (eBullet) {
                eBullet.setActive(true).setVisible(true).setTexture('enemy_bullet');
                eBullet.body.allowGravity = false;
                const angle = this.physics.moveToObject(eBullet, this.player, 250);
                eBullet.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
            }
        }
    }

    update() {
        if (this.isGameOver) return;

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

        // Jump
        if (input.jumpPressed) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.jumpVelocity);
            }
            input.jumpPressed = false;
        }

        // Shoot
        if (input.shoot && this.player.canShoot) {
            this.shoot();
            this.player.canShoot = false;
            this.time.delayedCall(this.shootDelay, () => { this.player.canShoot = true; });
        }
        if (input.shootPressed) input.shootPressed = false;

        // Enemy Patrol Logic
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            // Ubah arah jika menabrak dinding atau tepi platform
            if (enemy.body.blocked.left || enemy.body.blocked.right) {
                enemy.direction *= -1;
            }
            
            // Cek tepi platform (agar tidak jatuh)
            const lookAheadX = enemy.x + (enemy.direction * 20);
            const tilesBelow = this.platforms.getChildren().filter(p => 
                Math.abs(p.x - lookAheadX) < 32 && p.y > enemy.y && p.y < enemy.y + 60
            );
            
            if (tilesBelow.length === 0 && enemy.body.touching.down) {
                enemy.direction *= -1; // Berbalik arah jika di tepi jurang
            }

            enemy.setVelocityX(enemy.speed * enemy.direction);
            enemy.flipX = enemy.direction === 1;
        });

        // Cleanup bullets
        this.bullets.children.entries.forEach(b => {
            if (b.active && (b.x < this.cameras.main.scrollX - 50 || b.x > this.cameras.main.scrollX + 650)) {
                b.setActive(false).setVisible(false);
            }
        });
        this.enemyBullets.children.entries.forEach(b => {
            if (b.active && (b.y > this.scale.height || b.x < 0 || b.x > this.levelWidth)) {
                b.setActive(false).setVisible(false);
            }
        });

        // Fall into pit = Game Over
        if (this.player.y > this.scale.height + 50) {
            this.hitPlayer(this.player, null);
        }
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
        }
    }

    hitPlayer(player, source) {
        if (this.isGameOver) return;
        this.physics.pause();
        this.explosionEmitter.emitParticleAt(player.x, player.y, 30);
        player.setTint(0xff0000);
        this.isGameOver = true;
        
        const text = this.add.text(this.cameras.main.scrollX + 300, 400, 'GAME OVER', { 
            fontSize: '56px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(2500, () => { this.scene.restart(); });
    }

    reachGoal(player, goal) {
        if (this.isGameOver) return;
        this.nextLevel();
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevels) {
            this.currentLevel++;
            this.cameras.main.flash(500, 255, 255, 255);
            this.time.delayedCall(600, () => {
                this.scene.restart();
            });
        } else {
            // Game Completed
            this.physics.pause();
            this.add.text(this.cameras.main.scrollX + 300, 400, 'YOU WIN!', { 
                fontSize: '64px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 
            }).setOrigin(0.5).setScrollFactor(0);
        }
    }
}