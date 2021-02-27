const { app, BrowserWindow, Menu, MenuItem } = require('electron')
const fs = require('fs')

const menu = new Menu()
menu.append(new MenuItem({
  label: "Menu",
  submenu: [
    {
      label: "file",
      accelerator: 'Cmd+N',
      click: () => {
        const files = fs.readdirSync(`${__dirname}/posts`)
        const filepath = `${__dirname}/posts/${files.length}.txt`
        fs.writeFileSync(filepath, "")
        createWindow(`${files.length}.txt`, files.length)
      }
    }
  ]
}))
Menu.setApplicationMenu(menu)

const POST_DIR = `${__dirname}/posts`

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
}

function init() {
  let files = fs.readdirSync(`${__dirname}/posts`)
  if (!files.length) {
    fs.writeFileSync(`${__dirname}/posts/${files.length}.txt`, "")
    files = fs.readdirSync(`${__dirname}/posts`)
  }
  files.forEach(createWindow)
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


