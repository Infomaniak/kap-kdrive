// eslint-disable-next-line import/no-unresolved
const electron = require('electron');
// eslint-disable-next-line import/no-unresolved
const { protocol } = require('electron');

const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

const login = (context) => new Promise((resolve, reject) => {
  const credentials = [];

  const authWindow = new BrowserWindow({
    'use-content-size': true,
    alwaysOnTop: true,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  const extraHeaders = {
    userAgent: 'KapScreenRecorder',
    extraHeaders: 'OCS-APIREQUEST: true\n ACCEPT_LANGUAGE: "en-US"',
  };
  authWindow.loadURL('https://connect.drive.infomaniak.com/index.php/login/flow', extraHeaders);

  /**
   * Reject upload of exported file when authentication was not completed
   */
  authWindow.on('closed', () => {
    if (credentials.length === 0) {
      reject(new Error('canceled'));
    }
  });

  /**
   * Register nc:// protocol
   */
  protocol.registerStringProtocol('nc', (request) => {
    const url = request.url.substr(5);
    const elements = url.split('&');

    elements.forEach((item) => {
      const key = item.split(/:(.*)/)[0];
      const value = item.split(/:(.*)/)[1];
      credentials[key] = value;
    });

    context.config.set('url', credentials['login/server']);
    context.config.set('username', decodeURIComponent(credentials.user));
    context.config.set('password', credentials.password);

    /**
     * Resolve promise and destroy BrowserWindow
     */
    resolve();
    authWindow.destroy();
  });
});

module.exports = login;
