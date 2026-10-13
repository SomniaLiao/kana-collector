import Phaser from "phaser";
import { LEVELS, shuffle } from "../data/kana.js";
import { COLORS, isTouchDevice, makeText } from "../ui.js";

const QUESTIONS_PER_LEVEL = 5;
const TOTAL_QUESTIONS = LEVELS.length * QUESTIONS_PER_LEVEL;
const SLOT_X = [0.17, 0.5, 0.83, 0.32, 0.68];

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.paper);
    this.hasTouch = isTouchDevice();
    this.touchControlsEnabled = this.hasTouch || this.scale.width < 820;
    this.levelIndex = 0;
    this.questionInLevel = 0;
    this.totalQuestionIndex = 0;
    this.score = 0;
    this.locked = false;
    this.touchDirections = { up: false, down: false, left: false, right: false };
    this.levelQuestions = shuffle(LEVELS[0].pairs);
    this.optionOrder = [];

    this.headerText = makeText(this, 0, 0, "", { fontSize: "17px", fontStyle: "bold" });
    this.scoreText = makeText(this, 0, 0, "", { fontSize: "16px", fontStyle: "bold" }).setOrigin(1, 0);
    this.progressTrack = this.add.rectangle(0, 0, 100, 7, COLORS.line).setOrigin(0);
    this.progressFill = this.add.rectangle(0, 0, 1, 7, COLORS.teal).setOrigin(0);
    this.directionText = makeText(this, 0, 0, "", {
      fontSize: "14px",
      color: `#${COLORS.muted.toString(16).padStart(6, "0")}`,
      align: "center",
    }).setOrigin(0.5);
    this.promptText = makeText(this, 0, 0, "", { fontSize: "40px", fontStyle: "bold", align: "center" }).setOrigin(0.5);
    this.feedbackText = makeText(this, 0, 0, "", { fontSize: "16px", fontStyle: "bold", align: "center" }).setOrigin(0.5);
    this.orientationOverlay = this.add.rectangle(0, 0, 100, 100, COLORS.ink, 0.97).setOrigin(0).setDepth(20);
    this.orientationTitle = makeText(this, 0, 0, "請將手機轉為直向", {
      fontSize: "26px",
      fontStyle: "bold",
      color: "#fffdf8",
      align: "center",
    }).setOrigin(0.5).setDepth(21);
    this.orientationDescription = makeText(this, 0, 0, "直向畫面較適合移動角色與蒐集答案。", {
      fontSize: "15px",
      color: "#d9deea",
      align: "center",
    }).setOrigin(0.5).setDepth(21);

    this.playerRadius = 22;
    this.player = this.createPlayer();
    this.cards = [];
    this.dpadButtons = this.createDpad();
    this.keys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.input.on("pointerup", this.releaseTouchDirections, this);
    this.scale.on("resize", this.layout, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.layout, this);
      this.input.off("pointerup", this.releaseTouchDirections, this);
    });

    this.layout();
    this.showQuestion();
  }

  createPlayer() {
    const body = this.add.circle(0, 0, this.playerRadius, COLORS.coral).setStrokeStyle(3, COLORS.white);
    const patch = this.add.circle(0, 5, this.playerRadius * 0.54, COLORS.gold);
    const eyeLeft = this.add.circle(-7, -3, 2.5, COLORS.ink);
    const eyeRight = this.add.circle(7, -3, 2.5, COLORS.ink);
    return this.add.container(0, 0, [body, patch, eyeLeft, eyeRight]).setDepth(5);
  }

  createDpad() {
    const directions = [
      { id: "up", label: "▲" },
      { id: "left", label: "◀" },
      { id: "down", label: "▼" },
      { id: "right", label: "▶" },
    ];
    return directions.map(({ id, label }) => {
      const background = this.add.circle(0, 0, 25, COLORS.ink, 0.93)
        .setStrokeStyle(2, COLORS.white, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);
      const text = makeText(this, 0, 0, label, {
        fontSize: "19px",
        color: "#fffdf8",
        align: "center",
      }).setOrigin(0.5).setDepth(11);
      background.on("pointerdown", () => { this.touchDirections[id] = true; });
      return { id, background, text };
    });
  }

  layout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const margin = Math.max(16, Math.min(30, width * 0.045));
    this.touchControlsEnabled = this.hasTouch || width < 820;
    this.requiresPortrait = this.hasTouch && width > height && height < 520;
    const compact = width < 520;
    this.playerRadius = Math.max(17, Math.min(25, Math.min(width, height) * 0.045));

    this.headerText.setPosition(margin, 17).setFontSize(compact ? "15px" : "17px");
    this.scoreText.setPosition(width - margin, 17).setFontSize(compact ? "15px" : "16px");
    this.progressTrack.setPosition(margin, 46).setSize(Math.max(40, width - margin * 2), 7);
    this.progressFill.setPosition(margin, 46).setSize(Math.max(1, (width - margin * 2) * (this.totalQuestionIndex / TOTAL_QUESTIONS)), 7);
    this.directionText.setPosition(width / 2, 75).setFontSize(compact ? "13px" : "14px");
    this.promptText.setPosition(width / 2, 112).setFontSize(compact ? "36px" : "42px");
    this.feedbackText.setPosition(width / 2, 149).setFontSize(compact ? "14px" : "16px");
    this.orientationOverlay.setPosition(0, 0).setSize(width, height).setVisible(this.requiresPortrait);
    this.orientationTitle.setPosition(width / 2, height / 2 - 18).setFontSize(compact ? "22px" : "26px").setVisible(this.requiresPortrait);
    this.orientationDescription.setPosition(width / 2, height / 2 + 24).setFontSize(compact ? "13px" : "15px").setVisible(this.requiresPortrait);

    this.arenaTop = 166;
    this.arenaBottom = height - (this.touchControlsEnabled ? 160 : 24);
    if (this.arenaBottom < this.arenaTop + 110) this.arenaBottom = this.arenaTop + 110;
    this.tileWidth = Math.min(180, Math.max(76, width * 0.235));
    this.tileHeight = Math.max(58, Math.min(88, height * 0.105));
    this.playerRadius = Math.max(17, Math.min(25, Math.min(width, height) * 0.045));

    if (this.player) {
      const [body, patch] = this.player.list;
      body.setRadius(this.playerRadius).setStrokeStyle(3, COLORS.white);
      patch.setRadius(this.playerRadius * 0.54).setPosition(0, this.playerRadius * 0.23);
      this.player.list[2].setPosition(-this.playerRadius * 0.31, -this.playerRadius * 0.14).setRadius(Math.max(2, this.playerRadius * 0.12));
      this.player.list[3].setPosition(this.playerRadius * 0.31, -this.playerRadius * 0.14).setRadius(Math.max(2, this.playerRadius * 0.12));
    }

    const buttonRadius = Math.min(29, Math.max(23, width * 0.075));
    const centerX = width / 2;
    const dpadY = height - 25 - buttonRadius;
    const spacing = buttonRadius * 2 + 5;
    const dpadPositions = {
      up: [centerX, dpadY - spacing],
      left: [centerX - spacing, dpadY],
      down: [centerX, dpadY],
      right: [centerX + spacing, dpadY],
    };
    for (const button of this.dpadButtons) {
      const [x, y] = dpadPositions[button.id];
      button.background.setPosition(x, y).setRadius(buttonRadius);
      button.text.setPosition(x, y).setFontSize(`${Math.max(16, buttonRadius * 0.72)}px`);
      button.background.setVisible(this.touchControlsEnabled);
      button.text.setVisible(this.touchControlsEnabled);
    }

    if (this.headerText) this.updateHud();
    if (this.currentPair) this.renderCards();
  }

  updateHud() {
    const level = LEVELS[this.levelIndex];
    this.headerText.setText(`第 ${this.levelIndex + 1} 關・${level.name}　　本關 ${this.questionInLevel + 1}/5`);
    this.scoreText.setText(`分數 ${this.score} / 25`);
    const width = Math.max(40, this.scale.width - Math.max(16, Math.min(30, this.scale.width * 0.045)) * 2);
    this.progressFill.setSize(Math.max(1, width * (this.totalQuestionIndex / TOTAL_QUESTIONS)), 7);
  }

  showQuestion() {
    this.locked = false;
    this.feedbackText.setText("").setColor(`#${COLORS.muted.toString(16).padStart(6, "0")}`);
    this.currentPair = this.levelQuestions[this.questionInLevel];
    this.romajiPrompt = this.totalQuestionIndex % 2 === 0;
    this.directionText.setText(this.romajiPrompt ? "看到羅馬拼音，蒐集對應的平假名" : "看到平假名，蒐集對應的羅馬拼音");
    this.promptText.setText(this.romajiPrompt ? this.currentPair.romaji : this.currentPair.kana);
    this.optionOrder = shuffle(LEVELS[this.levelIndex].pairs);
    this.updateHud();
    this.renderCards();
    this.placePlayerAtStart();
  }

  renderCards() {
    for (const card of this.cards) {
      card.background.destroy();
      card.label.destroy();
    }
    this.cards = [];
    if (!this.currentPair || !this.optionOrder.length) return;

    const width = this.scale.width;
    const availableHeight = Math.max(110, this.arenaBottom - this.arenaTop);
    const rowYs = [this.arenaTop + availableHeight * 0.29, this.arenaTop + availableHeight * 0.76];
    const slots = [
      [width * SLOT_X[0], rowYs[0]],
      [width * SLOT_X[1], rowYs[0]],
      [width * SLOT_X[2], rowYs[0]],
      [width * SLOT_X[3], rowYs[1]],
      [width * SLOT_X[4], rowYs[1]],
    ];

    this.optionOrder.forEach((pair, index) => {
      const [x, y] = slots[index];
      const background = this.add.rectangle(x, y, this.tileWidth, this.tileHeight, COLORS.white)
        .setStrokeStyle(2, COLORS.line)
        .setDepth(2);
      const label = makeText(this, x, y, this.romajiPrompt ? pair.kana : pair.romaji, {
        fontSize: `${this.romajiPrompt ? Math.min(34, this.tileHeight * 0.52) : Math.min(25, this.tileHeight * 0.39)}px`,
        fontStyle: "bold",
        align: "center",
      }).setOrigin(0.5).setDepth(3);
      this.cards.push({ pair, x, y, background, label });
    });
  }

  placePlayerAtStart() {
    this.playerStart = {
      x: this.scale.width / 2,
      y: this.arenaTop + (this.arenaBottom - this.arenaTop) * 0.52,
    };
    this.player.setPosition(this.playerStart.x, this.playerStart.y).setAlpha(1);
  }

  releaseTouchDirections() {
    this.touchDirections.up = false;
    this.touchDirections.down = false;
    this.touchDirections.left = false;
    this.touchDirections.right = false;
  }

  update(_time, delta) {
    if (this.locked || this.requiresPortrait || !this.player) return;
    const keys = this.keys;
    let x = Number(Boolean(keys?.right?.isDown || keys?.d?.isDown || this.touchDirections.right)) - Number(Boolean(keys?.left?.isDown || keys?.a?.isDown || this.touchDirections.left));
    let y = Number(Boolean(keys?.down?.isDown || keys?.s?.isDown || this.touchDirections.down)) - Number(Boolean(keys?.up?.isDown || keys?.w?.isDown || this.touchDirections.up));
    if (!x && !y) return;

    const magnitude = Math.hypot(x, y);
    x /= magnitude;
    y /= magnitude;
    const speed = Math.min(300, Math.min(this.scale.width, this.scale.height) * 0.62);
    const step = Math.min(delta, 40) / 1000 * speed;
    const minX = this.playerRadius + 8;
    const maxX = this.scale.width - this.playerRadius - 8;
    const minY = this.arenaTop + this.playerRadius;
    const maxY = this.arenaBottom - this.playerRadius;
    this.player.x = Phaser.Math.Clamp(this.player.x + x * step, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y + y * step, minY, maxY);
    this.checkCardCollisions();
  }

  checkCardCollisions() {
    const radius = this.playerRadius + 2;
    for (const card of this.cards) {
      const closestX = Phaser.Math.Clamp(this.player.x, card.x - this.tileWidth / 2, card.x + this.tileWidth / 2);
      const closestY = Phaser.Math.Clamp(this.player.y, card.y - this.tileHeight / 2, card.y + this.tileHeight / 2);
      const dx = this.player.x - closestX;
      const dy = this.player.y - closestY;
      if (dx * dx + dy * dy <= radius * radius) {
        this.answer(card.pair);
        return;
      }
    }
  }

  answer(pair) {
    if (this.locked) return;
    this.locked = true;
    const correct = pair.kana === this.currentPair.kana;

    if (!correct) {
      this.feedbackText.setText("再試一次").setColor(`#${COLORS.red.toString(16).padStart(6, "0")}`);
      this.tweens.add({ targets: this.player, alpha: 0.45, yoyo: true, repeat: 2, duration: 90 });
      this.time.delayedCall(520, () => {
        this.placePlayerAtStart();
        this.feedbackText.setText("").setColor(`#${COLORS.muted.toString(16).padStart(6, "0")}`);
        this.locked = false;
      });
      return;
    }

    this.score += 1;
    this.totalQuestionIndex += 1;
    this.questionInLevel += 1;
    this.updateHud();
    this.feedbackText.setText("答對 +1").setColor(`#${COLORS.teal.toString(16).padStart(6, "0")}`);
    this.tweens.add({ targets: this.player, scale: 1.2, yoyo: true, duration: 140 });

    this.time.delayedCall(650, () => {
      if (this.questionInLevel >= QUESTIONS_PER_LEVEL) {
        if (this.levelIndex === LEVELS.length - 1) {
          this.scene.start("ResultScene", { score: this.score });
          return;
        }
        this.levelIndex += 1;
        this.questionInLevel = 0;
        this.levelQuestions = shuffle(LEVELS[this.levelIndex].pairs);
      }
      this.showQuestion();
    });
  }
}
