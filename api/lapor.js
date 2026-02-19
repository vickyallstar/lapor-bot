export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, message } = req.body;

        // Validasi input
        if (!username || !message) {
            return res.status(400).json({ error: 'Username dan pesan harus diisi' });
        }

        // Get environment variables
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const ADMIN_ID = process.env.ADMIN_ID;

        if (!BOT_TOKEN || !ADMIN_ID) {
            console.error('Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Generate unique ID
        const uniqueId = Date.now();

        // Format pesan untuk Telegram
        const telegramMessage = `
📩 Laporan Masuk
👤 Username: ${username}
🆔 ID: ${uniqueId}
📝 Pesan:
${message}
        `.trim();

        // Kirim ke Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: telegramMessage,
                parse_mode: 'HTML'
            })
        });

        const telegramResponse = await response.json();

        if (!telegramResponse.ok) {
            console.error('Telegram API error:', telegramResponse);
            return res.status(500).json({ error: 'Gagal mengirim ke Telegram' });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Laporan berhasil dikirim',
            id: uniqueId 
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}