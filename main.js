const path = require('path');
const { spawn } = require('cross-spawn');
var spawn_os = require("child_process").spawn,child;
var exec = require('child_process').exec;
const os = require('os');
const sound = require('sound-play');
const taskkill = require('taskkill');
var freePort = require("find-free-port");
const Store = require('electron-store');
const WebSocket = require('ws');

const store = new Store();

const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  ipcMain,
  dialog
 } = require('electron')

var routingStates = {};

var state = false;

function startWebsocket(port){
  var server = new WebSocket.Server({port: port});
  server.on('connection', (socket) => {
    console.log("GoXLR Plugin connected");
    _socket = socket;
  });

  let registrationParams = [
      '-port', port,
      '-pluginUUID', 'com.tchelicon.goxlr.routingtable',
      '-registerEvent','registerEvent',
      '-info', '{}'
  ];

  // TBD: Add error handling if something goes wrong
  let pluginExecutable = store.get('GoXlrPluginExecutable');
  let pluginExecutableFile = path.basename(pluginExecutable);
  let pluginexecutablePath = path.dirname(pluginExecutable);
  const plugin = spawn(pluginExecutableFile, registrationParams, { cwd: pluginexecutablePath, stdio: 'inherit' });
}

let actionTranslation = {
  'turnOn': 'Turn On',
  'turnOff': 'Turn Off',
  'toggle': 'Toggle'
}

function registerHotkeys(){
  globalShortcut.unregisterAll();
  let routingConfig = store.get('GoXlrRouting');
  for(const input in routingConfig){
    for(const output in routingConfig[input]){
      for(const action in routingConfig[input][output]){
        let hotkey = routingConfig[input][output][action]['hotkey'];
        if(hotkey !== undefined && hotkey != ''){
          console.log(input+ " " + output + " " + action);
          console.log(hotkey);
          const ret = globalShortcut.register(hotkey, () => {
            let wsAction = actionTranslation[action];

            if(action == 'toggle'){
              if(routingStates[input] === undefined){
                  routingStates[input] = {};
              }
              if(routingStates[input][output] === undefined){
                routingStates[input][output] = "turnOn";
              }
              if(routingStates[input][output] == "turnOn"){
                routingStates[input][output] = "turnOff";
              }else{
                routingStates[input][output] = "turnOn";
              }
              wsAction = actionTranslation[routingStates[input][output]];
            }

            var json = {"action":"com.tchelicon.goxlr.routingtable","context":"","device":"","event":"keyUp","payload":{"coordinates":{"column":0,"row":0},"isInMultiAction":false,"settings":{"RoutingAction":wsAction, "RoutingInput":input, "RoutingOutput":output}}};
            _socket.send(JSON.stringify(json));
            if(wsAction == "Turn On"){
              sound.play(path.join(__dirname, '/static/sound/enabled.mp3'));
            }
            if(wsAction == "Turn Off"){
              sound.play(path.join(__dirname, '/static/sound/disabled.mp3'));
            }
            state = true;
          });
          if (!ret) {
            console.log('registration failed')
          }
        }
      }
    }
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('Shift+F2'))
}


var obsClient;

function obsSceneChange(name){
  let routingTable = store.get('GoXlrRouting');
  for(const input in routingTable){
    for(const output in routingTable[input]){
      for(const action in routingTable[input][output]){
        let scenes = routingTable[input][output][action]["scenes"];
        if(scenes !== undefined){
          for(let i in scenes){
            if(scenes[i] == name){
              let wsAction = actionTranslation[action];
              var json = {"action":"com.tchelicon.goxlr.routingtable","context":"","device":"","event":"keyUp","payload":{"coordinates":{"column":0,"row":0},"isInMultiAction":false,"settings":{"RoutingAction":wsAction, "RoutingInput":input, "RoutingOutput":output}}};
              _socket.send(JSON.stringify(json));
            }
          }
        }
      }
    }
  }
}

function connectToObs(){
  let address = store.get('ObsWsAddress');
  let port = store.get('ObsWsPort');

  obsClient = new WebSocket('ws://'+address+':'+port);
  obsClient.on('open', function open(){
    console.log("OBS connected");
  });
  obsClient.on('message', function incoming(data){
    let json = JSON.parse(data);
    switch(json['update-type']){
      case 'SwitchScenes':
        obsSceneChange(json['scene-name']);
        break;
    }
    //console.log(data);
  });

}


