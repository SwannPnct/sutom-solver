const dictionnary = require('../helpers/dictionnary')
const globals = require('../helpers/globals')
const selectors = require('../helpers/selectors')
const config = require('./config')

const data = {}
const initialize = () => {
    data.placed = [config.firstLetter, ...Array(config.wordLength - 1).fill(null)]
    data.unplaced = {}
    data.wrong = []

    const iniReg = new RegExp(`(?=^${config.firstLetter})(?=^[a-zA-Z]{${config.wordLength}}$).*$`)
    data.matches = dictionnary.filter((word) => iniReg.test(word))
}

const getLetterInput = async (letterInputs, targetLetter) => {
    for (const input of letterInputs) {
        const valueHandle = await input.getProperty('innerText')
        const value = await valueHandle.jsonValue()
        if (value === targetLetter) return input
    }
}

const enter = async () => {
    const enter = await globals.page.$(selectors.enter)
    await enter.click()
}

const typeWord = async (word) => {
    const letters = await globals.page.$$(selectors.letters)
    for (const letter of word.slice(1)) {
        const input = await getLetterInput(letters, letter)
        await input.click()
    }
    await enter()
}

const getWord = () => {
    const index = Math.floor(Math.random() *  data.matches.length)
    const word = data.matches[index]
    data.matches.splice(index, 1)
    return word
}

const resetUnplacedCounts = () => {
    Object.keys(data.unplaced).forEach((letter) => {
        data.unplaced[letter].count = 0
    })
}

const updateUnplaced = (letter, idx) => {
    const target = data.unplaced[letter]
    data.unplaced[letter] = {
        count: target ? target.count + 1 : 1,
        tries: target?.tries ? [...target.tries, idx] : [idx]
    }
}

const updateData = async () => {
    resetUnplacedCounts()
    const completed = await globals.page.$$(selectors.completed)
    const last = completed.slice(completed.length - 6, completed.length)
    for (let i = 0; i < last.length; i ++) {
        const result = last[i]
        const classHandle = await result.getProperty('className')
        const className = await classHandle.jsonValue()
        const letterHandle = await result.getProperty('innerText')
        const letter = await letterHandle.jsonValue()

        if (className.includes(selectors.placed.replace('.', ''))) {
            data.placed[i] = letter
        } else if(className.includes(selectors.unplaced.replace('.', ''))) {
            updateUnplaced(letter, i)
        } else if(className.includes(selectors.wrong.replace('.', ''))) {
            data.wrong.push(letter)
        }
    }
    data.wrong = data.wrong.filter((letter) => (!data.unplaced[letter] ||  data.unplaced[letter].count === 0) && data.placed.indexOf(letter) === -1)
    Object.keys(data.unplaced).forEach((letter) => {
        if (data.placed.includes(letter)) data.unplaced[letter].count += 1
    })
}

const endOrPlay = async () => {
    const end = await globals.page.$(selectors.end)
    if (!end) play()
}

const buildUnplacedRegex = () => {
    const letters = Object.keys(data.unplaced)
    const contains = letters.reduce((exp, letter) => exp + `(?=.*${letter}{${data.unplaced[letter].count},})`, '')
    const avoid = letters.reduce((exp, letter) => exp + data.unplaced[letter].tries.reduce((exp2, idx) => exp2 + `(?=^.{${idx}}[^${letter}].{${config.wordLength - idx - 1}}$)`,''), '')
    return `${contains}${avoid}`
}

const buildRegex = () => {
    const wrong = `(?=^(?:(?![${data.wrong.join('')}]).)*$)`
    const placed = data.placed.reduce((exp, letter, idx) => letter ? exp + `(?=^.{${idx}}${letter}.{${config.wordLength - idx - 1}}$)` : exp , '')
    const unplaced = buildUnplacedRegex()
    return `${wrong}${placed}${unplaced}`
}

const updateMatches = () => {
    const regex = new RegExp(buildRegex())
    console.log('reg', regex)
    data.matches = data.matches.filter((word) => regex.test(word))
}

const play = async () => {
    if (!Object.keys(data).length) initialize()
    else updateMatches()

    const word = getWord()

    await typeWord(word)
    setTimeout(async () =>{ 
        await updateData()
        await endOrPlay()
    }, 2000)
}

module.exports = play