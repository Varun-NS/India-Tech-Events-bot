require('dotenv').config();
const nodemailer = require('nodemailer');
const Groq = require('groq-sdk');
const axios = require('axios');

// Ensure required environment variables are set
const requiredEnvVars = ['GROQ_API_KEY', 'SERPER_API_KEY', 'GMAIL_USER', 'GMAIL_APP_PASSWORD', 'TO_EMAIL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    console.error('Please copy .env.template to .env and fill in the values.');
    process.exit(1);
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function searchEvents() {
  console.log('Searching for upcoming tech events in India via Serper API...');
  
  const today = new Date();
  const currentMonthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate date 1 month from now for closer events focus
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthStr = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate date 6 months from now
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  const futureMonthStr = futureDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const dateQuery = `between ${currentMonthStr} and ${futureMonthStr}`;

  const queries = [
    `upcoming tech events in India ${currentMonthStr}`,
    `upcoming tech events in India ${nextMonthStr}`,
    `upcoming tech events in India ${dateQuery}`,
    `upcoming AI conferences in India ${currentMonthStr}`,
    `upcoming startup events in India ${dateQuery}`,
    `developer meetups in India ${dateQuery}`,
    `cybersecurity conferences in India ${dateQuery}`,
    `SaaS events India ${dateQuery}`
  ];

  let allResults = [];

  for (const query of queries) {
    try {
      console.log(`Executing Serper search query: "${query}"`);
      const response = await axios.post(
        'https://google.serper.dev/search',
        { q: query, gl: 'in', num: 10 },
        { headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' } }
      );
      if (response.data && response.data.organic) {
        allResults = allResults.concat(response.data.organic);
      }
    } catch (error) {
      console.error(`Error searching for "${query}":`, error.response ? error.response.status : error.message);
    }
  }

  // Deduplicate URLs before sending to LLM
  const uniqueResults = [];
  const seenUrls = new Set();
  for (const res of allResults) {
    if (res.link && !seenUrls.has(res.link)) {
      seenUrls.add(res.link);
      uniqueResults.push(res);
    }
  }

  console.log(`Found ${uniqueResults.length} unique search results. Extracting data via Groq...`);

  const searchContext = uniqueResults.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.link}`).join('\n\n');

  const prompt = `
You are an expert technology event researcher.
Below are several Google search results containing information about upcoming technology events in India.

Your task is to extract all upcoming technology conferences, expos, startup events, AI conferences, cloud events, cybersecurity events, SaaS conferences, and developer meetups happening in India.

For each event, extract the following:
- eventName
- date (be as specific as possible)
- sortDate (the exact start date of the event in YYYY-MM-DD format)
- city
- venue
- category (e.g., AI, Startup, SaaS, Cloud, Cybersecurity, Developer)
- shortDescription (1-2 sentences)
- websiteLink (the URL from the search results or the official website)

Rules:
1. ONLY include events happening in the next 6 months (between ${currentMonthStr} and ${futureMonthStr}).
2. ONLY include events happening in India.
3. Remove any duplicate events.
4. Output STRICTLY in JSON format with a single key "events" containing the array of event objects. Do not include any markdown wrappers like \`\`\`json.
5. IMPORTANT: Sort the final array of events chronologically from earliest to latest based on the sortDate.

Search Results:
${searchContext}
  `;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const textOutput = response.choices[0]?.message?.content || "";
    let events = [];
    try {
      const parsed = JSON.parse(textOutput);
      events = parsed.events || [];
      
      // Sort events chronologically to be absolutely sure
      events.sort((a, b) => {
        if (!a.sortDate || !b.sortDate) return 0;
        return new Date(a.sortDate) - new Date(b.sortDate);
      });
      
    } catch (e) {
      console.error('Failed to parse JSON from Groq:', textOutput);
      return [];
    }

    return events;
  } catch (error) {
    console.error('Error generating content with Groq:', error);
    return [];
  }
}

function generateHtmlEmail(events) {
  if (!events || events.length === 0) {
    return '<h2>No upcoming tech events found this week.</h2>';
  }

  let rows = events.map(event => `
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd;"><strong>${event.eventName || 'N/A'}</strong></td>
      <td style="padding: 12px; border: 1px solid #ddd;">${event.date || 'N/A'}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${event.city || 'N/A'}<br><small style="color: #666;">${event.venue || ''}</small></td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${event.category || 'Tech'}
        </span>
      </td>
      <td style="padding: 12px; border: 1px solid #ddd;">${event.shortDescription || 'N/A'}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">
        ${event.websiteLink && event.websiteLink !== 'N/A' ? `<a href="${event.websiteLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View Event</a>` : 'No Link'}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 900px; margin: 0 auto;">
      <h2 style="color: #1e40af; text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
        Upcoming Indian Tech Events
      </h2>
      <p style="text-align: center; color: #555;">Here is your weekly roundup of technology events, conferences, and meetups happening across India.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Event</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Date</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Location</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Category</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Description</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Link</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      
      <p style="text-align: center; font-size: 12px; color: #888; margin-top: 30px;">
        Automated Weekly Workflow - Antigravity Bot
      </p>
    </div>
  `;
}

async function sendEmail(htmlContent) {
  console.log('Sending email...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: `"Tech Events Bot" <${process.env.GMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    subject: `Weekly Tech Events in India - ${new Date().toLocaleDateString()}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function main() {
  try {
    const events = await searchEvents();
    console.log(`Extracted ${events.length} events.`);
    
    if (events.length > 0) {
      console.log('Sample Event:', events[0]);
    }

    const htmlEmail = generateHtmlEmail(events);
    await sendEmail(htmlEmail);
    console.log('Workflow completed successfully.');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

main();
