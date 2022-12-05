// Import the fs, jimp, and readline modules
import fs from 'fs'
import jimp from 'jimp'
import readline from 'readline'

// Create a readline interface to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Ask the user for the name of the image file
rl.question('Enter the name of the image file:', (imageFilename) => {
  // Read the image file into a buffer
  const imageBuffer = fs.readFileSync(imageFilename)

  // Use jimp to create a new image from the image buffer
  jimp.read(imageBuffer, (err, image) => {
    if (err) throw err

    // Create a 2D array to store the pixel data of the image
    const pixelData = []

    // Create an array to store the unique colors in the image
    const colors = []

    // Get the width and height of the image
    const width = image.bitmap.width
    const height = image.bitmap.height

    // Loop through the pixels and add them to the 2D array
    for (let y = 0; y < height; y++) {
      // Create a new row in the pixel data array
      pixelData[y] = []

      for (let x = 0; x < width; x++) {
        // Use jimp to get the RGBA values for the current pixel
        const rgba = image.getPixelColor(x, y)
        const rgbaData = jimp.intToRGBA(rgba)

        // Create a string representing the color of the current pixel
        const color = `rgba(${rgbaData.r}, ${rgbaData.g}, ${rgbaData.b}, ${rgbaData.a})`

        // Check if the color is already in the array of unique colors
        let colorIndex = colors.indexOf(color)
        if (colorIndex === -1) {
          // If the color is not in the array, add it and use the new length of the array as the index
          colors.push(color)
          colorIndex = colors.length - 1
        }

        // Add the index of the color to the current row in the pixel data array
        pixelData[y][x] = colorIndex
      }
    }

    // Create the name of the JSON file by replacing the file type of the image file with '.json'
    const jsonFilename = imageFilename.replace(/\.[^/.]+$/, '') + '.json'

    // Save the pixel data array and the colors array to the JSON file
    fs.writeFileSync(jsonFilename, JSON.stringify({
      pixels: pixelData,
      colors: colors
    }))

    // Close the readline interface
    rl.close()
  })
})