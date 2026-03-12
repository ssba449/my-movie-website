import ShowboxAPI from './src/ShowboxAPI.js';

(async () => {
    const api = new ShowboxAPI();
    try {
        console.log("Fetching home...");
        // Index is missing. Other common endpoints: Home, Home_list, Get_list
        const details = await api.request('Home_list');
        console.log(JSON.stringify(details).substring(0, 1500));
    } catch (e) {
        console.error(e);
    }
})();
