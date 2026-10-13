import Phaser from "phaser";
import { COLORS, makeButton, makeText } from "../ui.js";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.ink);
    this.started = false;

    this.badge = this.add.circle(0, 0, 38, COLORS.gold).setStrokeStyle(4, COLORS.white);
    this.badgeKana = makeText(this, 0, 0, "あ", { fontSize: "34px", fontStyle: "bold" }).setOrigin(0.5);
    this.eyebrow = makeText(this, 0, 0, "HIRAGANA  ×  ROMAJI", {
      color: "#f2bd62",
      fontSize: "14px",
      fontStyle: "bold",
      letterSpacing: 3,
    }).setOrigin(0.5);
    this.title = makeText(this, 0, 0, "假名蒐集任務", {
      color: "#fffdf8",
      fontSize: "48px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.description = makeText(this, 0, 0, "看懂提示，操控角色蒐集正確配對。\n五關、二十五個假名，每題答對得一分。", {
      color: "#e7e8ed",
      fontSize: "18px",
      align: "center",
      lineSpacing: 9,
    }).setOrigin(0.5);
    this.startButton = makeButton(this, {
      x: 0,
      y: 0,
      width: 300,
      height: 64,
      label: "開始遊戲",
      onClick: () => this.startGame(),
      fill: COLORS.coral,
      fontSize: 22,
    });
    this.controls = makeText(this, 0, 0, "鍵盤：方向鍵或 WASD　・　手機：使用畫面下方方向按鈕", {
      color: "#bfc7d4",
      fontSize: "14px",
      align: "center",
    }).setOrigin(0.5);

    this.input.keyboard?.on("keydown", (event) => {
      if (event.code === "Enter" || event.code === "Space") this.startGame();
    });
    this.scale.on("resize", this.layout, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.layout, this));
    this.layout();
  }

  layout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const smallScreen = width < 520;
    this.badge.setPosition(centerX, height * 0.17).setRadius(smallScreen ? 31 : 38);
    this.badgeKana.setPosition(centerX, height * 0.17).setFontSize(smallScreen ? "29px" : "34px");
    this.eyebrow.setPosition(centerX, height * 0.27).setFontSize(smallScreen ? "12px" : "14px");
    this.title.setPosition(centerX, height * 0.36).setFontSize(smallScreen ? "36px" : "48px");
    this.description.setPosition(centerX, height * 0.49).setFontSize(smallScreen ? "16px" : "18px");
    this.startButton.setLayout(centerX, height * 0.66, Math.min(width * 0.72, 340), 62, smallScreen ? 20 : 22);
    this.controls.setPosition(centerX, height * 0.84).setFontSize(smallScreen ? "12px" : "14px");
  }

  startGame() {
    if (this.started) return;
    this.started = true;
    this.scene.start("GameScene");
  }
}
