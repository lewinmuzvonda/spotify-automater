const puppeteer = require('puppeteer');

async function humanType(page, selector, text) {
    for (const char of text) {
        await page.type(selector, char, { delay: Math.random() * (800 - 300) + 50 }); // Delay between 50ms to 200ms
    }
}

// Function to perform a double-click
async function doubleClick(page, selector) {
    const element = await page.$(selector);
    if (element) {
        await page.evaluate(element => {
            const event = new MouseEvent('dblclick', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }, element);
    }
}

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless to true if you don't want to see the browser
    const page = await browser.newPage();

    // Go to Spotify login page
    await page.goto('https://accounts.spotify.com/en/login');

    // Login to Spotify (replace with your credentials)
    await humanType(page, 'input[data-testid="login-username"]', 'wadziehavazvidi@gmail.com');
    await humanType(page, 'input[data-testid="login-password"]', 'Esinita.91');
    await page.click('button[data-testid="login-button"]');
    await page.waitForNavigation();
    // Go to a specific playlist or song
    await page.goto('https://open.spotify.com/track/3EfrhkRFm9hmXGS1nFgvNO'); // Replace with your playlist ID or song link
    
    // Wait for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for the play button to be visible
    await page.waitForSelector('button[data-testid="play-button"][class="Button-sc-qlcn5g-0 dlTJiR"]');

    // Click the specific play button
    const specificPlayButtonSelector = 'button[data-testid="play-button"][class="Button-sc-qlcn5g-0 dlTJiR"]';
    await page.click(specificPlayButtonSelector);

    await new Promise(resolve => setTimeout(resolve, 4000));

    await page.waitForSelector('button[data-testid="control-button-skip-forward"]');

    // Set up an interval to click the skip button every 20 seconds
    const skipButtonSelector = 'button[data-testid="control-button-skip-forward"]';
    
    const intervalId = setInterval(async () => {
        // Click the skip button
        await page.click(skipButtonSelector);
        console.log('Clicked skip button');
    }, 20000);

    // Wait for a while before closing the browser
    await new Promise(resolve => setTimeout(resolve, 99999999));

    // Close the browser
    await browser.close();
})();
