export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const uiY = height - 100;

        // D-Pad (Left side)
        this.createDPad(100, uiY);

        // Action Buttons (Right side)
        this.createActionButtons(width - 120, uiY);
    }

    createDPad(x, y) {
        const btnSize = 70;
        const gap = 15;

        // Left
        this.createModernButton(x - btnSize - gap, y, btnSize, '◀', 'moveLeft', 'stopLeft');
        // Right
        this.createModernButton(x + btnSize + gap, y, btnSize, '▶', 'moveRight', 'stopRight');
        // Jump (placed slightly above for ergonomic thumb reach)
        this.createModernButton(x, y - btnSize - gap, btnSize, '▲', 'jump', null);
    }

    createActionButtons(x, y) {
        const btnSize = 85;
        const gap = 20;

        // Shoot / Fire button (Larger, prominent)
        this.createModernButton(x, y, btnSize, '🔥', 'shoot', 'stopShoot', 0xff4757);
    }

    createModernButton(x, y, size, icon, downEvent, upEvent, color = 0x2ed573) {
        const container = this.add.container(x, y);
        const isCircle = true;

        // Background shape
        const bg = this.add.graphics();
        const drawShape = () => {
            bg.clear();
            bg.fillStyle(color, 0.3); // Semi-transparent
            bg.fillCircle(0, 0, size / 2);
            bg.lineStyle(3, 0xffffff, 0.6);
            bg.strokeCircle(0, 0, size / 2);
        };
        drawShape();
        container.add(bg);

        // Icon
        const text = this.add.text(0, 0, icon, {
            fontSize: `${size / 2.5}px`,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(text);

        // Hit area (invisible, larger for better touch tolerance)
        const hitArea = new Phaser.Geom.Circle(0, 0, size / 1.5);
        container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        // Touch Feedback Animations
        container.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50,
                yoyo: false
            });
            bg.clear();
            bg.fillStyle(color, 0.6); // Brighter on press
            bg.fillCircle(0, 0, size / 2);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeCircle(0, 0, size / 2);
            
            if (downEvent) {
                this.scene.get('PlayScene').events.emit(downEvent);
            }
        });

        const releaseAction = () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 50,
                yoyo: false
            });
            drawShape(); // Reset style
            if (upEvent) {
                this.scene.get('PlayScene').events.emit(upEvent);
            }
        };

        container.on('pointerup', releaseAction);
        container.on('pointerout', releaseAction);
    }
}