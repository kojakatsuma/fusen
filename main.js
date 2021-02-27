const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const fs = require('fs')

let wins = []

const menu = new Menu()
menu.append(new MenuItem({
  label: "Menu",
  submenu: [
    {
      label: "新しい付箋",
      accelerator: 'Cmd+N',
      click: () => {
        const files = fs.readdirSync(`${__dirname}/posts`)
        const filepath = `${__dirname}/posts/${files.length}.txt`
        fs.writeFileSync(filepath, "")
        wins.push(createWindow(`${files.length}.txt`, files.length))
      }
    },
    {
      label: "付箋を捨てる",
      accelerator: 'Cmd+W',
      click: () => {
        wins[wins.length - 1].close()
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
      filepath: `${POST_DIR}/${file}`, content: fs.readFileSync(`${POST_DIR}/${file}`, "utf-8")
    })
  })
  const trashfile = fs.readdirSync(TRASH_DIR)
  win.addListener('close', () => { fs.renameSync(`${POST_DIR}/${file}`, `${TRASH_DIR}/${trashfile.length}.txt`) })
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


