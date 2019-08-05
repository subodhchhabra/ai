const puppeteer = require('puppeteer');
const fs = require('fs');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
function jsonFromURL(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}


function playerToUrl(player) {
    const url_prefix = 'https://www.bundesliga.com/de/spieler/aktuelle-saison/'
    const url_suffix = '/statistiken'

    const player_url = `${url_prefix}${player}${url_suffix}`;
    return player_url;
}

const players = JSON.parse(fs.readFileSync('../players.json'))
console.log(players.length)

const waitPeriod = 5000;
const start = 350;
const end = 451;
const newData = [];

(async () => {
    const browser = await puppeteer.launch();
    //   const browser = await puppeteer.launch({headless: false, slowMo: 1000});
    // const browser = await puppeteer.launch({ headless: false });
    // const browser = await puppeteer.launch({ devtools: true });
    for (let i = start; i < end; i++) {
        const player = players[i];
        const url = playerToUrl(player);
        await getPlayer(browser, url);
    }

    await browser.close();
    fs.writeFileSync(`newData${start}-${end}.json`, JSON.stringify(newData));
})();

async function getPlayer(browser, player_url) {
    console.log('Getting', player_url);
    const page = await browser.newPage();
    page.on("error", async error => {
        console.error(error);
    })
    page.on("response", async res => {
        if ('xhr' !== res.request().resourceType()) {
            return;
        }

        // console.log("response received");
        // console.log(res.request().resourceType());
        const url = await res.url();
        // console.log(url);
        if (url.indexOf('Prod/player') !== -1) {
            const text = await res.text();
            const player = JSON.parse(text);
            const name = player.PlayerStatistics[0].Player.Name;
            newData.push(player);
            console.log(name)
        }
    })
    await page.goto(player_url);
    await page.waitFor(waitPeriod);
}