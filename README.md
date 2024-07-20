GoXLR Interface
===============

This tool allows you to add hotkeys to change the routing table of your GoXLR. It uses the existing websocket interface created by the Elgato Streamdeck plug-in. In future it is planned to react to OBS scene change events, such that the routing table can be changed based on the currently selected scene.

This project is in a very early stage of development. Use at own risk.

**This project is not and I am not related to TC-Helicon or the GoXLR product at all.**


Disclaimer
-------
GoXLR Interface is in an very early stage of development, and I am pretty unexperienced with JS and Node. I am very happy about all feedback, suggestions and pull requests that may improve this application.

How To
--------
The original GoXLR application provides an plug-in that is intended to connect an Elgato Stream Deck to the GoXLR, allow e.g. routing changes. This plug-in connects to the Elgato software using a websocket. This application provides a similar websocket server for the plug-in to connect to. Using this connection the GoXLR Interface is possible to change the routing of your GoXLR.

##### Step 1 - Install Node:
The GoXLR Interface is developed using Node. [Download](https://nodejs.org/en/download/) and install node on your system.

##### Step 2 - Extract the GoXLR plug-in:
Locate your GoXLR installation (default: C:\Program Files (x86)\TC-Helicon\GoXLR), and find the file "com.tchelicon.goxlr.streamDeckplug-in". Unzip this file (e.g. by just renaming it to .zip) and you should find the executable named "GoXLRStreamDeckplug-in.exe".

##### Step 3 - Run and Configure GoXLR Interface:
Clone this project to your machine, open a command prompt and navigate to the GoXLR Interface directory. Install the dependencies by running "npm install". Run the application by executing "npm run start". In the application you now need to now specify the location of the GoXLR plug-in executable that you extracted in step 2. Also configure the location of the GoXLR executable. It is also recommended to check the "Auto restart GoXLR" check box. This will cause a restart of your GoXLR application whenever you open the GoXLR Interface app. This is actually required to allow the Stream Deck plug-in to connect to the GoXLR application. If you do not check the check box you have to restart the GoXLR app yourself.

##### Step 4 - Configure Hotkeys:
Open the GoXLR Interface application, select a routing point by clicking in the table. Type the keycode in the event you want to trigger. For reference check the [acellerator docs](https://www.electronjs.org/docs/api/accelerator). Examples are:
* Shift+F2
* Ctrl+2




License
-------
This project is licensed under the [MIT](https://opensource.org/licenses/MIT) license.


Attribution
-----------
This project uses a lot of work done by others. Following you can find a list of all used projects and their licenses.
- "[The WoodenBeaver sound theme](https://github.com/madsrh/WoodenBeaver)" by [MadsRH](https://github.com/madsrh) is licensed under [CC BY SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- "[Vaadin Icons](https://github.com/vaadin/vaadin-icons)" by [Vaadin](https://github.com/vaadin) is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- "[Node.js](https://nodejs.org/en/)" by [OpenJS Foundation](https://openjsf.org/) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[Electron](https://www.electronjs.org/) by [OpenJS Foundation](https://openjsf.org/) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[find-free-port](https://github.com/mhzed/find-free-port)" by [M H Zed](https://github.com/mhzed) is licensed under [ISC](https://opensource.org/licenses/ISC)
- "[cross-spawn](https://github.com/moxystudio/node-cross-spawn)" by [MOXY](https://github.com/moxystudio) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[electron-store](https://github.com/sindresorhus/electron-store)" by [Sindre Sorhus](https://github.com/sindresorhus) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[sound-play](https://github.com/nomadhoc/sound-play)" by [nomadhoc](https://github.com/nomadhoc) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[taskkill](https://github.com/sindresorhus/taskkill)" by [Sindre Sorhus](https://github.com/sindresorhus) is licensed under [MIT](https://opensource.org/licenses/MIT)
- "[ws](https://github.com/websockets/ws)" by [WebSockets](https://github.com/websockets) is licensed under [MIT](https://opensource.org/licenses/MIT)
