import Phaser from "phaser";
import "./style.css";
import { CATEGORY_LABELS, getRounds } from "./data.js";

const COLORS = {
  ink: 0x17233b, paper: 0xfffefa, teal: 0x087e77, tealLight: 0xe0f1ed,
  gold: 0xeab464, muted: 0x727b89, line: 0xe7e7e2, white: 0xffffff,
};
const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

class MemoryScene extends Phaser.Scene {
  constructor() {
    super("MemoryScene");
    this.mode = { script: "hiragana", category: "all" };
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.paper);
    this.cardVisuals = [];
    this.overlayObjects = [];
    this.focusIndex = 0;
    this.statusMessage = "翻開兩張卡片，找出假名與羅馬拼音的配對";
    this.headerText = this.add.text(0, 0, "", {
      fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#17233b",
    });
    this.scoreText = this.add.text(0, 0, "", {
      fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#087e77", align: "right",
    }).setOrigin(1, 0);
    this.progressTrack = this.add.rectangle(0, 0, 100, 6, COLORS.line).setOrigin(0);
    this.progressFill = this.add.rectangle(0, 0, 1, 6, COLORS.teal).setOrigin(0);
    this.statusText = this.add.text(0, 0, "", {
      fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#727b89",
    }).setOrigin(0.5, 0);

