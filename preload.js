const { contextBridge, ipcRenderer } = require('electron')
const micromark = require('micromark')

let filepath = ""

contextBridge.exposeInMainWorld('myapi', {
    desktop: true,
    saveText: (content) => ipcRenderer.invoke('saveText', { content, filepath })
})

ipcRenderer.on('load-post', (_e, m) => {
    const textarea = document.getElementById("post");
    textarea.value = m.content
    filepath = m.filepath
    textarea.style.fontSize = `${m.setting.fontSize}px`;
    console.log(m.setting)
    toggleMarkdown(m.setting.markdown)
});

ipcRenderer.on('change-fontsize', (_e, setting) => {
    const textarea = document.getElementById("post");
    textarea.style.fontSize = `${setting.fontSize}px`
});

ipcRenderer.on('toggle-markdown', (_e, markdown) => {
    toggleMarkdown(markdown)
})

const toggleMarkdown = (markdown) => {
    const textarea = document.getElementById("post");
    if (markdown) {
        textarea.hidden = true
        const text = textarea.value
        document.getElementById('markdown-preview').innerHTML = micromark(text)
        return;
    }
    textarea.hidden = false
    document.getElementById('markdown-preview').innerHTML = null
}
