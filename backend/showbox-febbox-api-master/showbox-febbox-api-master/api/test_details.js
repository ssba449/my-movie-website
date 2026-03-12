import ShowboxAPI from './src/ShowboxAPI.js';

(async () => {
    const api = new ShowboxAPI();
    try {
        console.log("Fetching details...");
        const details = await api.getMovieDetails(899);
        console.log(JSON.stringify(details).substring(0, 1000));
    } catch (e) {
        console.error(e);
    }
})();
