import { Menu, nativeImage, Tray } from "electron";

const icon =
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB0SURBVDhPY4iOefSfEsyALkAqHp4GvP5//j828O3/TAy1+Aw4/5qAGEkGPP+/9cX///9ffPxfQ54B2MQIGYAOsGjGbwBUw0yoaS+2PsfQTJQBCBf9+r+1Bl0tUQY8+l+z9RdObxBlADwWQMKzCBpAGqbYAAAd1syGTMetYAAAAABJRU5ErkJggg==";

export function createTray(actions: {
  showMain: () => void;
  showSearch: () => void;
  showCreate: () => void;
  quit: () => void;
}) {
  const tray = new Tray(
    nativeImage.createFromDataURL(`data:image/png;base64,${icon}`),
  );
  tray.setToolTip("Remember Anything");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open Remember Anything", click: actions.showMain },
      { type: "separator" },
      {
        label: "Quick Search",
        click: actions.showSearch,
      },
      {
        label: "Quick Create",
        click: actions.showCreate,
      },
      { type: "separator" },
      { label: "Quit", click: actions.quit },
    ]),
  );
  tray.on("click", actions.showMain);
  return tray;
}
