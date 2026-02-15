// 赵子龙传 - 主入口
// 导入所有场景（内联方式，避免模块加载问题）
// 场景文件通过script标签引入

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    backgroundColor: '#2d4a3e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 启动游戏
const game = new Phaser.Game(config);
