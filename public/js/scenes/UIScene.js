export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const uiHeight = 150; // Height of the UI area at the bottom
        const uiY = height - uiHeight + 20;

        // D-Pad (Left side)
        this.createDPad(80, uiY);

        // Action Buttons (Right side)
        this.createActionButtons(width - 80, uiY);
    }

    createDPad(x, y) {
        const buttonSize = 60;
        const gap = 10;

        // Left button
        this.createTouchButton(x - buttonSize - gap, y, buttonSize, '◀', 'moveLeft', 'stopLeft');
        // Right button
        this.createTouchButton(x + buttonSize + gap, y, buttonSize, '▶', 'moveRight', 'stopRight');
        // Jump button (placed above or integrated, let's put it slightly above for better ergonomics)
        this.createTouchButton(x, y - buttonSize - gap, buttonSize, '▲', 'jump', null);
    }

    createActionButtons(x, y) {
        const buttonSize = 70;
        const gap = 20;

        // Shoot button
        this.createTouchButton(x, y, buttonSize, '🔥', 'shoot', null);
    }

    createTouchButton(x, y, size, text, downEvent, upEvent) {
        // Create a circular graphics object for the button
        const graphics = this.add.graphics();
        graphics.fillStyle(0x888888, 0.5);
        graphics.fillCircle(x, y, size / 2);
        graphics.lineStyle(2, 0xffffff, 0.8);
        graphics.strokeCircle(x, y, size / 2);

        // Add text to the button
        const buttonText = this.add.text(x, y, text, {
            fontSize: `${size / 2.5}px`,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Make the entire area interactive
        const hitArea = new Phaser.Geom.Circle(x, y, size / 2);
        graphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        // Touch events
        graphics.on('pointerdown', () => {
            graphics.clear();
            graphics.fillStyle(0xaaaaaa, 0.7);
            graphics.fillCircle(x, y, size / 2);
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeCircle(x, y, size / 2);
            if (downEvent) {
                this.scene.get('PlayScene').events.emit(downEvent);
            }
        });

        graphics.on('pointerup', () => {
            graphics.clear();
            graphics.fillStyle(0x888888, 0.5);
            graphics.fillCircle(x, y, size / 2);
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeCircle(x, y, size / 2);
            if (upEvent) {
                this.scene.get('PlayScene').events.emit(upEvent);
            }
        });

        graphics.on('pointerout', () => {
            graphics.clear();
            graphics.fillStyle(0x888888, 0.5);
            graphics.fillCircle(x, y, size / 2);
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeCircle(x, y, size / 2);
            if (upEvent) {
                this.scene.get('PlayScene').events.emit(upEvent);
            }
        });
    }
}