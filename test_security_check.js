
// Test script to verify API security (401s)
async function testApiSecurity() {
    console.log("Testing API Security (expecting 401s)...");

    const endpoints = [
        { method: 'POST', url: 'http://localhost:3000/api/v1/events', body: { sport: 'Tennis' } },
        { method: 'POST', url: 'http://localhost:3000/api/v1/events/123/participant/notify_payment', body: { user_email: 'foo' } },
        { method: 'PUT', url: 'http://localhost:3000/api/v1/users/profile/skill', body: { skill_level: 'Pro' } }
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(ep.url, {
                method: ep.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ep.body)
            });

            console.log(`${ep.method} ${ep.url} -> Status: ${res.status}`);

            if (res.status === 401) {
                console.log("PASS: blocked as expected.");
            } else {
                console.warn("FAIL: expected 401, got " + res.status);
            }
        } catch (e) {
            console.error("Connection failed to " + ep.url);
        }
    }
}

testApiSecurity();
