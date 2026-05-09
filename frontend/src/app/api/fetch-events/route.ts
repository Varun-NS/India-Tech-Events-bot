import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import axios from "axios";
import { TechEvent } from "@/types";

export async function POST() {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const serperApiKey = process.env.SERPER_API_KEY;

    if (!groqApiKey || !serperApiKey) {
      return NextResponse.json({ error: "Missing required API keys" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqApiKey });
    const events = await searchEvents(groq, serperApiKey);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching live events:", error);
    return NextResponse.json({ error: "Failed to fetch live events" }, { status: 500 });
  }
}

async function searchEvents(groq: Groq, serperApiKey: string): Promise<TechEvent[]> {
  console.log('Searching for upcoming tech events in India via Serper API...');
  
  const today = new Date();
  const currentMonthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthStr = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
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

  let allResults: any[] = [];

  for (const query of queries) {
    try {
      console.log(`Executing Serper search query: "${query}"`);
      const response = await axios.post(
        'https://google.serper.dev/search',
        { q: query, gl: 'in', num: 10 },
        { headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' } }
      );
      if (response.data && response.data.organic) {
        allResults = allResults.concat(response.data.organic);
      }
    } catch (error: any) {
      console.error(`Error searching for "${query}":`, error.response ? error.response.status : error.message);
    }
  }

  const uniqueResults: any[] = [];
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
    let events: TechEvent[] = [];
    try {
      const parsed = JSON.parse(textOutput);
      events = parsed.events || [];
      
      events.sort((a, b) => {
        if (!a.sortDate || !b.sortDate) return 0;
        return new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime();
      });
      
      events = events.map((event, index) => ({
        ...event,
        id: `live-${index}-${Date.now()}`
      }));
      
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
