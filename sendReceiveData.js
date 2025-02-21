const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom'); // Import from xmldom
const pd = require('pretty-data').pd; // Import pretty-data for formatting

// Load and parse the sanitizedBodaData.xml file
const inputFilePath = 'sanitizedBodaData.xml';
const outputFilePath = 'sendReceiveData.xml';

fs.readFile(inputFilePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading the input file:', err);
    return;
  }

  let document;
  try {
    // Parse XML using xmldom
    document = new DOMParser().parseFromString(data.trim(), 'text/xml');
  } catch (err) {
    console.error('Invalid XML format:', err.message);
    return;
  }

  // Extract relevant messages
  const messages = document.getElementsByTagName('message');
  const sendMoneyMessages = [];
  const receiveMoneyMessages = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const text = message.textContent;

    if (/Ksh[\d,]+\.\d{2} sent to .+/.test(text)) {
      sendMoneyMessages.push(text);
    } else if (/You have received Ksh[\d,]+\.\d{2} from .+/.test(text)) {
      receiveMoneyMessages.push(text);
    }
  }

  // Create new XML content
  const createMessageNode = (doc, id, text) => {
    const messageNode = doc.createElement('message');
    messageNode.setAttribute('id', id);
    messageNode.textContent = text;
    return messageNode;
  };

  const outputDocument = new DOMParser().parseFromString(
    `<?xml version='1.0' encoding='UTF-8'?>\n<messages></messages>`,
    'text/xml'
  );
  const root = outputDocument.getElementsByTagName('messages')[0];

  sendMoneyMessages.forEach((msg, index) => {
    root.appendChild(createMessageNode(outputDocument, `send-${index + 1}`, msg));
  });

  receiveMoneyMessages.forEach((msg, index) => {
    root.appendChild(createMessageNode(outputDocument, `receive-${index + 1}`, msg));
  });

  // Serialize and format the new XML content
  const outputXML = new XMLSerializer().serializeToString(outputDocument);
  const formattedXML = pd.xml(outputXML); // Format the XML to add proper indentation

  // Save the formatted XML content to the output file
  fs.writeFile(outputFilePath, formattedXML, (writeErr) => {
    if (writeErr) {
      console.error('Error writing the output file:', writeErr);
      return;
    }
    console.log('Extracted messages saved to:', outputFilePath);
  });
});
