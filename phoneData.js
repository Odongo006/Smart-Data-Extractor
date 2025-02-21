const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom'); // Install this package with `npm install xmldom`

// Define input and output file paths
const inputFilePath = path.join(__dirname, 'phoneData.xml');
const outputFilePath = path.join(__dirname, 'bodaData.xml');

// Read the phoneData.xml file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading input file:', err);
    return;
  }

  try {
    // Parse XML data
    const doc = new DOMParser().parseFromString(data, 'text/xml');
    const smsNodes = doc.getElementsByTagName('sms');

    // Extract the 'body' attribute from each <sms> node
    let extractedMessages = '';
    for (let i = 0; i < smsNodes.length; i++) {
      const body = smsNodes[i].getAttribute('body');
      if (body) {
        extractedMessages += `<message>${body}</message>\n`;
      }
    }

    // Write extracted messages to bodaData.xml
    const outputData = `<messages>\n${extractedMessages}</messages>`;
    fs.writeFile(outputFilePath, outputData, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing output file:', writeErr);
      } else {
        console.log('Messages successfully extracted and written to bodaData.xml');
      }
    });
  } catch (parseErr) {
    console.error('Error parsing XML data:', parseErr);
  }
});
