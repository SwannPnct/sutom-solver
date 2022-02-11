const puppeteer = require('puppeteer')
const globals = require('./helpers/globals')
const selectors = require('./helpers/selectors')

const URL = 'https://sutom.nocle.fr/'

const open = async () => {
    globals.browser = await puppeteer.launch({headless: false})
    globals.page = await globals.browser.newPage()
    await globals.page.goto(URL)
}

const closePanel = async () => {
    await globals.page.click(selectors.panelClose)
} 

const start = async () => {
    await open()
    await closePanel()
}

start()