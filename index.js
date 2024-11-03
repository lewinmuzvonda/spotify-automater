const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'credentials.csv');

// Function to create the CSV file and write the header if it doesn't exist
async function initializeCSV() {
    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, 'Email,Password\n', { flag: 'w' });
    }
}

// Function to append a new email and password to the CSV file
async function appendToCSV(email, password) {
    const data = `${email},${password}\n`;
    fs.appendFileSync(csvFilePath, data, { flag: 'a' });
}

async function humanType(page, selector, text) {
    for (const char of text) {
        await page.type(selector, char, { delay: Math.random() * (800 - 300) + 50 }); // Delay between 50ms to 200ms
    }
}

function generateRandomString(length, chars) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function generateRandomEmail(name) {
    const randomLetters = generateRandomString(4, 'abcdefghijklmnopqrstuvwxyz');
    console.log(randomLetters);
    const randomNumbers = generateRandomString(3, '0123456789');
    return `${name.toLowerCase().replace(/\s+/g, '')}${randomLetters}${randomNumbers}@gmail.com`;
}
async function generateRandomPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const specialChars = '!@#.$*&';
    const digits = '123456789';

    let password = '';

    // Add 2 uppercase letters
    for (let i = 0; i < 2; i++) {
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }

    // Add 7 lowercase letters
    for (let i = 0; i < 7; i++) {
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }

    // Add 2 special characters
    for (let i = 0; i < 2; i++) {
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    }

    // Add 1 digit
    password += digits.charAt(Math.floor(Math.random() * digits.length));

    // Shuffle the characters to ensure randomness
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    return password;
}

async function generateRandomDateOfBirth() {
    const year = Math.floor(Math.random() * (2003 - 1969 + 1)) + 1969; // Random year between 1969 and 2003
    const month = Math.floor(Math.random() * 12) + 1; // Random month between 1 and 12
    let day;

    // Determine the maximum number of days in the selected month
    if (month === 2) { // February
        day = Math.floor(Math.random() * (year % 4 === 0 ? 29 : 28)) + 1; // 28 or 29 days
    } else if ([4, 6, 9, 11].includes(month)) { // April, June, September, November
        day = Math.floor(Math.random() * 30) + 1; // 30 days
    } else {
        day = Math.floor(Math.random() * 31) + 1; // 31 days
    }

    return { day, month, year };
}

async function generateRandomGender() {
    return Math.random() < 0.5 ? 'male' : 'female'; // Randomly return either 'male' or 'female'
}

// Function to generate a random name
async function generateRandomName() {
    const firstNames = [
        'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Fiona', 'George', 
        'Hannah', 'Ian', 'Jack', 'Kara', 'Leo', 'Maya', 'Nina', 
        'Oscar', 'Paul', 'Quinn', 'Rita', 'Sam', 'Tina', 'Victor', 
        'Wendy', 'Xander', 'Yara', 'Zoe', 'Ada', 'Brad', 'Cathy', 
        'Daniel', 'Ella', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 
        'Kelly', 'Liam', 'Mason', 'Nora', 'Olivia', 'Peter', 'Quincy', 
        'Ruby', 'Steve', 'Tom', 'Uma', 'Vera', 'Will', 'Xena', 
        'Yasmin', 'Zara', 'Max', 'Zara', 'Kate', 'Oliver', 'Lucas', 
        'Benjamin', 'Charlotte', 'Abigail', 'Elijah', 'Luna', 
        'Aiden', 'Harper', 'Levi', 'Sofia', 'Gabriel', 'Layla', 
        'Matthew', 'Chloe', 'Jackson', 'Amelia', 'Anthony', 
        'Ella', 'Alexander', 'Avery', 'Joshua', 'Scarlett', 
        'Daniel', 'Aria', 'Sebastian', 'Camila', 'John', 'Aurora', 
        'Isaac', 'Penelope', 'Micheal', 'Riley', 'Elena', 'Anthony'
        // Add more first names as needed to reach 10,000 combinations
    ];
    
    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 
        'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 
        'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 
        'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 
        'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 
        'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 
        'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 
        'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 
        'Parker', 'Evans', 'Edwards', 'Collins', 'Sanchez', 
        'Morales', 'Murphy', 'Cook', 'Rogers', 'Rivera', 
        'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 
        'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 
        'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 
        'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 
        'Long', 'Foster', 'Sanders', 'Ross', 'Moreno'
        // Add more last names as needed to reach 10,000 combinations
    ];

    // Generate random first and last names
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${randomFirstName} ${randomLastName}`;
}


(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // Set headless to true if you don't want to see the browser

    // Initialize the CSV file
    await initializeCSV();

    // Create a new incognito browser context
    const context = await browser.createBrowserContext();

    while(true){
                
        // Open a new page in the incognito context
        const page = await context.newPage();

        // Go to Spotify signup page
        page.goto('https://www.spotify.com/ae-en/signup');
        await page.waitForNavigation();

        // Generate a random email and password for each iteration
        const randomPassword = await generateRandomPassword();
        const randomName = await generateRandomName(); // Generate random name
        const randomEmail = await generateRandomEmail(randomName);
        const { day, month, year } = await generateRandomDateOfBirth(); // Random date of birth
        const randomGender = await generateRandomGender(); // Random gender

        console.log(randomPassword+randomGender);

        await new Promise(resolve => setTimeout(resolve, 3000));


        //Enter email address
        await humanType(page, 'input[id="username"]', randomEmail); //email address
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.click('button[data-testid="submit"]'); //next

        await new Promise(resolve => setTimeout(resolve, 2000));

        //Enter password
        await humanType(page, 'input[id="new-password"]', randomPassword); //password
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.click('button[data-testid="submit"]'); //next

        await new Promise(resolve => setTimeout(resolve, 3000));

        //Enter user info
        await humanType(page, 'input[id="displayName"]', randomName); // Random name
        await humanType(page, 'input[id="day"]', day.toString()); // Day
        await page.select('select[id="month"]', month.toString()); // Month
        await humanType(page, 'input[id="year"]', year.toString()); // Year
        await page.click('#gender_option_male');

        if (randomGender === 'male') {
            console.log(randomGender);
            await page.click('label[for="gender_option_male"');
        } else {
            console.log(randomGender);
            await page.click('label[for="gender_option_female"');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.keyboard.press('PageDown');
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.click('button[data-testid="submit"]'); //next


        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.keyboard.press('PageDown');

        await new Promise(resolve => setTimeout(resolve, 2000));

        //Final Step
        await page.click('button[data-testid="submit"]'); //next
        await page.waitForNavigation();

        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.goto('https://open.spotify.com/');
        // await page.waitForNavigation();

        await appendToCSV(randomEmail, randomPassword);

        await new Promise(resolve => setTimeout(resolve, 6000));

        await page.click('button[data-testid="user-widget-link"]'); // menu
        await page.click('button[data-testid="user-widget-dropdown-logout"]'); // logout

        await new Promise(resolve => setTimeout(resolve, 5000));
       
        // Close the page and go back to the signup
        await page.close();

        // Append the email and password to the CSV file
        

         // Wait for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));

        // await browser.close();

    }

   
})();