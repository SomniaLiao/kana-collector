import Phaser from "phaser";
import "./style.css";
import { GameScene } from "./scenes/GameScene.js";
import { ResultScene } from "./scenes/ResultScene.js";
import { TitleScene } from "./scenes/TitleScene.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#17233b",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: 1280,
    height: 800,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    roundPixels: true,
  },
  input: {
    activePointers: 2,
    keyboard: { capture: ["UP", "DOWN", "LEFT", "RIGHT", "SPACE"] },
  },
  scene: [TitleScene, GameScene, ResultScene],
});

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("beforeunload", () => game.destroy(true));
