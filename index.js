const puppeteer = require('puppeteer')
const puppeteerConfig = require('./helpers/puppeteerConfig')
const globals = require('./helpers/globals')
const selectors = require('./helpers/selectors')
const gameConfig = require('./game/config')
const play = require('./game/play')

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
    const firstRow = await rows[0].$$(selectors.cells)
    const firstCellValue = await page.evaluate(el => el.textContent, firstRow[0])
    
    gameConfig.totalTries = rows.length
    gameConfig.wordLength = firstRow.length
    gameConfig.firstLetter = firstCellValue
}

const start = async () => {
    await open()
    await closePanel()
    setTimeout(async () => { 
        await setGameConfig()
        setTimeout(async () => await play(), 500)
    }, 1000)
}

start()