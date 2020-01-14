"use strict"
//imports
const infoPrinter = require('./utils/infoPrinter')
const fs = require('fs')
const path = require('path')
//const fs = require('fs').promises;

//consts
const defPath = "models/downloaded"
const workspacePath = `${process.cwd()}/src`
const outputPath = `models/dist`

if (process.argv.length === 1) {
    console.error("arguments can't be 0, please fill with all dashboards ids")
    return;
}

infoPrinter.printSplash();
console.info("Building model for...\n")


async function walkAndSet(dir,model) {
    let files = await fs.readdirSync(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.statSync(filePath);
        if (stats.isDirectory()) return walkAndSet(filePath, model);
        else if(stats.isFile() && file !== "headerLibs.html" && file !== "data.json") {
            const splitedPath = dir.split(path.sep);
            const extension = file.split("\.")[1];
            const pageIndex = splitedPath[splitedPath.length-2].split(/[\(\)]/)[1];
            const gadgetId = splitedPath[splitedPath.length-1].split(/[\(\)]/)[1];
            var gadgetIndex = model.pages[pageIndex].layers[0].gridboard.findIndex(
                gadget => gadget.id === gadgetId
            )
            model.pages[pageIndex].layers[0].gridboard[gadgetIndex][(extension.toLowerCase() === 'js'?'contentcode':'content')] = fs.readFileSync(filePath,'utf8');
        };
    }));

    return files.reduce((all, folderContents) => all.concat(folderContents), []);
}


process.argv.slice(2).forEach(
    dashboardId => {
        console.log(`Dashboard: ${dashboardId}\n`);
        var contents = fs.readFileSync(path.join(defPath,`${dashboardId}.json`));
        var jsonModel = JSON.parse(contents);
        var model = JSON.parse(jsonModel.model);
        walkAndSet(path.join(workspacePath,dashboardId),model).then(
            () => {
                jsonModel.model = JSON.stringify(model);
                jsonModel.headerlibs = fs.readFileSync(path.join(workspacePath,dashboardId,`headerLibs.html`),'utf8')
                fs.writeFile(
                    path.join(outputPath,`${dashboardId}.json`),
                    JSON.stringify(jsonModel),
                    (err) => {
                        if (err) throw err;
                        console.log(`File ${dashboardId}.json created!`);
                    }
                )
            }
        )
    }
)