function createWindow (){

  // Create main application window
  const win = new BrowserWindow({
    width: 1500,
    height: 600,
    //resizable: false,
    //show: false,
    icon: path.join(__dirname, '/icon.png'),
    webPreferences: {
      //preload: path.join(app.getAppPath(), 'preload.js')
      nodeIntegration: true
      //contextIsolation: false
    }
  })

  win.addListener('minimize', function(event) {
    event.preventDefault();
    win.hide();
    win.send('close');
  });
  win.setMenu(null);
  win.loadFile('index.html');
  win.openDevTools();


  // Create routing config window
  const routingConfigWin = new BrowserWindow({
    width: 1500,
    height: 600,
    resizable: false,
    show: false,
    icon: path.join(__dirname, '/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  routingConfigWin.addListener('minimize', function(event) {
    event.preventDefault();
    routingConfigWin.hide();
    routingConfigWin.send('close');
  });
  routingConfigWin.addListener('close', function(event) {
    event.preventDefault();
    routingConfigWin.hide();
    routingConfigWin.send('close');

  });
  routingConfigWin.setMenu(null);
  routingConfigWin.loadFile('routingConfig.html');
  routingConfigWin.openDevTools();


  // Create system icon and context menu
  tray = new Tray(path.join(__dirname, '/icon.png'));
  if(process.platform == 'win32') {
    tray.on('click', (event) => {
      tray.popUpContextMenu();
    });
  }
  const menu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click() { app.quit(); }
    },
    {
      label: 'Settings',
      click() { win.show(); }
    }
  ]);
  tray.setToolTip("Hello world!");
  tray.setContextMenu(menu);

  ipcMain.handle('getStoreValue', (event, key) => {
  	return store.get(key);
  });

  ipcMain.on('GoXlrPluginExecutableButton-pressed', (event) => {
    dialog.showOpenDialog({
      defaultPath: store.get('GoXlrPluginExecutable'),
      filters: [
        { name: 'Executable', extensions: ['exe'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    }).then(function(response){
      if(!response.cancled){
        store.set('GoXlrPluginExecutable', response.filePaths[0]);
        event.sender.send('GoXlrPluginExecutableButton-selected', response);
      }
    });
  });

  ipcMain.on('GoXlrExecutableButton-pressed', (event) => {
    dialog.showOpenDialog({
      defaultPath: store.get('GoXlrExecutable'),
      filters: [
        { name: 'Executable', extensions: ['exe'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    }).then(function(response){
      if(!response.cancled){
        store.set('GoXlrExecutable', response.filePaths[0]);
        event.sender.send('GoXlrExecutableButton-selected', response);
      }
    });
  });

  ipcMain.on('button-configureRouting', function(event, param){
    routingConfigWin.send('load', param);
    routingConfigWin.show();

  });

  ipcMain.on('routing-save', function(event, data){
    //TBD: change this, dirty stub
    if(data.data.turnOn.hotkey !== undefined){
      store.set('GoXlrRouting.'+data.input+'.'+data.output+'.turnOn.hotkey', data.data.turnOn.hotkey);
    }
    if(data.data.turnOff.hotkey !== undefined){
      store.set('GoXlrRouting.'+data.input+'.'+data.output+'.turnOff.hotkey', data.data.turnOff.hotkey);
    }
    if(data.data.toggle.hotkey !== undefined){
      store.set('GoXlrRouting.'+data.input+'.'+data.output+'.toggle.hotkey', data.data.toggle.hotkey);
    }
    win.send('routing-save');
    registerHotkeys();
  });
  ipcMain.on('config-save', function(event, data){
    store.set('GoXlrPluginExecutable', data.goXlrPluginExecutable);
    store.set('GoXlrExecutable', data.goXlrExecutable);
    store.set('GoXlrAutoRestart', data.goXlrAutoRestart);
    store.set('ObsWsAddress', data.obsWsAddress);
    store.set('ObsWsPort', data.obsWsPort);
  });

  if(store.get('GoXlrAutoRestart') === true){
    restartGoXLR();
  }

  connectToObs();



/*
  (async () => {
    try{
      child = spawn_os("powershell.exe",['C:\\Users\\Jan` Ecker\\Desktop\\Stream\\GoXLR-Electron-App\\HideGoXLR.ps1 -attempts 2 -sleep 2']);
      child.stdout.on("data",function(data){
          console.log("Powershell Data: " + data);
      });
      child.stderr.on("data",function(data){
          console.log("Powershell Errors: " + data);
      });
      child.on("exit",function(){
          console.log("Powershell Script finished");
      });
    }catch(error){
      console.log(error);
    }
  })();
*/
}



function restartGoXLR(){
  (async () => {
    try{
      await taskkill(["GoXLR App.exe"], {'force':true});
    }catch(error){
      console.log(error);
    }
    try{
      let goXlrExecutable = store.get('GoXlrExecutable');
      exec('"'+goXlrExecutable+'"', function(err, stdout, stderr){
        if(err){
          console.log(err);
        }
      });
    }catch(error){
      console.log(error);
    }
  })();
}

app.whenReady().then(() => {

  // temporary
  //store.set('GoXlrPluginPath', 'C:\\Users\\Jan Ecker\\Desktop\\plugin_test\\com.tchelicon.goxlr.streamDeckPlugin\\com.tchelicon.goxlr.sdPlugin');
  //store.set('GoXlrPluginExecutable', 'GoXLRStreamDeckPlugin.exe');


  //store.set('GoXlrRouting.Mic.Headphones.TurnOn.Shortcut', 'Shift+F2');


  createWindow();

  // Identify random free port used for the GoXLR plugin communication and start websocket server
  freePort(3000, function(err, port){
    if(!err){
      startWebsocket(port);
    }
  });

  registerHotkeys();
});

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
