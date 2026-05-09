const { search } = require('duck-duck-scrape');

async function main() {
  try {
    const results = await search('upcoming tech events in India 2026');
    console.log(`Found ${results.results.length} results.`);
    if (results.results.length > 0) {
      console.log(results.results[0]);
    }
  } catch (error) {
    console.error(error);
  }
}

main();
