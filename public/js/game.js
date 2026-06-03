import { BootScene } from './scenes/BootScene.js';
import { PlayScene } from './scenes/PlayScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0d001a',
    pixelArt: true,
    scale: {
        // Menggunakan FIT lebih stabil untuk memastikan canvas tidak berukuran 0x0
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 800
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
        console.log('=== PHASER INITIALIZING ===');
        const game = new Phaser.Game(config);
        window.__game = game;
        console.log('=== PHASER INITIALIZED SUCCESSFULLY ===');
    } catch (err) {
        console.error('=== PHASER INIT ERROR ===', err);
        const el = document.getElementById('game-container');
        if (el) {
            el.innerHTML = '<div style="padding:24px;color:#ff5555;background:#222;border:2px solid red;"><h2>CRITICAL ERROR</h2><p>' + (err && err.message ? err.message : String(err)) + '</p></div>';
        }
    }
});