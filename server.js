const express = require('express');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// Ensure qr_codes directory exists
const qrDir = 'qr_codes';
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir);
}

// Store last 5 QR codes in memory
let qrHistory = [];

// API endpoint to generate QR code
app.post('/generate', (req, res) => {
    const { text, color = '#000000', size = 300 } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text input is required' });
    }

    try {
        // Generate QR code
        const qr_png = qr.imageSync(text, { 
            type: 'png', 
            size: 10,
            margin: 2
        });
        
        const base64Image = qr_png.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;
        
        // Save input to file
        fs.writeFileSync('inp.txt', text);
        
        // Add to history (keep only last 5)
        qrHistory.unshift({ text, timestamp: new Date(), dataUrl });
        if (qrHistory.length > 5) {
            qrHistory.pop();
        }
        
        res.json({ 
            success: true, 
            qrCode: dataUrl,
            history: qrHistory
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Endpoint to download QR code
app.get('/download', (req, res) => {
    const { text } = req.query;
    
    if (!text) {
        return res.status(400).send('Text parameter is required');
    }
    
    try {
        const qr_png = qr.imageSync(text, { type: 'png', size: 10 });
        res.setHeader('Content-Disposition', 'attachment; filename="my_qr.png"');
        res.setHeader('Content-Type', 'image/png');
        res.send(qr_png);
    } catch (error) {
        console.error('Error generating download:', error);
        res.status(500).send('Failed to generate QR code for download');
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});