const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');

const csvFilePath = 'credentials.csv';

const artistUrl = 'https://open.spotify.com/artist/6SEsiM1D9MqCnOJ8XmI9S0';

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

// Function to log in and follow artist
async function loginAndFollow(page, email, password) {
    try {
        // Go to Spotify login page
        await page.goto('https://accounts.spotify.com/login');
        
        //Clear field
        await page.evaluate( () => document.getElementById("login-username").value = "")
        // Enter email
        await humanType(page, 'input[data-testid="login-username"]', email);

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        //Clear field
        await page.evaluate( () => document.getElementById("login-password").value = "")
        // Enter password
        await humanType(page, 'input[data-testid="login-password"]', password);

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Click login button
        await page.click('button[data-testid="login-button"]');
        
        // Wait for navigation to finish (or homepage to load)
        await page.waitForNavigation({ timeout: 8000 }).catch(() => {}); // Catch timeout errors if any

        // Check if CAPTCHA challenge page is encountered
        if (page.url().includes('challenge.spotify.com')) {
            console.log('CAPTCHA is present on the page.');

            // Function to play sound continuously until resolved
            const playSoundContinuously = () => {
                const sound = player.play('beep.wav', (err) => {
                    if (err) console.error('Error playing sound:', err);
                });

                return new Promise(resolve => {
                    sound.on('close', resolve); // Resolve when sound is finished
                });
            };

            // Repeat sound until user resolves CAPTCHA
            const soundInterval = setInterval(async () => {
                await playSoundContinuously();
            }, 3000); // Play sound every 2 seconds

            await page.evaluate(() => {
                alert('Solve the CAPTCHA and click continue'); // Trigger a window alert
            });;

            await new Promise(resolve => setTimeout(resolve, 30000));
            clearInterval(soundInterval); // Stop playing sound once resolved

           
        }
        
        // Navigate to artist's page
        await page.goto(artistUrl, { waitUntil: 'networkidle2' });
        
        // Wait for the follow button to appear and click it
        await page.waitForSelector('button[data-encore-id="buttonSecondary"]', { timeout: 10000 });
        await page.click('button[data-encore-id="buttonSecondary"]');
        
        console.log(`Followed artist for account: ${email}`);

        await new Promise(resolve => setTimeout(resolve, 3000));

        await page.click('button[data-testid="user-widget-link"]'); // menu
        await page.click('button[data-testid="user-widget-dropdown-logout"]'); // logout

        await new Promise(resolve => setTimeout(resolve, 3000));


    } catch (error) {
        console.error(`Failed to follow artist for account ${email}: ${error.message}`);
    }
}


(async () => {
    // Load account details from CSV
    const accounts = await loadAccounts(csvFilePath);

    console.log('csv loaded...');
    
    // Initialize Puppeteer
    const browser = await puppeteer.launch({ headless: false });

    const context = await browser.createBrowserContext();

    console.log(accounts);
    
    for (const { email, password } of accounts) {

        console.log(email);
        
        const page = await context.newPage();
        
        // Login and follow artist
        await loginAndFollow(page, email, password);
        
        // Close the page after action
        await page.close();
        
        // Wait a few seconds before the next login (optional)
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Close browser
    await browser.close();
})();