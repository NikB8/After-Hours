
// Native fetch in Node 18+

async function debugApi() {
    const eventId = 'e31185dd-fb53-48a8-a082-ba83be0bd922';
    const url = `http://localhost:3000/api/v1/events/${eventId}/public`;
    console.log(`Fetching ${url}...`);

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('API Response Status:', res.status);
        console.log('Event Status:', data.status);
        console.log('Organizer:', data.organizer);

        const me = data.participants.find(p => p.email === 'nikhil@example.com');
        console.log('Me (nikhil@example.com) in participants?', !!me);
        if (me) console.log('My Details:', me);

    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

debugApi();
