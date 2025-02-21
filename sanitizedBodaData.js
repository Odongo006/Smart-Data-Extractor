const fs = require('fs');

fs.readFile('bodaData.xml', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Replace invalid characters with their escaped equivalents
  const sanitizedData = data
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;') // Replace '&' not part of valid entities
    .replace(/</g, '&lt;') // Replace '<'
    .replace(/>/g, '&gt;'); // Replace '>'

  // Save sanitized XML back to a new file
  fs.writeFile('sanitizedBodaData.xml', sanitizedData, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing sanitized XML:', writeErr);
    } else {
      console.log('Sanitized XML saved as sanitizedBodaData.xml');
    }
  });
});
