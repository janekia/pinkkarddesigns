
require('dotenv').config({ path: './pro.env' });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');


const app = express();  // ✅ Initialize app before using it
const PORT = process.env.PORT || 3000;
const config = yaml.load(fs.readFileSync('smtp.yaml', 'utf8'))

console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Loaded' : 'Missing');

app.use(cors());  // ✅ Now it's safe to use app.use()
app.use(express.json()); // For JSON request bodies
app.use(express.urlencoded({ extended: true })); // For form data

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve index.html from the root folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route for handling form submissions
app.post('/send-message', async (req, res) => {
    const { email, subject, message } = req.body;
    console.log('Received Form Data:', req.body);

    if (!email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465',  // Secure only for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    let mailOptions = {
        from: process.env.SMTP_USER,
        replyTo: email,
        to: process.env.SMTP_USER,
        subject: subject,
        text: `From: ${email}\n\n${message}`,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Message sent successfully');
        res.json({ success: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send the message.' });
    }
});

const transporter = nodemailer.createTransport({
    host: config['SMTP Server'],
    port: config.Port,
    secure: config.Secure === true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      message: formData.get("message")
    };
  
    fetch("/.netlify/functions/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      alert("Message sent: " + response.message);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Something went wrong.");
    });
  });
  const handler = async (event, context) => {
    const { email, subject, message } = JSON.parse(event.body);
    // process the form data here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message received!" })
    };
  };
  

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
