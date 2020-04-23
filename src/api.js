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

export const UNIT = Object.freeze({
   FAHRENHEIT: "imperial",
   CELSIUS: "metric",
   KELVIN: "kelvin"
});

export function getWeather({lat,lon}, units) {
    const API_KEY = "86ad87c076e4ca1d5d30d98e7ce72ced";
    if (units === UNIT.KELVIN) {
        return getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    }
    return getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`);
}