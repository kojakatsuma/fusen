const fs = require('fs');


const getSetting = (windowId) => {
  const setting = JSON.parse(fs.readFileSync(`${__dirname}/setting.json`, 'utf-8'));
  return { ...setting["all"], ...setting[windowId] };
};

const setSetting = (windowId, payload = {}) => {
  const setting = JSON.parse(fs.readFileSync(`${__dirname}/setting.json`, 'utf-8'));
  setting[windowId] = { ...setting[windowId], ...payload };
  fs.writeFileSync(`${__dirname}/setting.json`, JSON.stringify(setting, null, 2));
  return { ...setting, ...setting[windowId] };
};

const toggleMarkdown = (windowId) => {
  const setting = getSetting(windowId)
  const markdown = !setting["markdown"]
  return setSetting(windowId, { markdown })
}


module.exports = { getSetting, setSetting, toggleMarkdown }

