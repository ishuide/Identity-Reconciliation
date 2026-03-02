import express from 'express';
import { identifyContact } from './services/reconciliation';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Identity Reconciliation Service is running. Use POST /identify to reconcile contacts.');
});

app.post('/identify', async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Email or phoneNumber is required' });
    }

    try {
        const result = await identifyContact(email, phoneNumber);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /identify:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
