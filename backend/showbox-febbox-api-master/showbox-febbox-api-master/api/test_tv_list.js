import ShowboxAPI from './src/ShowboxAPI.js';

(async () => {
    const api = new ShowboxAPI();

    // Test TV_list
    try {
        console.log("Testing TV_list...");
        const res = await api.request('TV_list', { page: 1, pagelimit: 5, sort: 'release_date' });
        console.log(res.data ? `TV_list success: ${res.data.length} items. First item title: ${res.data[0].title || res.data[0].display_title}` : `TV_list response: JSON`);
    } catch (e) {
        console.error("TV_list failed", e);
    }
})();
