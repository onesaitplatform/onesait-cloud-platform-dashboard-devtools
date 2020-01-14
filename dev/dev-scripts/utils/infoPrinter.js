var figlet = require('figlet');
const printSplash = () => {
    console.info(
        figlet.textSync('Dashboard Engine', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        })
    )

    console.info(
        figlet.textSync('     Dev Tools', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        })
    )

    console.info(
        figlet.textSync('               by Onesait Platform', {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        })
    )

    console.info("");
    console.info("");
}

module.exports.printSplash = printSplash;