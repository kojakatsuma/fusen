const textarea = document.getElementById("post")

const { ipcRenderer } = require('electron')
const micromark = require('micromark')
const fs = require('fs');

let filepath = ""


ipcRenderer.on('load-post', (_e, m) => {
  textarea.value = m.content
  filepath = m.filepath
  textarea.style.fontSize = `${m.setting.fontSize}px`
})

ipcRenderer.on('change-fontsize', (_e, setting) => {
  textarea.style.fontSize = `${setting.fontSize}px`
})

ipcRenderer.on('toggle-markdown', (_e, markdown) => {
  if(markdown) {
    textarea.hidden = true
    const text = textarea.value
    document.getElementById('markdown-preview').innerHTML = micromark(text)
    return;
  }
  textarea.hidden = false
  document.getElementById('markdown-preview').innerHTML = null
})

textarea.addEventListener('change', (e) => {
  const value = e.target.value
  fs.writeFileSync(filepath, value)
})

