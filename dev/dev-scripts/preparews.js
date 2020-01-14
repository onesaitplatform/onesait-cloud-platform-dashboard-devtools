"use strict"
//imports
const infoPrinter = require('./utils/infoPrinter')
const fs = require('fs')
const path = require('path')

//consts
const defPath = "models/downloaded"
const workspacePath = `${process.cwd()}/src`

if (process.argv.length === 1) {
    console.error("arguments can't be 0, please fill with all dashboards ids")
    return;
}

infoPrinter.printSplash();
console.info("Preparing workspace for...\n")

var generateWorkspaceByModel = jsonModel => {
    var model = JSON.parse(jsonModel.model);
    model.pages.forEach(
        (page,pageIndex) => page.layers
            .forEach(
                (layer,layerIndex) => layer.gridboard
                    .forEach(
                        (gadget,gadgetIndex) => {
                            if(gadget.type === 'livehtml'){
                                fs.mkdirSync(
                                    path.join(workspacePath,jsonModel.identification,`(${pageIndex}) ${page.title}`,`${gadget.header.title.text}(${gadget.id})`),
                                    {recursive: true}
                                );
                                fs.writeFile(
                                    path.join(workspacePath,jsonModel.identification,`(${pageIndex}) ${page.title}`,`${gadget.header.title.text}(${gadget.id})`,`${gadget.id}.js`),
                                    gadget.contentcode?gadget.contentcode:"",
                                    (err) => {
                                        if (err) throw err;
                                        console.log(`File ${gadget.id}.js created!`);
                                    }
                                );
                                fs.writeFile(
                                    path.join(workspacePath,jsonModel.identification,`(${pageIndex}) ${page.title}`,`${gadget.header.title.text}(${gadget.id})`,`${gadget.id}.html`),
                                    gadget.content?gadget.content:"",
                                    (err) => {
                                        if (err) throw err;
                                        console.log(`File ${gadget.id}.html created!`);
                                    }
                                );
                            }
                        }
                    )
        )
    )
    fs.writeFile(
        path.join(workspacePath,jsonModel.identification,`headerLibs.html`),
        jsonModel.headerlibs?jsonModel.headerlibs:"",
        (err) => {
            if (err) throw err;
            console.log(`File headerLibs.html created!`);
        }
    );
}


process.argv.slice(2).forEach(
    dashboardId => {
        console.log(`Dashboard: ${dashboardId}\n`);
        var contents = fs.readFileSync(path.join(defPath,`${dashboardId}.json`));
        var jsonModel = JSON.parse(contents);
        generateWorkspaceByModel(jsonModel)
    }
)

