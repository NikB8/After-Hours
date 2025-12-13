
async function main() {
    const eventId = 'da71e667-b44a-421b-9679-8fe3335974f0';
    const url = `http://localhost:3000/api/v1/events/${eventId}/manage`;

    console.log(`Fetching from ${url}...`);

    try {
        const response = await fetch(url);

        console.log(`Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data received:');
            console.log('Event Sport:', data.event?.sport);
            console.log('Finance Summary:', data.financeSummary);
            console.log('Logistics Summary:', data.logisticsSummary);
            console.log('Authorized User:', data.currentUser?.email);
        } else {
            const error = await response.text();
            console.error('Error Response:', error);
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

main();
