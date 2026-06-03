export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
        this.currentLevel = 1;
        this.maxLevels = 100;
    }

    create() {
        try {
            console.log('=== PLAY SCENE CREATE EXECUTED ===');
            this.score = 0;
            this.isGameOver = false;
            const width = this.scale.width; // 600
            const height = this.scale.height; // 800
            
            this.add.text(300, 300, 'PLAY SCENE\nLOADED', { 
                fontSize: '48px', fill: '#ffff00', fontStyle: 'bold', align: 'center', stroke: '#000', strokeThickness: 6 
            }).setOrigin(0.5);

            this.levelWidth = 1600 + (this.currentLevel * 200);
            this.physics.world.setBounds(0, 0, this.levelWidth, 1200);
            this.cameras.main.setBounds(0, 0, this.levelWidth, 1200);

            this.bgStars = this.add.tileSprite(this.levelWidth / 2, height / 2, this.levelWidth, height, 'stars');
            this.bgStars.setScrollFactor(0.1);
            this.bgMountains = this.add.tileSprite(this.levelWidth / 2, height - 150, this.levelWidth, 400, 'mountain');
            this.bgMountains.setScrollFactor(0.3);

            this.platforms = this.physics.add.staticGroup();
            const segmentWidth = 64;
            const totalSegments = Math.ceil(this.levelWidth / segmentWidth);
            let skipNext = 0;

            for (let i = 0; i < totalSegments; i++) {
                const x = i * segmentWidth;
                const isStartOrEnd = i < 6 || i > totalSegments - 8;
                
                if (!isStartOrEnd && skipNext <= 0 && Math.random() < 0.2) {
                    skipNext = Math.floor(Math.random() * 2) + 1;
                    const platformY = 550 + Math.random() * 100;
                    this.platforms.create(x + 32, platformY, 'ground').refreshBody();
                    continue; 
                }
                
                if (skipNext > 0) {
                    skipNext--;
                    continue;
                }

                this.platforms.create(x, 700, 'ground').refreshBody();
                this.platforms.create(x, 764, 'ground').refreshBody();
            }

            const numPlatforms = 3 + Math.floor(this.currentLevel / 5);
            for (let i = 0; i < numPlatforms; i++) {
                const x = 400 + Math.random() * (this.levelWidth - 800);
                const y = 450 + Math.random() * 150;
                this.platforms.create(x, y, 'ground').refreshBody();
                this.platforms.create(x + 64, y, 'ground').refreshBody();
            }

            this.player = this.physics.add.sprite(100, 600, 'player_idle');
            this.player.setCollideWorldBounds(true);
            this.player.setBounce(0.1);
            this.playerSpeed = 250;
            this.jumpVelocity = -450;
            this.player.canShoot = true;
            this.shootDelay = 200;
            this.player.weaponLevel = 1;
            this.player.armor = 0;
            this.player.isInvincible = false;

            this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
            this.physics.add.collider(this.player, this.platforms);

            this.muzzleFlash = this.add.particles(0, 0, 'spark', {
                speed: 100, scale: { start: 1, end: 0 }, blendMode: 'ADD', lifespan: 100, on: false
            });
            this.explosionEmitter = this.add.particles(0, 0, 'smoke', {
                speed: { min: 50, max: 150 }, angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 1.5 }, blendMode: 'NORMAL', lifespan: 600, gravityY: -50, on: false
            });

            this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 50, runChildUpdate: true });
            this.enemies = this.physics.add.group();
            this.enemyBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 30, runChildUpdate: true });
            this.powerups = this.physics.add.group();

            this.physics.add.collider(this.enemies, this.platforms);
            this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
            this.physics.add.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
            this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, null, this);
            this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, null, this);

            this.createGoal();
            this.spawnLevelEntities();

            this.levelText = this.add.text(20, 20, `LEVEL ${this.currentLevel}`, { 
                fontSize: '28px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 
            }).setScrollFactor(0);
            this.scoreText = this.add.text(20, 55, `SCORE: ${this.score}`, { 
                fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' 
            }).setScrollFactor(0);
            
            this.weaponText = this.add.text(width - 20, 20, 'WEAPON: LV 1', { 
                fontSize: '18px', fill: '#0984e3', fontStyle: 'bold' 
            }).setOrigin(1, 0).setScrollFactor(0);
            
            this.armorIcon = this.add.image(width - 20, 50, 'powerup_armor').setScale(0.8).setVisible(false).setScrollFactor(0);
            
            console.log('=== PLAY SCENE CREATE COMPLETED SUCCESSFULLY ===');
        } catch (error) {
            console.error('=== PLAY SCENE CRASHED ===', error);
            this.add.text(300, 400, 'PLAY SCENE CRASHED!\nCheck Console (F12)\n' + error.message, { 
                fontSize: '28px', fill: '#ff0000', fontStyle: 'bold', align: 'center', stroke: '#fff', strokeThickness: 4 
            }).setOrigin(0.5);
        }
    }

    spawnLevelEntities() {
        const groundY = 700;
        const numEnemies = 4 + Math.floor(this.currentLevel / 3);
        
        for (let i = 0; i < numEnemies; i++) {
            const x = 400 + Math.random() * (this.levelWidth - 800);
            const isFlying = Math.random() < 0.3;
            
            if (isFlying) {
                const enemy = this.enemies.create(x, 400 + Math.random() * 200, 'enemy_drone');
                enemy.health = 2;
                enemy.speed = 80 + (this.currentLevel * 2);
                enemy.direction = -1;
                enemy.isFlying = true;
                enemy.startY = enemy.y;
            } else {
                const enemy = this.enemies.create(x, groundY - 100, 'enemy');
                enemy.health = 2 + Math.floor(this.currentLevel / 10);
                enemy.speed = 60 + (this.currentLevel * 2);
                enemy.direction = -1;
                enemy.isFlying = false;
            }
            enemy.setCollideWorldBounds(true);
            
            this.time.addEvent({
                delay: Math.max(800, 1500 - (this.currentLevel * 10)),
                callback: () => this.enemyShoot(enemy),
                loop: true
            });
        }

        const numPowerups = 2 + Math.floor(this.currentLevel / 10);
        for (let i = 0; i < numPowerups; i++) {
            const x = 300 + Math.random() * (this.levelWidth - 600);
            const y = 500 + Math.random() * 150;
            const type = Math.random() < 0.6 ? 'weapon' : 'armor';
            const pu = this.powerups.create(x, y, type === 'weapon' ? 'powerup_weapon' : 'powerup_armor');
            pu.type = type;
            pu.body.allowGravity = false;
            
            this.tweens.add({
                targets: pu,
                y: y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    enemyShoot(enemy) {
        if (!enemy.active || this.isGameOver) return;
        if (Math.abs(enemy.x - this.player.x) < 500) {
            const eBullet = this.enemyBullets.get(enemy.x, enemy.y);
            if (eBullet) {
                eBullet.setActive(true).setVisible(true).setTexture('enemy_bullet');
                eBullet.body.allowGravity = false;
                const angle = this.physics.moveToObject(eBullet, this.player, 250 + (this.currentLevel * 5));
                eBullet.setVelocity(Math.cos(angle) * (250 + (this.currentLevel * 5)), Math.sin(angle) * (250 + (this.currentLevel * 5)));
            }
        }
    }

    collectPowerUp(player, pu) {
        pu.destroy();
        if (pu.type === 'weapon') {
            this.player.weaponLevel = Math.min(3, this.player.weaponLevel + 1);
            this.weaponText.setText(`WEAPON: LV ${this.player.weaponLevel}`);
            this.cameras.main.flash(300, 9, 132, 227);
        } else if (pu.type === 'armor') {
            this.player.armor = 1;
            this.armorIcon.setVisible(true);
            this.cameras.main.flash(300, 0, 184, 148);
        }
        this.score += 100;
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    update() {
        if (this.isGameOver) return;

        const input = window.__input || {};

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

        if (input.jumpPressed) {
            if (this.player.body.touching.down) {
                this.player.setVelocityY(this.jumpVelocity);
            }
            input.jumpPressed = false;
        }

        if (input.shoot && this.player.canShoot) {
            this.shoot();
            this.player.canShoot = false;
            const delay = this.player.weaponLevel === 3 ? 100 : 200;
            this.time.delayedCall(delay, () => { this.player.canShoot = true; });
        }
        if (input.shootPressed) input.shootPressed = false;

        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            if (enemy.isFlying) {
                enemy.y = enemy.startY + Math.sin(this.time.now / 300) * 40;
                enemy.x += enemy.speed * enemy.direction * 0.016;
                if (enemy.x < 100 || enemy.x > this.levelWidth - 100) enemy.direction *= -1;
                enemy.flipX = enemy.direction === 1;
            } else {
                if (enemy.body.blocked.left || enemy.body.blocked.right) enemy.direction *= -1;
                
                const lookAheadX = enemy.x + (enemy.direction * 20);
                const tilesBelow = this.platforms.getChildren().filter(p => 
                    Math.abs(p.x - lookAheadX) < 32 && p.y > enemy.y && p.y < enemy.y + 60
                );
                
                if (tilesBelow.length === 0 && enemy.body.touching.down) {
                    enemy.direction *= -1;
                }
                enemy.setVelocityX(enemy.speed * enemy.direction);
                enemy.flipX = enemy.direction === 1;
            }
        });

        this.bullets.children.entries.forEach(b => {
            if (b.active && (b.x < this.cameras.main.scrollX - 50 || b.x > this.cameras.main.scrollX + 650)) {
                b.setActive(false).setVisible(false);
            }
        });
        this.enemyBullets.children.entries.forEach(b => {
            if (b.active && (b.y > 1200 || b.x < 0 || b.x > this.levelWidth)) {
                b.setActive(false).setVisible(false);
            }
        });

        if (this.player.y > 900) {
            this.hitPlayer(this.player, null);
        }
    }

    shoot() {
        if (this.isGameOver) return;
        const dir = this.player.flipX ? -1 : 1;
        const startX = this.player.x + (dir * 25);
        const startY = this.player.y - 5;

        if (this.player.weaponLevel === 1) {
            this.fireBullet(startX, startY, dir, 0);
        } else if (this.player.weaponLevel === 2) {
            this.fireBullet(startX, startY - 10, dir, 0);
            this.fireBullet(startX, startY + 10, dir, 0);
        } else if (this.player.weaponLevel === 3) {
            this.fireBullet(startX, startY, dir, 0);
            this.fireBullet(startX, startY, dir, -0.2);
            this.fireBullet(startX, startY, dir, 0.2);
        }
        this.muzzleFlash.emitParticleAt(startX, startY, 5);
    }

    fireBullet(x, y, dir, angleOffset) {
        const bullet = this.bullets.get(x, y);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setTexture('bullet');
            bullet.body.allowGravity = false;
            const baseAngle = dir === 1 ? 0 : Math.PI;
            const angle = baseAngle + angleOffset;
            bullet.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);
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
        if (this.isGameOver || player.isInvincible) return;

        if (this.player.armor > 0) {
            this.player.armor = 0;
            this.armorIcon.setVisible(false);
            player.isInvincible = true;
            player.setTint(0x0984e3);
            this.time.delayedCall(1000, () => { 
                player.isInvincible = false; 
                player.clearTint(); 
            });
            return;
        }

        this.physics.pause();
        this.explosionEmitter.emitParticleAt(player.x, player.y, 30);
        player.setTint(0xff0000);
        this.isGameOver = true;
        
        this.add.text(this.cameras.main.scrollX + 300, 400, 'GAME OVER', { 
            fontSize: '56px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(2500, () => { this.scene.restart(); });
    }

    createGoal() {
        const goalX = this.levelWidth - 150;
        const goalY = 636;
        
        this.goal = this.add.rectangle(goalX, goalY, 60, 120, 0x00ff00, 0.3);
        this.goal.setStrokeStyle(4, 0x00ff00);
        this.physics.add.existing(this.goal, true);
        
        this.goalParticles = this.add.particles(goalX, goalY, 'spark', {
            speed: 50, scale: { start: 0.5, end: 0 }, blendMode: 'ADD', lifespan: 800, frequency: 100
        });

        this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
        
        this.add.text(goalX, goalY - 80, 'GOAL', {
            fontSize: '20px', fill: '#00ff00', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);
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
            this.physics.pause();
            this.add.text(this.cameras.main.scrollX + 300, 400, 'YOU WIN!', { 
                fontSize: '64px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 
            }).setOrigin(0.5).setScrollFactor(0);
        }
    }
}