const { app } = require('electron');

const POST_DIR = app.isPackaged ? `${process.env.HOME}/.posts` : `${process.env.HOME}/.posts-dev`;
const TRASH_DIR = app.isPackaged ? `${process.env.HOME}/.trash` : `${process.env.HOME}/.trash-dev`;

module.exports = { POST_DIR, TRASH_DIR }
