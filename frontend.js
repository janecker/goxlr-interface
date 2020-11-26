'use strict'

const { ipcRenderer } = require('electron')


// create add todo window button
document.getElementById('GoXlrPluginExecutableButton').addEventListener('click', () => {
  ipcRenderer.send('GoXlrPluginExecutableButton-pressed');
});
document.getElementById('GoXlrExecutableButton').addEventListener('click', () => {
  ipcRenderer.send('GoXlrExecutableButton-pressed');
});

ipcRenderer.on('GoXlrPluginExecutableButton-selected', function(event, response) {
  document.querySelector(`input[name="GoXlrPluginExecutable"]`).value = response.filePaths[0];
});
ipcRenderer.on('GoXlrExecutableButton-selected', function(event, response) {
  document.querySelector(`input[name="GoXlrExecutable"]`).value = response.filePaths[0];
});

ipcRenderer.on('routing-save', function(event){
  updateButtonLabels();
});


let inputs = ['Mic', 'Chat', 'Music', 'Game', 'Console', 'Line In', 'System', 'Samples'];
let outputs = ['Headphones', 'Broadcast Mix', 'Line Out', 'Chat Mic', 'Sampler'];


let thead = document.querySelector("#routingTable");
let row = thead.insertRow();
row.appendChild(document.createElement("td"));
row.appendChild(document.createElement("td"));
let th = document.createElement("th");
th.appendChild(document.createTextNode("Inputs"));
th.colSpan=8;
th.classList.add("caption");
row.appendChild(th);

ipcRenderer.on('close', function(event, param) {
  let data = {
    goXlrPluginExecutable: document.querySelector(`input[name="GoXlrPluginExecutable"]`).value,
    goXlrExecutable: document.querySelector(`input[name="GoXlrExecutable"]`).value,
    goXlrAutoRestart: document.querySelector(`input[name="GoXlrAutoRestart"]`).checked,
    obsWsAddress: document.querySelector(`input[name="ObsWsAddress"]`).value,
    obsWsPort: document.querySelector(`input[name="ObsWsPort"]`).value,
  }
  ipcRenderer.send('config-save', data);
});

function updateButtonLabels(){
  (async() => {
    let routingTable = await ipcRenderer.invoke('getStoreValue', 'GoXlrRouting');

    for(const input in routingTable){
      for(const output in routingTable[input]){
        let nHotkeys = 0;
        let nEvents = 0;
        for(const action in routingTable[input][output]){
          if(routingTable[input][output][action]['hotkey'] !== undefined){
              nHotkeys++;
          }
        }
        let element = document.getElementById("routingbutton-"+btoa(output+"-"+input));
        element.innerHTML = '';
        if(nHotkeys > 0){
          let multiplicity = (nHotkeys != 1) ? 's' : '';
          element.appendChild(document.createTextNode(nHotkeys+ " Hotkey" + multiplicity ));
        }
      }
    }
  })();
}

function createRoutingTable(){
  row = thead.insertRow();
  row.appendChild(document.createElement("td"));
  row.appendChild(document.createElement("td"));
  for(let input in inputs){
    let th = document.createElement("th");
    let text = document.createTextNode(inputs[input]);
    th.appendChild(text);
    row.appendChild(th);
  }
  for(let i in outputs){
    let output = outputs[i];
    let row = thead.insertRow();
    if(i == 0){
      let th = document.createElement("th");
      let text = document.createTextNode("Outputs");
      th.appendChild(text);
      th.rowSpan=8;
      th.classList.add("caption");
      row.appendChild(th);
    }

    let th = document.createElement("th");
    let text = document.createTextNode(output);
    th.appendChild(text);
    row.appendChild(th);
    for(let j in inputs){
      let input = inputs[j]
      let td = document.createElement("td");
      td.classList.add("config");
      let btn = document.createElement("button");
      btn.id = "routingbutton-"+btoa(output+"-"+input);
      let span = document.createElement("span");
      td.appendChild(btn);
      row.appendChild(td);

      btn.addEventListener('click', () => {
        ipcRenderer.send('button-configureRouting', {input: input, output: output});
      });
    }
  }
  updateButtonLabels();
}


createRoutingTable();





(async() => {
  document.querySelector(`input[name="GoXlrPluginExecutable"]`).value = await ipcRenderer.invoke('getStoreValue', 'GoXlrPluginExecutable');
  document.querySelector(`input[name="GoXlrExecutable"]`).value = await ipcRenderer.invoke('getStoreValue', 'GoXlrExecutable');
  document.querySelector(`input[name="GoXlrAutoRestart"]`).checked = await ipcRenderer.invoke('getStoreValue', 'GoXlrAutoRestart');
  document.querySelector(`input[name="ObsWsAddress"]`).value = await ipcRenderer.invoke('getStoreValue', 'ObsWsAddress');
  document.querySelector(`input[name="ObsWsPort"]`).value = await ipcRenderer.invoke('getStoreValue', 'ObsWsPort');
  /*
  let routingTable = await ipcRenderer.invoke('getStoreValue', 'GoXlrRouting');

  for(const input in routingTable){
    for(const output in routingTable[input]){
      let nHotkeys = 0;
      let nEvents = 0;
      for(const action in routingTable[input][output]){
        if(routingTable[input][output][action]['hotkey'] !== undefined){
            //console.log(routingTable[input][output][action]);
            nHotkeys++;
        }
      }
      let elementId = 'hotkey-'+input+'-'+output;
      let element = document.getElementById(elementId);
      element.removeChild(element.firstChild);
      element.appendChild(document.createTextNode(nHotkeys));
    }
  }


  let inputs = ['mic'];
  let outputs = ['headphones'];

  inputs.forEach(input => {
    outputs.forEach(output => {
      document.getElementById('button-'+input+'-'+output).addEventListener('click', () => {
        ipcRenderer.send('button-configureRouting', {input: input, output: output});
      });
    });
  });
  */
})();
