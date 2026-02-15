// GameScene - 主游戏场景
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 游戏状态
        this.score = 0;
        this.playerHP = 100;
        this.skillCooldown = 0;
        this.isGameOver = false;
        this.level = 1;
        
        // 背景
        this.add.image(400, 225, 'bg-sky');
        
        // 创建平台组
        this.platforms = this.physics.add.staticGroup();
        
        // 地面
        for (let x = 0; x < 850; x += 32) {
            this.platforms.create(x, 418, 'ground').setOrigin(0, 0).refreshBody();
        }
        
        // 创建玩家（赵云）
        this.player = this.physics.add.sprite(100, 300, 'player-idle');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.5);
        this.player.body.setSize(20, 30);
        
        // 玩家属性
        this.player.isAttacking = false;
        this.player.isInvincible = false;
        this.player.attackTimer = null;
        
        // 创建敌人组
        this.enemies = this.physics.add.group();
        
        // 生成初始敌人
        this.spawnEnemies();
        
        // 碰撞检测
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        // 玩家攻击检测
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.skillKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // UI
        this.createUI();
        
        // 粒子效果（攻击特效）
        this.createParticles();
    }

    update() {
        if (this.isGameOver) return;
        
        // 玩家移动
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.flipX = true;
            if (!this.player.isAttacking) {
                this.player.setTexture('player-idle');
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.flipX = false;
            if (!this.player.isAttacking) {
                this.player.setTexture('player-idle');
            }
        } else {
            this.player.setVelocityX(0);
        }
        
        // 跳跃
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-400);
        }
        
        // 普通攻击
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.player.isAttacking) {
            this.playerAttack();
        }
        
        // 技能攻击（龙胆）
        if (Phaser.Input.Keyboard.JustDown(this.skillKey) && this.skillCooldown <= 0) {
            this.playerSkill();
        }
        
        // 更新技能冷却
        if (this.skillCooldown > 0) {
            this.skillCooldown--;
            this.updateSkillUI();
        }
        
        // 敌人AI更新
        this.enemies.children.entries.forEach(enemy => {
            this.updateEnemyAI(enemy);
        });
        
        // 检查所有敌人是否被消灭
        if (this.enemies.countActive() === 0 && !this.isGameOver) {
            this.levelComplete();
        }
    }

    playerAttack() {
        this.player.isAttacking = true;
        this.player.setTexture('player-attack');
        
        // 创建攻击范围
        const attackX = this.player.flipX ? this.player.x - 40 : this.player.x + 40;
        const attackBox = this.add.rectangle(attackX, this.player.y, 60, 40, 0xffff00, 0.3);
        
        // 检查攻击范围内的敌人
        this.enemies.children.entries.forEach(enemy => {
            if (Phaser.Math.Distance.Between(attackBox.x, attackBox.y, enemy.x, enemy.y) < 50) {
                this.damageEnemy(enemy, 25);
                // 击退效果
                const knockback = this.player.flipX ? -100 : 100;
                enemy.setVelocityX(knockback);
            }
        });
        
        // 粒子特效
        this.attackParticles.emitParticleAt(attackX, this.player.y, 10);
        
        // 攻击结束
        this.time.delayedCall(300, () => {
            this.player.isAttacking = false;
            this.player.setTexture('player-idle');
            attackBox.destroy();
        });
    }

    playerSkill() {
        // 龙胆 - 范围攻击
        this.skillCooldown = 180; // 3秒冷却（60fps）
        
        // 大范围特效
        const skillCircle = this.add.circle(this.player.x, this.player.y, 100, 0x4169E1, 0.5);
        
        // 范围内敌人受伤
        this.enemies.children.entries.forEach(enemy => {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 120) {
                this.damageEnemy(enemy, 50);
                // 击飞效果
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.setVelocity(Math.cos(angle) * 200, -200);
            }
        });
        
        // 粒子爆发
        this.skillParticles.emitParticleAt(this.player.x, this.player.y, 30);
        
        // 特效消失
        this.tweens.add({
            targets: skillCircle,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => skillCircle.destroy()
        });
        
        // 屏幕震动
        this.cameras.main.shake(200, 0.01);
    }

    spawnEnemies() {
        // 根据关卡生成敌人
        const enemyCount = 3 + this.level * 2;
        
        for (let i = 0; i < enemyCount; i++) {
            const x = 400 + Math.random() * 350;
            const y = 350;
            
            // 随机敌人类型
            const rand = Math.random();
            let enemy;
            if (rand < 0.6) {
                enemy = this.enemies.create(x, y, 'enemy-soldier');
                enemy.type = 'soldier';
                enemy.hp = 30;
                enemy.damage = 10;
            } else if (rand < 0.9) {
                enemy = this.enemies.create(x, y, 'enemy-archer');
                enemy.type = 'archer';
                enemy.hp = 20;
                enemy.damage = 15;
                enemy.attackRange = 200;
            } else {
                enemy = this.enemies.create(x, y, 'enemy-boss');
                enemy.type = 'boss';
                enemy.hp = 100;
                enemy.damage = 25;
                enemy.setScale(1.2);
            }
            
            enemy.setBounce(0.1);
            enemy.setCollideWorldBounds(true);
            enemy.body.setSize(24, 30);
        }
    }

    updateEnemyAI(enemy) {
        if (!enemy.active) return;
        
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        
        if (enemy.type === 'soldier') {
            // 小兵：靠近攻击
            if (distance > 40) {
                const speed = enemy.type === 'boss' ? 80 : 60;
                if (enemy.x < this.player.x) {
                    enemy.setVelocityX(speed);
                    enemy.flipX = false;
                } else {
                    enemy.setVelocityX(-speed);
                    enemy.flipX = true;
                }
            } else {
                enemy.setVelocityX(0);
                // 攻击玩家
                if (!this.player.isInvincible) {
                    this.damagePlayer(enemy.damage);
                }
            }
        } else if (enemy.type === 'archer') {
            // 弓箭手：保持距离
            if (distance < 150) {
                if (enemy.x < this.player.x) {
                    enemy.setVelocityX(-40);
                } else {
                    enemy.setVelocityX(40);
                }
            } else if (distance > 250) {
                if (enemy.x < this.player.x) {
                    enemy.setVelocityX(40);
                    enemy.flipX = false;
                } else {
                    enemy.setVelocityX(-40);
                    enemy.flipX = true;
                }
            } else {
                enemy.setVelocityX(0);
                // 远程攻击（简化版）
                if (Math.random() < 0.02 && !this.player.isInvincible) {
                    this.damagePlayer(enemy.damage);
                }
            }
        } else if (enemy.type === 'boss') {
            // BOSS：追逐玩家，速度更快
            const speed = 90;
            if (enemy.x < this.player.x) {
                enemy.setVelocityX(speed);
                enemy.flipX = false;
            } else {
                enemy.setVelocityX(-speed);
                enemy.flipX = true;
            }
            
            if (distance < 60 && !this.player.isInvincible) {
                this.damagePlayer(enemy.damage);
            }
        }
    }

    damageEnemy(enemy, damage) {
        enemy.hp -= damage;
        
        // 受伤闪烁
        enemy.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (enemy.active) enemy.clearTint();
        });
        
        // 伤害数字
        this.showDamageText(enemy.x, enemy.y, damage);
        
        if (enemy.hp <= 0) {
            enemy.destroy();
            this.score += enemy.type === 'boss' ? 500 : 100;
            this.updateUI();
            
            // 击杀粒子
            this.deathParticles.emitParticleAt(enemy.x, enemy.y, 15);
        }
    }

    damagePlayer(damage) {
        this.playerHP -= damage;
        this.player.isInvincible = true;
        
        // 受伤闪烁
        this.player.setTint(0xff0000);
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
        
        // 屏幕红闪
        const redFlash = this.add.rectangle(400, 225, 800, 450, 0xff0000, 0.3);
        this.time.delayedCall(100, () => redFlash.destroy());
        
        this.updateUI();
        
        if (this.playerHP <= 0) {
            this.gameOver();
        } else {
            // 无敌时间
            this.time.delayedCall(1000, () => {
                this.player.isInvincible = false;
                this.player.clearTint();
                this.player.alpha = 1;
            });
        }
    }

    hitEnemy(player, enemy) {
        // 碰撞时敌人受伤（如果玩家在攻击）
        if (player.isAttacking) {
            this.damageEnemy(enemy, 15);
        }
    }

    showDamageText(x, y, damage) {
        const text = this.add.text(x, y - 20, `-${damage}`, {
            fontSize: '16px',
            fill: '#ff0000',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    createUI() {
        // 血条背景
        this.hpBg = this.add.rectangle(110, 30, 204, 24, 0x000000);
        this.hpBg.setOrigin(0, 0.5);
        
        // 血条
        this.hpBar = this.add.rectangle(112, 30, 200, 20, 0xff0000);
        this.hpBar.setOrigin(0, 0.5);
        
        // 血条文字
        this.hpText = this.add.text(212, 30, 'HP: 100/100', {
            fontSize: '14px',
            fill: '#ffffff'
        });
        this.hpText.setOrigin(0.5);
        
        // 得分
        this.scoreText = this.add.text(780, 30, '得分: 0', {
            fontSize: '18px',
            fill: '#FFD700',
            fontStyle: 'bold'
        });
        this.scoreText.setOrigin(1, 0.5);
        
        // 技能图标
        this.skillBg = this.add.circle(60, 80, 25, 0x4169E1);
        this.skillText = this.add.text(60, 80, 'X', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.skillText.setOrigin(0.5);
        
        this.skillCooldownText = this.add.text(60, 80, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.skillCooldownText.setOrigin(0.5);
        
        // 技能标签
        this.add.text(60, 115, '龙胆', {
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 关卡显示
        this.levelText = this.add.text(400, 30, `第 ${this.level} 关`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.levelText.setOrigin(0.5);
    }

    updateUI() {
        // 更新血条
        const hpPercent = Math.max(0, this.playerHP / 100);
        this.hpBar.width = 200 * hpPercent;
        this.hpBar.fillColor = hpPercent > 0.5 ? 0x00ff00 : (hpPercent > 0.25 ? 0xffff00 : 0xff0000);
        this.hpText.setText(`HP: ${Math.max(0, this.playerHP)}/100`);
        
        // 更新得分
        this.scoreText.setText(`得分: ${this.score}`);
    }

    updateSkillUI() {
        if (this.skillCooldown > 0) {
            this.skillBg.fillColor = 0x666666;
            this.skillCooldownText.setText(Math.ceil(this.skillCooldown / 60));
        } else {
            this.skillBg.fillColor = 0x4169E1;
            this.skillCooldownText.setText('');
        }
    }

    createParticles() {
        // 攻击粒子
        this.attackParticles = this.add.particles(0, 0, 'ground', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            tint: 0xffff00,
            emitting: false
        });
        
        // 技能粒子
        this.skillParticles = this.add.particles(0, 0, 'ground', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            tint: 0x4169E1,
            emitting: false
        });
        
        // 死亡粒子
        this.deathParticles = this.add.particles(0, 0, 'ground', {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            tint: 0xff0000,
            emitting: false
        });
    }

    levelComplete() {
        this.level++;
        
        // 显示过关文字
        const completeText = this.add.text(400, 225, `第 ${this.level - 1} 关 通关！`, {
            fontSize: '48px',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#8B4513',
            strokeThickness: 6
        });
        completeText.setOrigin(0.5);
        completeText.setDepth(100);
        
        // 下一关按钮
        const nextBtn = this.add.text(400, 300, '下一关 →', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#4169E1',
            padding: { x: 20, y: 10 }
        });
        nextBtn.setOrigin(0.5);
        nextBtn.setInteractive();
        
        nextBtn.on('pointerdown', () => {
            completeText.destroy();
            nextBtn.destroy();
            
            // 恢复血量
            this.playerHP = Math.min(100, this.playerHP + 30);
            this.updateUI();
            
            // 生成新敌人
            this.spawnEnemies();
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0x555555);
        
        // 显示Game Over
        const gameOverBg = this.add.rectangle(400, 225, 800, 450, 0x000000, 0.8);
        gameOverBg.setDepth(99);
        
        const gameOverText = this.add.text(400, 200, '游戏结束', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold'
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(100);
        
        const finalScore = this.add.text(400, 280, `最终得分: ${this.score}`, {
            fontSize: '28px',
            fill: '#ffffff'
        });
        finalScore.setOrigin(0.5);
        finalScore.setDepth(100);
        
        // 重新开始按钮
        const restartBtn = this.add.text(400, 350, '重新开始', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#4169E1',
            padding: { x: 30, y: 15 }
        });
        restartBtn.setOrigin(0.5);
        restartBtn.setInteractive();
        restartBtn.setDepth(100);
        
        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });
        
        // 返回菜单按钮
        const menuBtn = this.add.text(400, 420, '返回菜单', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 20, y: 10 }
        });
        menuBtn.setOrigin(0.5);
        menuBtn.setInteractive();
        menuBtn.setDepth(100);
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
