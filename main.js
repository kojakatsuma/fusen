const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron')
const fs = require('fs');
const { POST_DIR, TRASH_DIR } = require("./constant");
const { getSetting, toggleMarkdown } = require("./setting");
const path = require('path')

let wins = []

const menu = new Menu()
menu.append(new MenuItem(
  {
    submenu: [
      {
        label: "終了する",
        accelerator: "Cmd+Q",
        click: () => app.quit()
      }
    ]
  }
));

menu.append(new MenuItem({
  label: "編集",
  submenu: [
    {
      label: "新しい付箋",
      accelerator: 'Cmd+N',
      click: (_, target) => {
        if (!target) {
          return;
        }
        const files = fs.readdirSync(POST_DIR)
        const filepath = `${POST_DIR}/${files.length}.txt`
        fs.writeFileSync(filepath, "")
        const [x] = target.getPosition()
        const win = createWindow(`${files.length}.txt`, x + 200)
        wins.push(win)
      }
    },
    {
      label: "付箋を捨てる",
      accelerator: 'Cmd+W',
      click: (_, target) => {
        if (target) target.close()
      }
    },
    {
      label: "付箋を選択",
      accelerator: "Cmd+D",
      click: (_, target) => {
        const selectIndex = wins.findIndex(win => win.id === target.id)
        if ((wins.length - 1) > selectIndex) {
          wins[selectIndex + 1].focus()
        } else {
          wins[0].focus()
        }
      }
    },
    {
      label: "全選択",
      accelerator: "CmdOrCtrl+A", selector: "selectAll:"
    },
    { label: "カット", accelerator: "CmdOrCtrl+X", selector: "cut:" },
    { label: "コピー", accelerator: "CmdOrCtrl+C", selector: "copy:" },
    { label: "貼り付け", accelerator: "CmdOrCtrl+V", selector: "paste:" },
  ]
}))

menu.append(new MenuItem({
  label: "設定",
  submenu: [
    {
      label: "文字を大きくする",
      accelerator: "Cmd+;",
      click: () => {
        const setting = JSON.parse(fs.readFileSync(`${__dirname}/setting.json`, 'utf-8'))
        wins.forEach(win => win.webContents.send('change-fontsize', { fontSize: setting.fontSize + 1 }))
        fs.writeFileSync(`${__dirname}/setting.json`, JSON.stringify({ ...setting, fontSize: setting.fontSize + 1 }, null, 2))
      }
    },
    {
      label: "文字を小さくする",
      accelerator: "Cmd+:",
      click: () => {
        const setting = JSON.parse(fs.readFileSync(`${__dirname}/setting.json`, 'utf-8'))
        wins.forEach(win => win.webContents.send('change-fontsize', { fontSize: setting.fontSize - 1 }))
        fs.writeFileSync(`${__dirname}/setting.json`, JSON.stringify({ ...setting, fontSize: setting.fontSize - 1 }, null, 2))
      }
    },
    {
      label: "makdownを変換する",
      accelerator: "CmdOrCtrl+M",
      click: (_, target) => {
        const setting = toggleMarkdown(target.id)
        target.webContents.send("toggle-markdown", setting.markdown)
      }
    },
  ]
}))

Menu.setApplicationMenu(menu)

function createWindow(file, x) {
  const win = new BrowserWindow({
    titleBarStyle: "hidden",
    width: 200,
    height: 200,
    x: x,
    y: 0,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  win.webContents.addListener('did-finish-load', () => {
    if (win.isDestroyed()) return;
    const originSetting = getSetting(win.id)
    win.webContents.send('load-post', {
      filepath: `${POST_DIR}/${file}`,
      content: fs.readFileSync(`${POST_DIR}/${file}`, "utf-8"),
      setting: originSetting
    })
  })

  const trashfile = fs.readdirSync(TRASH_DIR)

  win.addListener("close", ({ sender }) => {
    const selectIndex = wins.findIndex(win => win.id === sender.id)
    wins = wins.filter(win => win.id !== sender.id)
    fs.renameSync(`${POST_DIR}/${file}`, `${TRASH_DIR}/${trashfile.length}.txt`)
    if (!selectIndex) {
      return;
    }
    if (wins.length >= selectIndex) {
      if (wins[selectIndex + 1]) {
        wins[selectIndex + 1].focus()
      }
    } else {
      wins[0].focus()
    }
  })

  win.focus()
  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" })
  }
  return win
}

function init() {
  if (!fs.existsSync(POST_DIR)) {
    fs.mkdirSync(POST_DIR)
  }
  if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR)
  }
  let files = fs.readdirSync(POST_DIR).filter(file => file !== ".DS_Store")
  if (!files.length) {
    fs.writeFileSync(`${POST_DIR}/${files.length}.txt`, "")
    files = fs.readdirSync(POST_DIR)
  }
  wins = wins.concat(files.map((file, i) => createWindow(file, i * 200)))
}

app.whenReady().then(init)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    init()
  }
})

app.on('before-quit', (e) => {
  e.preventDefault()
  app.exit()
})


ipcMain.handle('saveText', (_e, data) => {
  console.log(data.content)
  fs.writeFileSync(data.filepath, data.content);
})