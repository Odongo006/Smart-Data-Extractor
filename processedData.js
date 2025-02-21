const fs = require('fs');
const { DOMParser } = require('xmldom'); // Import DOMParser for XML parsing

// Input and output file paths
const inputFilePath = 'sendReceiveData.xml'; // Replace with your XML file path
const jsonOutputPath = 'processedData.json';
const sqlOutputPath = 'processedData.sql';

// Helper function to extract name and phone number from message text
const extractNameAndPhone = (text) => {
  const namePhoneRegex = /(?:to|from)?\s*([A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d{10})/i;
  const match = text.match(namePhoneRegex);
  if (match) {
    return {
      name: match[1].trim(),
      phone: match[2].trim(),
    };
  }
  return null;
};

// Read the XML file
fs.readFile(inputFilePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading the input file:', err);
    return;
  }

  let document;
  try {
    // Parse the XML data
    document = new DOMParser().parseFromString(data.trim(), 'text/xml');
  } catch (err) {
    console.error('Error parsing XML:', err.message);
    return;
  }

  // Extract all message elements
  const messages = document.getElementsByTagName('message');
  const uniqueContacts = new Map(); // Use Map to ensure unique entries

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const text = message.textContent;

    const extracted = extractNameAndPhone(text);
    if (extracted) {
      // Use phone number as the unique key
      if (!uniqueContacts.has(extracted.phone)) {
        uniqueContacts.set(extracted.phone, extracted.name);
      }
    }
  }

  // Convert unique contacts to an array of objects
  const processedData = Array.from(uniqueContacts.entries()).map(([phone, name]) => ({
    name,
    phone,
  }));

  // Save the processed data as JSON
  fs.writeFile(jsonOutputPath, JSON.stringify(processedData, null, 2), (writeErr) => {
    if (writeErr) {
      console.error('Error writing to JSON file:', writeErr);
      return;
    }
    console.log('Processed data saved to:', jsonOutputPath);
  });

  // Generate SQL file content
// Use a Set to keep track of unique phone numbers
const uniquePhones = new Set();

const sqlInsertStatements = processedData
  .map((contact) => {
    // Skip already processed phone numbers
    if (uniquePhones.has(contact.phone)) {
      return null;
    }
    uniquePhones.add(contact.phone);
    return `INSERT INTO contacts (name, phone) VALUES ('${contact.name.replace(/'/g, "''")}', '${contact.phone}');`;
  })
  .filter(Boolean) // Remove null values (duplicates)
  .join('\n');


  const sqlFileContent = `
-- SQL statements to insert data into the contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE
);

${sqlInsertStatements}
`;

  // Save the SQL file
  fs.writeFile(sqlOutputPath, sqlFileContent.trim(), (writeErr) => {
    if (writeErr) {
      console.error('Error writing to SQL file:', writeErr);
      return;
    }
    console.log('Processed data saved to:', sqlOutputPath);
  });
});
