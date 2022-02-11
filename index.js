const puppeteer = require('puppeteer')
const puppeteerConfig = require('./helpers/puppeteerConfig')
const globals = require('./helpers/globals')
const selectors = require('./helpers/selectors')

const _url = 'https://sutom.nocle.fr/'

const open = async () => {
    globals.browser = await puppeteer.launch(puppeteerConfig)
    globals.page = await globals.browser.newPage()
    await globals.page.goto(_url)
}

const closePanel = async () => {
    await globals.page.click(selectors.panelClose)
} 

const setGameConfig = async () => {
    const { page } = globals
    const rows = await page.$$(selectors.rows)
    const firstRow = await rows[0].$$('td')
    const firstCellValue = await page.evaluate(el => el.textContent, firstRow[0])
    
    globals.game.totalTries = rows.length
    globals.game.wordLength = firstRow.length
    globals.game.firstLetter = firstCellValue

    console.log(globals.game)
}

const start = async () => {
    await open()
    await closePanel()
    await setGameConfig()
}

start()