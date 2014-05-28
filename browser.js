var app = require('app')
  , Menu = require('menu')
  , MenuItem = require('menu-item')
  , ipc = require('ipc')
  , MainMenu = require('./main_menu')
  , BrowserWindow = require('browser-window')  // Module to create native browser window
  //, Writer = require('./writer')
  , dialog = require('dialog');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
  //, writer = new Writer();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('open-file', function(filePath) {
  writer.openFile(filePath);
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 700});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Build window menu
  var mainMenu = new MainMenu(mainWindow)
    , confirmToClose = false;

  ipc.on('init-new-file', function() {
    mainMenu.enableSave();
  });

  ipc.on('has-been-modified', function(event, value) {
    confirmToClose = value;
  });

  mainWindow.on('close', function(event) {
    if (confirmToClose) event.preventDefault();

    var currentWindow = mainWindow
      , messageBoxOptions = { type: "warning",
                              buttons: ['Save', 'Cancel', 'Quit'],
                              message: "Are you sure you want to quit?" };

    dialog.showMessageBox(messageBoxOptions, function(res) {
      if (res == 2) {
        confirmToClose = false;
        mainWindow.close();
      }
    });
  });

  mainWindow.on('closed', function(event) {
    mainWindow = null;
  });
});
