const api = {
    async request(endpoint, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        try {
            const res = await fetch(`/api${endpoint}`, { ...options, headers });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }
};