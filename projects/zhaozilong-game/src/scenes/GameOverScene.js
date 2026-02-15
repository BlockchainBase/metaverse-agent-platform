// GameOverScene - 游戏结束（备用场景，实际逻辑在GameScene中处理）
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        // 背景遮罩
        this.add.rectangle(400, 225, 800, 450, 0x000000, 0.9);
        
        // Game Over 文字
        const gameOverText = this.add.text(400, 150, '💀 阵亡 💀', {
            fontSize: '64px',
            fontFamily: 'Microsoft YaHei',
            fill: '#ff0000',
            stroke: '#8B0000',
            strokeThickness: 6
        });
        gameOverText.setOrigin(0.5);
        
        // 子龙台词
        const quote = this.add.text(400, 220, '"臣定当竭忠尽智，扶汉室于危亡！"', {
            fontSize: '20px',
            fontFamily: 'Microsoft YaHei',
            fill: '#CCCCCC',
            fontStyle: 'italic'
        });
        quote.setOrigin(0.5);
        
        // 得分
        const scoreText = this.add.text(400, 280, `最终得分: ${data.score || 0}`, {
            fontSize: '28px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFD700',
            fontStyle: 'bold'
        });
        scoreText.setOrigin(0.5);
        
        // 重新开始按钮
        const restartBtn = this.add.image(400, 360, 'btn-blue').setInteractive();
        const restartText = this.add.text(400, 360, '再战长坂坡', {
            fontSize: '24px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFFFFF'
        });
        restartText.setOrigin(0.5);
        
        restartBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        restartBtn.on('pointerover', () => restartBtn.setTint(0xdddddd));
        restartBtn.on('pointerout', () => restartBtn.clearTint());
        
        // 返回菜单按钮
        const menuBtn = this.add.image(400, 430, 'btn-red').setInteractive();
        const menuText = this.add.text(400, 430, '返回主菜单', {
            fontSize: '20px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFFFFF'
        });
        menuText.setOrigin(0.5);
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        menuBtn.on('pointerover', () => menuBtn.setTint(0xdddddd));
        menuBtn.on('pointerout', () => menuBtn.clearTint());
    }
}
