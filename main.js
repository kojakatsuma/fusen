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
        const win = new BrowserWindow({
          width: 200,
          height: 200,
          x: files.length * 200,
          y: 0,
          webPreferences: {
            nodeIntegration: true
          }
        })
        win.loadFile('index.html')
        win.webContents.addListener('did-finish-load', () => {
          win.webContents.send('load-post', { filepath, content: "" })
        })
      }
    }
  ]
}))

Menu.setApplicationMenu(menu)

function createWindow() {
  let files = fs.readdirSync(`${__dirname}/posts`)
  if (!files.length) {
    fs.writeFileSync(`${__dirname}/posts/${files.length}.txt`, "")
    files = fs.readdirSync(`${__dirname}/posts`)
  }

  files.forEach((file, i) => {
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
        filepath: `${__dirname}/posts/${file}`, content: fs.readFileSync(`${__dirname}/posts/${file}`, 'utf-8') })
    })
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})