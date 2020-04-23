/**
 * @param url - the url to fetch
 * @returns {Promise<any>}
 * @desc A utility function for fetching the JSON
 * response from an endpoint.
 */
async function getJSON(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        throw e;
    }
}

export function getWeather({lat,lon}) {
    const API_KEY = "86ad87c076e4ca1d5d30d98e7ce72ced";
    return getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
}