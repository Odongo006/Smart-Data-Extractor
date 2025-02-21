const fs = require('fs');
const { parseStringPromise } = require('xml2js');

function extractTransactions(xmlData) {
    const sendMoneyPattern = /Ksh[\d,]+\.\d{2} sent to/;
    const receiveMoneyPattern = /You have received Ksh[\d,]+\.\d{2} from/;
    
    const transactions = {
        sendMoney: [],
        receiveMoney: []
    };

    // Parse the XML data
    return parseStringPromise(xmlData, { explicitArray: false })
        .then(parsedData => {
            const messages = parsedData.messages.message || [];
            // Ensure messages is an array
            const messageArray = Array.isArray(messages) ? messages : [messages];

            // Filter messages
            messageArray.forEach(message => {
                if (sendMoneyPattern.test(message)) {
                    transactions.sendMoney.push(message);
                } else if (receiveMoneyPattern.test(message)) {
                    transactions.receiveMoney.push(message);
                }
            });

            return transactions;
        });
}

// Load and process the XML file
const inputFilePath = 'sanitizedBodaData.xml';

fs.readFile(inputFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    extractTransactions(data)
        .then(transactions => {
            console.log('Send Money Transactions:', transactions.sendMoney);
            console.log('Receive Money Transactions:', transactions.receiveMoney);
        })
        .catch(error => {
            console.error('Error processing XML:', error);
        });
});