    this.game.events.on("mode-change", this.changeMode, this);
    this.scale.on("resize", this.layout, this);
    this.input.keyboard?.on("keydown", this.handleKeyboard, this);
    this.events.once("shutdown", () => {
      this.game.events.off("mode-change", this.changeMode, this);
      this.scale.off("resize", this.layout, this);
      this.input.keyboard?.off("keydown", this.handleKeyboard, this);
    });
    this.startSession(this.mode);
    this.layout();
  }

  changeMode(mode) {
    this.startSession(mode);
    this.layout();
  }

  startSession(mode) {
    this.mode = mode;
    this.rounds = getRounds(mode.script, mode.category);
    this.totalPairs = this.rounds.reduce((sum, round) => sum + round.pairs.length, 0);
    this.score = 0;
    this.roundIndex = 0;
    this.loadRound();
  }

  loadRound() {
    this.currentRound = this.rounds[this.roundIndex];
    this.cards = shuffle(this.currentRound.pairs.flatMap((pair) => [
      { pair, pairId: pair.kana, side: "kana", revealed: false, matched: false },
      { pair, pairId: pair.kana, side: "romaji", revealed: false, matched: false },
    ]));
    this.openCards = [];
    this.locked = false;
    this.roundFinished = false;
    this.focusIndex = 0;
    this.statusMessage = "翻開兩張卡片，找出假名與羅馬拼音的配對";
    this.render();
  }

  layout() {
    const width = this.scale.width;
    const margin = Math.max(17, Math.min(30, width * 0.05));
    this.headerText.setPosition(margin, 19).setFontSize(width < 430 ? "13px" : "16px");
    this.scoreText.setPosition(width - margin, 19).setFontSize(width < 430 ? "13px" : "16px");
    const progressWidth = Math.max(36, width - margin * 2);
    this.progressTrack.setPosition(margin, 49).setSize(progressWidth, 6);
    this.progressFill.setPosition(margin, 49).setSize(Math.max(1, progressWidth * (this.score / this.totalPairs)), 6);
    this.statusText.setPosition(width / 2, 68).setFontSize(width < 430 ? "12px" : "14px");
    this.renderCards();
    if (this.roundFinished) this.renderRoundOverlay();
  }

  render() {
    this.headerText.setText("第 " + (this.roundIndex + 1) + "/" + this.rounds.length + " 回合・" + this.currentRound.label);
    this.scoreText.setText("分數 " + this.score + " / " + this.totalPairs);
    this.statusText.setText(this.statusMessage);
    this.layout();
  }

  clearCardVisuals() {
    for (const visual of this.cardVisuals) {
      visual.background.destroy();
      visual.label.destroy();
    }
    this.cardVisuals = [];
  }

  clearOverlay() {
    for (const object of this.overlayObjects) object.destroy();
    this.overlayObjects = [];
  }

  renderCards() {
    if (!this.cards) return;
    this.clearCardVisuals();
    this.clearOverlay();

    const width = this.scale.width;
    const height = this.scale.height;
    const columns = Math.min(4, this.cards.length);
    const rows = Math.ceil(this.cards.length / columns);
    const gap = Math.max(8, Math.min(14, width * 0.018));
    const margin = Math.max(17, Math.min(30, width * 0.05));
    const boardTop = 111;
    const boardBottom = height - 18;
    const usableWidth = width - margin * 2;
    const cardWidth = Math.min(172, (usableWidth - gap * (columns - 1)) / columns);
    const cardHeight = Math.min(126, (boardBottom - boardTop - gap * (rows - 1)) / rows);
    const rowWidth = columns * cardWidth + (columns - 1) * gap;
    const startX = (width - rowWidth) / 2 + cardWidth / 2;
    const totalHeight = rows * cardHeight + (rows - 1) * gap;
    const startY = boardTop + Math.max(0, (boardBottom - boardTop - totalHeight) / 2) + cardHeight / 2;

    this.cards.forEach((card, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);
      const isVisible = card.revealed || card.matched;
      const fill = card.matched ? COLORS.tealLight : isVisible ? COLORS.white : COLORS.ink;
      const stroke = card.matched ? COLORS.teal : index === this.focusIndex ? COLORS.gold : isVisible ? COLORS.line : COLORS.ink;
      const background = this.add.rectangle(x, y, cardWidth, cardHeight, fill)
        .setStrokeStyle(index === this.focusIndex ? 3 : 2, stroke)
        .setDepth(1)
        .setInteractive({ useHandCursor: true });
      background.on("pointerdown", () => {
        this.focusIndex = index;
        this.flipCard(index);
      });
      const face = isVisible ? (card.side === "kana" ? card.pair.kana : card.pair.romaji) : "？";
      const labelSize = isVisible
        ? (card.side === "kana" ? Math.min(40, cardWidth * 0.5) : Math.min(25, cardWidth * 0.34))
        : Math.min(34, cardWidth * 0.43);
      const label = this.add.text(x, y, face, {
        fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif',
        fontSize: labelSize + "px",
        fontStyle: "bold",
        color: card.matched ? "#087e77" : isVisible ? "#17233b" : "#fffefa",
        align: "center",
      }).setOrigin(0.5).setDepth(2);
      this.cardVisuals.push({ background, label });
    });
  }

  handleKeyboard(event) {
    if (!this.cards?.length) return;
    const key = event.key.toLowerCase();
    const columns = Math.min(4, this.cards.length);
    let nextIndex = this.focusIndex;
    if (key === "arrowleft" || key === "a") nextIndex -= 1;
    else if (key === "arrowright" || key === "d") nextIndex += 1;
    else if (key === "arrowup" || key === "w") nextIndex -= columns;
    else if (key === "arrowdown" || key === "s") nextIndex += columns;
    else if (key === "enter" || key === " ") {
      event.preventDefault();
      this.flipCard(this.focusIndex);
      return;
    } else {
      return;
    }
    event.preventDefault();
    this.focusIndex = Phaser.Math.Clamp(nextIndex, 0, this.cards.length - 1);
    this.renderCards();
    if (this.roundFinished) this.renderRoundOverlay();
  }

  flipCard(index) {
    if (this.locked || this.roundFinished) return;
    const card = this.cards[index];
    if (!card || card.matched || card.revealed) return;
    card.revealed = true;
    this.openCards.push(card);
    this.statusMessage = card.side === "kana"
      ? "記住這張假名，尋找對應的羅馬拼音"
      : "記住這個拼音，尋找對應的假名";
    this.render();
    if (this.openCards.length < 2) return;

    const [first, second] = this.openCards;
    if (first.pairId === second.pairId && first.side !== second.side) {
      first.matched = true;
      second.matched = true;
      this.openCards = [];
      this.score += 1;
      this.statusMessage = "配對成功！+1 分";
      this.render();
      if (this.cards.every((item) => item.matched)) {
        this.time.delayedCall(500, () => this.finishRound());
      } else {
        this.time.delayedCall(700, () => {
          if (!this.roundFinished) {
            this.statusMessage = "繼續回想，找出下一組配對";
            this.render();
          }
        });
      }
      return;
    }

    this.locked = true;
    this.statusMessage = "這兩張不相同，再記住位置試試看";
    this.render();
    this.time.delayedCall(850, () => {
      first.revealed = false;
      second.revealed = false;
      this.openCards = [];
      this.locked = false;
      this.statusMessage = "再試一次，配對成功就得 1 分";
      this.render();
    });
  }

  finishRound() {
    this.roundFinished = true;
    this.statusMessage = "回合完成";
    this.render();
  }

  renderRoundOverlay() {
    this.clearOverlay();
    const width = this.scale.width;
    const height = this.scale.height;
    const lastRound = this.roundIndex === this.rounds.length - 1;
    const panelWidth = Math.min(width - 36, 430);
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, 218, COLORS.paper, 0.98)
      .setStrokeStyle(2, COLORS.line).setDepth(10);
    const title = this.add.text(width / 2, height / 2 - 57, lastRound ? "全部配對完成！" : "本回合完成！", {
      fontFamily: "Arial, sans-serif", fontSize: width < 430 ? "22px" : "27px",
      fontStyle: "bold", color: "#17233b", align: "center",
    }).setOrigin(0.5).setDepth(11);
    const summary = this.add.text(width / 2, height / 2 - 19, "目前得分 " + this.score + " / " + this.totalPairs + " 分", {
      fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#727b89", align: "center",
    }).setOrigin(0.5).setDepth(11);
    const buttonLabel = lastRound ? "再玩一次" : "下一回合 →";
    const button = this.add.rectangle(width / 2, height / 2 + 43, Math.min(230, panelWidth - 36), 48, COLORS.teal)
      .setStrokeStyle(1, COLORS.teal).setDepth(11).setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(width / 2, height / 2 + 43, buttonLabel, {
      fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#ffffff", align: "center",
    }).setOrigin(0.5).setDepth(12);
    button.on("pointerdown", () => this.advanceRound());
    this.overlayObjects.push(panel, title, summary, button, buttonText);
  }

  advanceRound() {
    if (!this.roundFinished) return;
    if (this.roundIndex === this.rounds.length - 1) this.startSession(this.mode);
    else {
      this.roundIndex += 1;
      this.loadRound();
    }
    this.layout();
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#fffefa",
  scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 620, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, roundPixels: true },
  input: { activePointers: 2, keyboard: { capture: ["UP", "DOWN", "LEFT", "RIGHT", "SPACE", "ENTER"] } },
  scene: [MemoryScene],
});

const selectedMode = { script: "hiragana", category: "all" };
function setMode(key, value) {
  selectedMode[key] = value;
  const selector = key === "script" ? "[data-script]" : "[data-category]";
  const dataKey = key === "script" ? "script" : "category";
  document.querySelectorAll(selector).forEach((button) => {
    const selected = button.dataset[dataKey] === value;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  game.events.emit("mode-change", { ...selectedMode });
}
document.querySelectorAll("[data-script]").forEach((button) => {
  button.addEventListener("click", () => setMode("script", button.dataset.script));
});
document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => setMode("category", button.dataset.category));
});
window.addEventListener("beforeunload", () => game.destroy(true));
