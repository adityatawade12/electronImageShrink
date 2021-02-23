const path = require('path');
const os = require('os');

const form= document.getElementById('img-form');
const slider= document.getElementById('slider');
const img = document.getElementById('img');
const{ipcRenderer}=require('electron')


//Onsubmit
form.addEventListener('submit',e =>{
    e.preventDefault()
    try {
        const imgPath= img.files[0].path;
        const quality = slider.value;
        ipcRenderer.send('image:minimize',{
            imgPath,
            quality
        })
    } catch (error) {
        M.toast({
            html:`Please select file!!`
        })
    }
      
})

ipcRenderer.on('image:done',()=>{
    M.toast({
        html:`Image resized to ${slider.value}%`
    })
})

const pathtext=document.getElementById('path-div');
pathtext.addEventListener('click',()=>{
    ipcRenderer.send("path:select")
})

ipcRenderer.on('path:done',(e,object)=>{
    document.getElementById('output-path').innerText=object;
    
})

ipcRenderer.on('path:none',()=>{
    M.toast({
        html:`Please select file destination!!`
    })
})

