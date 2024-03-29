const path = require('path');
const os=require('os');

const {app,BrowserWindow,Menu,globalShortcut,ipcMain, shell,dialog}= require("electron");
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log =require('electron-log'); 
//Set dev enc
process.env.NODE_ENV='production';
const isDev = process.env.NODE_ENV!=='production' ? true:false;

//Check os
const isWin = process.platform =='win32'?true:false

let mainWindow
let aboutWindow
let destin
function createMainWindow(){
     mainWindow = new BrowserWindow({
        title:"ImageShrink",
        width:500,
        height:600,
        icon: './assets/icons/Icon_256x256.png',
        resizable:isDev?true:false,
        webPreferences:{
          nodeIntegration:true,
        }
    })
    mainWindow.loadFile('app/index.html');
}

function createAboutWindow(){
  aboutWindow = new BrowserWindow({
     title:"About ImageShrink",
     width:300,
     height:300,
     icon: './assets/icons/Icon_256x256.png',
     resizable:false
 })
 aboutWindow.loadFile('app/about.html');
}

app.on('ready',()=>{
    createMainWindow()
    const mainMenu=Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu);
    globalShortcut.register('CmdOrCtrl+R',()=> mainWindow.reload())
    globalShortcut.register('Ctrl+Shift+I',()=> mainWindow.toggleDevTools())
    mainWindow.on('ready',()=>mainWindow=null)
});

ipcMain.on('image:minimize',(e,options)=>{
  
    options.dest=destin;
    shrinkImage(options)
        
  })

ipcMain.on("path:select",(e)=>{

    dialog.showOpenDialog({
      properties: ["openDirectory","openFile"]
    }).then(result=>{
      
      
      destin=slash(result.filePaths[0])
      mainWindow.webContents.send("path:done",slash(result.filePaths[0]))
    }).catch(e=>{
      log.info(e)
    })
 

})

async function shrinkImage({imgPath,quality,dest}){
 if(dest!=undefined){
  try {
    const pngQuality=quality/100;
    const files= await imagemin([slash(imgPath)],{
      destination: dest,
      plugins:[
        imageminMozjpeg({quality}),
        imageminPngquant({
          quality:[pngQuality,pngQuality]
        })
      ]
    })
   
    // log.info(files)
    shell.openPath(dest)
    mainWindow.webContents.send("image:done")
  } catch (error) {
    log.info(error)
  }
 }else{
  mainWindow.webContents.send("path:none")
  
 }

}
const menu =[
    
        {role:"fileMenu"},
        {
          label:"Help",
          submenu:[
            {
              label:"About",
              click: createAboutWindow,
            }
          ]
        },
        ...(isDev?[
          {
            label:"Developer",
            submenu:[
              {role:'reload'},
              {role:'forcereload'},
              {type:'separator'},
              {role:'toggleDevTools'},
            ]
            
          }
        ]:[]) 
]

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