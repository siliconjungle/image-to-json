// Import the fs, jimp, and readline modules
import fs from 'fs'
import jimp from 'jimp'
import readline from 'readline'

const palette = [
  'rgba(0, 0, 0, 1)',
  'rgba(34, 32, 52, 1)',
  'rgba(69, 40, 60, 1)',
  'rgba(102, 57, 49, 1)',
  'rgba(143, 86, 59, 1)',
  'rgba(223, 113, 38, 1)',
  'rgba(217, 160, 102, 1)',
  'rgba(238, 195, 154, 1)',
  'rgba(251, 242, 54, 1)',
  'rgba(153, 229, 80, 1)',
  'rgba(106, 190, 48, 1)',
  'rgba(55, 148, 110, 1)',
  'rgba(75, 105, 47, 1)',
  'rgba(82, 75, 36, 1)',
  'rgba(51, 60, 57, 1)',
  'rgba(63, 63, 116, 1)',
  'rgba(48, 96, 130, 1)',
  'rgba(91, 110, 225, 1)',
  'rgba(99, 155, 255, 1)',
  'rgba(95, 205, 228, 1)',
  'rgba(203, 219, 252, 1)',
  'rgba(255, 255, 255, 1)',
  'rgba(155, 173, 183, 1)',
  'rgba(132, 126, 135, 1)',
  'rgba(105, 106, 106, 1)',
  'rgba(89, 86, 82, 1)',
  'rgba(118, 66, 138, 1)',
  'rgba(172, 50, 50, 1)',
  'rgba(217, 87, 99, 1)',
  'rgba(215, 123, 186, 1)',
  'rgba(143, 151, 74, 1)',
  'rgba(138, 111, 48, 1)',
]

const findClosestColorIndex = (colors, color) => {
  // Parse the given color string into its individual red, green, blue, and alpha values
  const [red, green, blue, alpha] = color
    .match(/\d+/g)
    .map(Number)

  // Set the initial minimum difference to a large number
  let minDifference = Number.MAX_SAFE_INTEGER

  // Set the initial index to -1
  let index = -1

  // Loop through the colors array and find the index of the color with the smallest difference
  for (let i = 0; i < colors.length; i++) {
    // Parse the current color string into its individual red, green, blue, and alpha values
    const [r, g, b, a] = colors[i]
      .match(/\d+/g)
      .map(Number)

    // Calculate the difference between the red, green, blue, and alpha values of the current color and the given color
    const redDifference = Math.abs(r - red)
    const greenDifference = Math.abs(g - green)
    const blueDifference = Math.abs(b - blue)
    const alphaDifference = Math.abs(a - alpha)
    const totalDifference = redDifference + greenDifference + blueDifference + alphaDifference

    // If the total difference is smaller than the current minimum difference, update the minimum difference and the index
    if (totalDifference < minDifference) {
      minDifference = totalDifference
      index = i
    }
  }

  // Return the index of the color with the smallest difference
  return index
}

const getDominantColorIndex = (pixels, colors) => {
  // Create an array to store the frequency of each color
  const colorFrequencies = new Array(colors.length).fill(0)

  // Get the width and height of the image
  const width = pixels[0].length
  const height = pixels.length

  // Loop through the pixel data array and count the frequency of each color
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex = pixels[y][x]
      colorFrequencies[colorIndex]++
    }
  }

  // Find the index of the dominant color
  let dominantColorIndex = 0
  for (let i = 0; i < colorFrequencies.length; i++) {
    if (colorFrequencies[i] > colorFrequencies[dominantColorIndex]) {
      dominantColorIndex = i
    }
  }

  return dominantColorIndex
}

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
        const colorIndex = findClosestColorIndex(palette, color)

        // Check if the color is already in the array of unique colors
        // let colorIndex = palette.indexOf(color)
        // if (colorIndex === -1) {
        //   // If the color is not in the array, add it and use the new length of the array as the index
        //   colors.push(color)
        //   colorIndex = colors.length - 1
        // }

        // Add the index of the color to the current row in the pixel data array
        pixelData[y][x] = colorIndex
      }
    }

    // Create the name of the JSON file by replacing the file type of the image file with '.json'
    const jsonFilename = imageFilename.replace(/\.[^/.]+$/, '') + '.json'

    const dominantIndex = getDominantColorIndex(pixelData, palette)

    // Save the pixel data array and the colors array to the JSON file
    fs.writeFileSync(jsonFilename, JSON.stringify({
      pixels: pixelData,
      colors: palette,
      dominantIndex: dominantIndex,
    }))

    // Close the readline interface
    rl.close()
  })
})
