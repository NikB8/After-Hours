export { }; // Make this a module
async function main() {
    const eventId = 'da71e667-b44a-421b-9679-8fe3335974f0';
    const url = `http://localhost:3000/api/v1/events/${eventId}/public`;

    console.log(`Fetching public data from ${url}...`);

    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data received:');
            console.log('Sport:', data.sport);
            console.log('Venue:', data.venue);
            console.log('Participants:', data.participants);

            // Security Check
            if ('financeSummary' in data || 'actual_cost' in data) {
                console.error('FAIL: Sensitive finance data exposed!');
            } else {
                console.log('PASS: Finance data NOT exposed.');
            }
        } else {
            console.error('Error:', await response.text());
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

main();
