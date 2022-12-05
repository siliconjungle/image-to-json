// Import the fs and readline modules
import fs from 'fs'
import readline from 'readline'

// Create a readline interface to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Ask the user for the name of the JSON file
rl.question('Enter the name of the JSON file:', (jsonFilename) => {
  // Read the JSON file into a string
  const jsonString = fs.readFileSync(jsonFilename)

  // Parse the JSON string to get a JavaScript object
  const pixelData = JSON.parse(jsonString)

  // Access the properties of the object
  const pixels = pixelData.pixels
  const colors = pixelData.colors

  // Use the properties of the object
  console.log(pixels)
  console.log(colors)

  // Close the readline interface
  rl.close()
})
