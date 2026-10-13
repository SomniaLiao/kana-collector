import Phaser from "phaser";
import { COLORS, makeButton, makeText } from "../ui.js";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.score = Number(data?.score ?? 0);
    this.restarting = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.ink);
    this.badge = this.add.circle(0, 0, 48, COLORS.teal).setStrokeStyle(4, COLORS.white);
    this.badgeText = makeText(this, 0, 0, "✓", { fontSize: "48px", color: "#fffdf8", fontStyle: "bold" }).setOrigin(0.5);
    this.title = makeText(this, 0, 0, "任務完成！", { fontSize: "42px", color: "#fffdf8", fontStyle: "bold" }).setOrigin(0.5);
    this.description = makeText(this, 0, 0, "你完成了五個假名行的辨識任務。", {
      fontSize: "17px",
      color: "#d9deea",
      align: "center",
    }).setOrigin(0.5);
    this.scorePanel = this.add.rectangle(0, 0, 250, 104, COLORS.white).setStrokeStyle(2, COLORS.gold);
    this.scoreLabel = makeText(this, 0, 0, "最終得分", { fontSize: "16px", color: `#${COLORS.muted.toString(16).padStart(6, "0")}` }).setOrigin(0.5);
    this.scoreText = makeText(this, 0, 0, `${this.score} / 25`, { fontSize: "34px", fontStyle: "bold" }).setOrigin(0.5);
    this.replayButton = makeButton(this, {
      x: 0,
      y: 0,
      width: 300,
      height: 62,
      label: "再玩一次",
      onClick: () => this.replay(),
      fill: COLORS.coral,
      fontSize: 21,
    });
    this.footer = makeText(this, 0, 0, "每次重新開始都會重新排列題目與答案位置。", {
      fontSize: "13px",
      color: "#bfc7d4",
      align: "center",
    }).setOrigin(0.5);

    this.input.keyboard?.on("keydown", (event) => {
      if (event.code === "Enter" || event.code === "Space") this.replay();
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
    const badgeY = height * 0.2;
    this.badge.setPosition(centerX, badgeY).setRadius(smallScreen ? 40 : 48);
    this.badgeText.setPosition(centerX, badgeY).setFontSize(smallScreen ? "40px" : "48px");
    this.title.setPosition(centerX, height * 0.34).setFontSize(smallScreen ? "34px" : "42px");
    this.description.setPosition(centerX, height * 0.43).setFontSize(smallScreen ? "15px" : "17px");
    this.scorePanel.setPosition(centerX, height * 0.56).setSize(smallScreen ? 220 : 250, 104);
    this.scoreLabel.setPosition(centerX, height * 0.535).setFontSize(smallScreen ? "14px" : "16px");
    this.scoreText.setPosition(centerX, height * 0.59).setFontSize(smallScreen ? "30px" : "34px");
    this.replayButton.setLayout(centerX, height * 0.73, Math.min(width * 0.72, 340), 62, smallScreen ? 19 : 21);
    this.footer.setPosition(centerX, height * 0.86).setFontSize(smallScreen ? "12px" : "13px");
  }

  replay() {
    if (this.restarting) return;
    this.restarting = true;
    this.scene.start("GameScene");
  }
}
