import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0d001a',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 800,
        expandParent: false
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [BootScene, PlayScene]
};

window.addEventListener('load', () => {
    try {
        const game = new Phaser.Game(config);
        window.__game = game;
    } catch (err) {
        const el = document.getElementById('game-container');
        if (el) {
            el.innerHTML = '<div style="padding:24px;color:#ff5555;background:#222;"><h2>Failed to start game</h2><p>' + (err && err.message ? err.message : String(err)) + '</p></div>';
        }
        console.error('Phaser init error:', err);
    }
});