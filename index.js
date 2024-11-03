const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const songUrl = 'https://open.spotify.com/track/3EfrhkRFm9hmXGS1nFgvNO';
const csvFilePath = 'credentials.csv';

async function loadAccounts(filePath) {
    const accounts = [];
    const fileStream = fs.createReadStream(filePath);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (const line of rl) {
        const [email, password] = line.split(',');
        if (email && password) {
            accounts.push({ email: email.trim(), password: password.trim() });
        }
    }
    return accounts;
}

async function humanType(page, selector, text) {
    for (const char of text) {
        await page.type(selector, char, { delay: Math.random() * (550 - 330) + 38 }); // Delay between 50ms to 200ms
    }
}

async function playTrackForAccount(account, playDuration = 35000) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to Spotify login page
        await page.goto('https://accounts.spotify.com/login');
        
        // Clear and enter credentials
        await page.evaluate(() => document.querySelector('[data-testid="login-username"]').value = '');
        await page.evaluate(() => document.querySelector('[data-testid="login-password"]').value = '');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.type('[data-testid="login-username"]', account.email);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.type('[data-testid="login-password"]', account.password);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.click('[data-testid="login-button"]');
        
        // Wait for login to complete and redirect
        await page.waitForNavigation();

        // Navigate to the song page
        await page.goto(songUrl, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const playButtons = await page.$$('button[data-testid="play-button"][aria-label="Play"]');
        
        if (playButtons.length > 0) {
            // Assuming you want to click the first instance of the play button
            await playButtons[1].click();
        } else {
            console.log("Play button not found");
        }

        // Wait for the specified duration
        await new Promise(resolve => setTimeout(resolve, playDuration));

        await page.click('button[data-testid="user-widget-link"]'); // menu
        await page.click('button[data-testid="user-widget-dropdown-logout"]'); // logout

        await page.waitForNavigation();

    } catch (error) {
        console.error(`Error with account ${account.email}:`, error);
    } finally {
        await browser.close();
    }
}

async function startStreaming(filePath, batchSize = 1) {
    const accounts = await loadAccounts(filePath);
    let index = 0;

    while (true) {
        // Run a batch of `batchSize` accounts
        const batch = accounts.slice(index, index + batchSize);
        
        if (batch.length === 0) {
            index = 0; // Reset if reached the end of the list
            continue;
        }

        await Promise.all(batch.map(account => playTrackForAccount(account)));

        index += batchSize;
    }
}

startStreaming(csvFilePath);