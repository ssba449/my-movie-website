import ShowboxAPI from './src/ShowboxAPI.js';

(async () => {
    const api = new ShowboxAPI();

    // Test Movie_list
    try {
        console.log("Testing Movie_list...");
        const res1 = await api.request('Movie_list', { page: 1, pagelimit: 5, sort: 'release_date' });
        console.log(res1.data ? `Movie_list success: ${res1.data.length} items` : `Movie_list response: ${JSON.stringify(res1).substring(0, 100)}`);
    } catch (e) {
        console.error("Movie_list failed", e);
    }

    // Test Top_list
    try {
        console.log("Testing Top_list...");
        const res2 = await api.request('Top_list', { page: 1, pagelimit: 5, type: 1 });
        console.log(res2.data ? `Top_list success: ${res2.data.length} items` : `Top_list response: ${JSON.stringify(res2).substring(0, 100)}`);
    } catch (e) {
        console.error("Top_list failed", e);
    }
})();
