// Store tokens
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// API call with auto-refresh
async function apiCall(url, options) {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });

    // If 401, try to refresh
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        const refreshResponse = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const refreshData = await refreshResponse.json();

        // Store new tokens
        localStorage.setItem('accessToken', refreshData.data.accessToken);
        localStorage.setItem('refreshToken', refreshData.data.refreshToken);

        // Retry original request
        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${refreshData.data.accessToken}`
            }
        });
    }

    return response;
}
