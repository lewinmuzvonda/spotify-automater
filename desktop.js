const { mouse, left, right, middle, up, down, Point } = require('@nut-tree-fork/nut-js');

// Define the movement speed (in pixels)
const speed = 50;

// Function to move the mouse in a square pattern
async function moveMouseInSquare() {
    const screenWidth = 3024; // Replace with your screen width
    const screenHeight = 1964; // Replace with your screen height

    // Define the square movement points
    const points = [
        new Point(screenWidth / 4, screenHeight / 4), // Top-left
        new Point((3 * screenWidth) / 4, screenHeight / 4), // Top-right
        new Point((3 * screenWidth) / 4, (3 * screenHeight) / 4), // Bottom-right
        new Point(screenWidth / 4, (3 * screenHeight) / 4), // Bottom-left
        new Point(screenWidth / 4, screenHeight / 4), // Back to top-left
    ];

    for (const point of points) {
        await mouse.move(point, speed);
        console.log(`Moved mouse to: (${point.x}, ${point.y})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    }
}

// Start moving the mouse
moveMouseInSquare();