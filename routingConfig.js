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
      }else{
        document.querySelector(`input[name="hotkey-`+action+`"]`).value = "";
      }
    }
  })();
}



ipcRenderer.on('load', function(event, param) {
  input = param.input;
  output = param.output;
  loadDataFromStore();
  document.querySelector(`span[id="routingName"]`).innerHTML = input + " → " + output;
});

ipcRenderer.on('close', function(event, param) {
  let data = {
    turnOn: {},
    turnOff: {},
    toggle: {}
  }
  for(const action in data){
    let hotkey = document.querySelector(`input[name="hotkey-`+action+`"]`).value
    data[action]['hotkey'] = hotkey;
  }
  ipcRenderer.send('routing-save', {input: input, output: output, data: data});
});
