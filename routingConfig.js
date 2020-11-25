'use strict'

const { ipcRenderer } = require('electron')

var input;
var output;



function loadDataFromStore(){
  (async() => {
    let actions = await ipcRenderer.invoke('getStoreValue', 'GoXlrRouting.'+input+'.'+output);
    for(const action in actions){
      if(actions[action]['hotkey'] !== undefined){
        document.querySelector(`input[name="hotkey-`+action+`"]`).value = actions[action]['hotkey'];
      }
    }
  })();
}



ipcRenderer.on('load', function(event, param) {
  input = param.input;
  output = param.output;
  loadDataFromStore();
});

ipcRenderer.on('close', function(event, param) {
  let data = {
    turnOn: {},
    turnOff: {},
    toggle: {}
  }
  for(const action in data){
    let hotkey = document.querySelector(`input[name="hotkey-`+action+`"]`).value
    if(hotkey != ''){
      data[action]['hotkey'] = hotkey;
    }
  }
  ipcRenderer.send('routing-save', {input: input, output: output, data: data});
});
