// MenuScene - 开始菜单
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // 背景
        this.add.image(400, 225, 'bg-sky');
        
        // 标题
        const title = this.add.text(400, 100, '⚔️ 赵子龙传 ⚔️', {
            fontSize: '48px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // 副标题
        const subtitle = this.add.text(400, 160, '长坂坡七进七出', {
            fontSize: '24px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);
        
        // 赵云图标
        const player = this.add.image(400, 260, 'player-idle');
        player.setScale(3);
        
        // 开始按钮
        const startBtn = this.add.image(400, 360, 'btn-blue').setInteractive();
        const startText = this.add.text(400, 360, '开始游戏', {
            fontSize: '24px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFFFFF'
        });
        startText.setOrigin(0.5);
        
        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        startBtn.on('pointerover', () => {
            startBtn.setTint(0xdddddd);
        });
        
        startBtn.on('pointerout', () => {
            startBtn.clearTint();
        });
        
        // 操作说明
        const help = this.add.text(400, 420, '← → 移动 | ↑ 跳跃 | Z 攻击 | X 技能', {
            fontSize: '16px',
            fontFamily: 'Microsoft YaHei',
            fill: '#FFFFFF',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        });
        help.setOrigin(0.5);
        
        // 动画效果
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
