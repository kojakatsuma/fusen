const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const fs = require('fs')

if (!app.isPackaged) {
  require('electron-reload')(__dirname);
}

let wins = []
let selectWin = null

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
      click: () => {
        const files = fs.readdirSync(`${__dirname}/posts`)
        const filepath = `${__dirname}/posts/${files.length}.txt`
        fs.writeFileSync(filepath, "")
        wins.push(createWindow(`${files.length}.txt`, wins.length))
      }
    },
    {
      label: "付箋を捨てる",
      accelerator: 'Cmd+W',
      click: () => {
        selectWin.close()
      }
    },
    {
      label: "付箋を選択",
      accelerator: "Cmd+D",
      click: () => {
        const selectIndex = wins.findIndex(win => win.id === selectWin.id)
        if ((wins.length - 1) > selectIndex) {
          wins[selectIndex + 1].focus()
        } else {
          wins[0].focus()
        }
      }
    },
    {
      label: "全選択",
      accelerator: "Cmd+A",
      click: () => selectWin.webContents.send('all-select', {})
    }
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
    }
  ]
}))

Menu.setApplicationMenu(menu)

const POST_DIR = `${__dirname}/posts`

const TRASH_DIR = `${__dirname}/trash`

function createWindow(file, i) {
  const win = new BrowserWindow({
    width: 200,
    height: 200,
    x: i * 200,
    y: 0,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('index.html')
  win.webContents.addListener('did-finish-load', () => {
    win.webContents.send('load-post', {
      filepath: `${POST_DIR}/${file}`,
      content: fs.readFileSync(`${POST_DIR}/${file}`, "utf-8"),
      setting: JSON.parse(fs.readFileSync(`${__dirname}/setting.json`, 'utf-8'))
    })
  })

  const trashfile = fs.readdirSync(TRASH_DIR)
  win.addListener("closed", () => {
    wins = wins.filter(win => !win.isDestroyed())
    fs.renameSync(`${POST_DIR}/${file}`, `${TRASH_DIR}/${trashfile.length}.txt`)
  })

  win.addListener('focus', ({ sender }) => {
    selectWin = sender
  })
  win.focus()
  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" })
  }
  return win
}

function init() {
  let files = fs.readdirSync(POST_DIR)
  if (!files.length) {
    fs.writeFileSync(`${POST_DIR}/${files.length}.txt`, "")
    files = fs.readdirSync(POST_DIR)
  }
  wins = wins.concat(files.map(createWindow))
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


