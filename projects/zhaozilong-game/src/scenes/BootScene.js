// BootScene - 资源加载
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 创建临时图形资源（后续可以替换为真实素材）
        this.createPlayerSprite();
        this.createEnemySprites();
        this.createUISprites();
        this.createBackground();
        
        // 创建音效（使用Web Audio）
        this.load.setBaseURL('');
    }

    create() {
        this.scene.start('MenuScene');
    }

    createPlayerSprite() {
        // 赵云 - 32x32像素
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 身体（蓝色铠甲）
        graphics.fillStyle(0x4169E1);
        graphics.fillRect(8, 8, 16, 20);
        
        // 头（肤色）
        graphics.fillStyle(0xFFDAB9);
        graphics.fillRect(10, 2, 12, 8);
        
        // 头盔装饰（白色）
        graphics.fillStyle(0xFFFFFF);
        graphics.fillRect(12, 0, 8, 4);
        
        // 枪（银色）
        graphics.fillStyle(0xC0C0C0);
        graphics.fillRect(20, 10, 12, 3);
        graphics.fillRect(28, 8, 4, 8);
        
        graphics.generateTexture('player-idle', 32, 32);
        graphics.clear();

        // 攻击姿态
        graphics.fillStyle(0x4169E1);
        graphics.fillRect(8, 8, 16, 20);
        graphics.fillStyle(0xFFDAB9);
        graphics.fillRect(10, 2, 12, 8);
        graphics.fillStyle(0xFFFFFF);
        graphics.fillRect(12, 0, 8, 4);
        // 枪向前刺
        graphics.fillStyle(0xC0C0C0);
        graphics.fillRect(24, 14, 16, 3);
        
        graphics.generateTexture('player-attack', 48, 32);
    }

    createEnemySprites() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 小兵 - 红色（魏军）
        graphics.fillStyle(0x8B0000);
        graphics.fillRect(4, 8, 16, 20);
        graphics.fillStyle(0xFFDAB9);
        graphics.fillRect(6, 2, 12, 8);
        graphics.fillStyle(0x666666);
        graphics.fillRect(20, 12, 8, 3); // 刀
        
        graphics.generateTexture('enemy-soldier', 32, 32);
        graphics.clear();

        // 弓箭手
        graphics.fillStyle(0x8B0000);
        graphics.fillRect(4, 8, 16, 20);
        graphics.fillStyle(0xFFDAB9);
        graphics.fillRect(6, 2, 12, 8);
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(20, 10, 12, 4); // 弓
        
        graphics.generateTexture('enemy-archer', 36, 32);
        graphics.clear();

        // BOSS - 更大
        graphics.fillStyle(0x4B0082);
        graphics.fillRect(8, 12, 32, 36);
        graphics.fillStyle(0xFFDAB9);
        graphics.fillRect(14, 4, 20, 12);
        graphics.fillStyle(0xFFD700);
        graphics.fillRect(16, 0, 16, 6); // 头盔
        graphics.fillStyle(0x666666);
        graphics.fillRect(40, 20, 20, 6); // 大刀
        
        graphics.generateTexture('enemy-boss', 64, 52);
    }

    createUISprites() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 地面
        graphics.fillStyle(0x8B7355);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0x654321);
        graphics.fillRect(0, 0, 32, 4);
        graphics.fillRect(0, 28, 32, 4);
        
        graphics.generateTexture('ground', 32, 32);
        graphics.clear();

        // 按钮
        graphics.fillStyle(0x4169E1);
        graphics.fillRoundedRect(0, 0, 200, 50, 10);
        graphics.generateTexture('btn-blue', 200, 50);
        
        graphics.clear();
        graphics.fillStyle(0xDC143C);
        graphics.fillRoundedRect(0, 0, 200, 50, 10);
        graphics.generateTexture('btn-red', 200, 50);
    }

    createBackground() {
        // 创建渐变背景纹理
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        // 天空渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, 450);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#E0F6FF');
        gradient.addColorStop(0.6, '#90EE90');
        gradient.addColorStop(1, '#228B22');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 450);
        
        // 远山
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.moveTo(0, 270);
        ctx.lineTo(200, 200);
        ctx.lineTo(400, 250);
        ctx.lineTo(600, 180);
        ctx.lineTo(800, 270);
        ctx.lineTo(800, 450);
        ctx.lineTo(0, 450);
        ctx.closePath();
        ctx.fill();
        
        this.textures.addCanvas('bg-sky', canvas);
    }
}
