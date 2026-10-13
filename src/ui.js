export const COLORS = {
  ink: 0x17233b,
  paper: 0xf4f0e7,
  white: 0xfffdf8,
  coral: 0xe87756,
  coralDark: 0xc95b43,
  teal: 0x2f887f,
  tealLight: 0xdcefe9,
  gold: 0xf2bd62,
  muted: 0x6b7483,
  line: 0xd7d1c4,
  red: 0xb94b4b,
  redLight: 0xf6e2de,
};

export const FONT_STACK = '"Noto Sans TC", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif';

export function makeText(scene, x, y, text, style = {}) {
  return scene.add.text(x, y, text, {
    fontFamily: FONT_STACK,
    color: `#${COLORS.ink.toString(16).padStart(6, "0")}`,
    fontSize: "18px",
    ...style,
  });
}

export function makeButton(scene, { x, y, width, height, label, onClick, fill = COLORS.coral, textColor = COLORS.white, fontSize = 20 }) {
  const background = scene.add.rectangle(x, y, width, height, fill, 1)
    .setStrokeStyle(2, fill)
    .setInteractive({ useHandCursor: true });
  const text = makeText(scene, x, y, label, {
    fontSize: `${fontSize}px`,
    color: `#${textColor.toString(16).padStart(6, "0")}`,
    fontStyle: "bold",
  }).setOrigin(0.5);

  background.on("pointerover", () => background.setFillStyle(fill === COLORS.coral ? COLORS.coralDark : COLORS.teal, 1));
  background.on("pointerout", () => background.setFillStyle(fill, 1));
  background.on("pointerdown", onClick);

  return {
    background,
    text,
    setLayout(nextX, nextY, nextWidth, nextHeight, nextFontSize = fontSize) {
      background.setPosition(nextX, nextY).setSize(nextWidth, nextHeight);
      text.setPosition(nextX, nextY).setFontSize(`${nextFontSize}px`);
    },
  };
}

export function isTouchDevice() {
  return Boolean(window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
}
