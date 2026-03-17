export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.stoltzlawcorp.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      formType,
      fullName,
      email,
      phone,
      sectionsHtml
    } = req.body || {};

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SLC Legal Intake <intake@mail.stoltzlawcorp.com>',
        to: ['intake@stoltzlawcorp.com'],
        reply_to: email || 'intake@stoltzlawcorp.com',
        subject: `${formType || 'Intake'} - ${fullName || 'New Submission'}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #0f172a;">
            <h2 style="margin-bottom: 8px;">${formType || 'Intake'} Submission</h2>
            <p style="margin: 0 0 6px;"><strong>Name:</strong> ${fullName || ''}</p>
            <p style="margin: 0 0 6px;"><strong>Email:</strong> ${email || ''}</p>
            <p style="margin: 0 0 18px;"><strong>Phone:</strong> ${phone || ''}</p>
            ${sectionsHtml || '<p>No intake details provided.</p>'}
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ ok: false, error: errorText });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : 'Unknown error'
    });
  }
}
