const axios = require('axios');

async function yts(query, page = '1') {
    // 1. Use the Official YTS API to avoid Cloudflare blocks
    const url = `https://yts.lt/api/v2/list_movies.json?query_term=${query}&page=${page}`;

    try {
        const response = await axios.get(url);
        
        if (!response.data || !response.data.data || !response.data.data.movies) {
            return []; // Return an empty array if no movies are found
        }

        const movies = response.data.data.movies;
        let all = [];

        // Map the API data to the format your frontend expects
        movies.forEach(movie => {
            const trackers = "&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce";

            const data = {
                'Name': movie.title,
                'ReleasedDate': movie.year.toString(),
                'Genre': movie.genres ? movie.genres.join(', ') : 'N/A',
                'Rating': `${movie.rating} ⭐`,
                'Likes': 'N/A',
                'Runtime': `${movie.runtime} min`,
                'Language': movie.language,
                'Url': movie.url,
                'Poster': movie.medium_cover_image,
                'Files': []
            };

            if (movie.torrents) {
                movie.torrents.forEach(torrent => {
                    data.Files.push({
                        Quality: torrent.quality,
                        Type: torrent.type,
                        Size: torrent.size,
                        Torrent: torrent.url,
                        Magnet: `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}${trackers}`
                    });
                });
            }
            all.push(data);
        });

        return all;

    } catch (error) {
        console.error("YTS API Error:", error.message);
        return null; // Let app.js handle the null response
    }
}

// 2. THIS IS THE FIX for "TypeError: scrapYts.yts is not a function"
module.exports = {
    yts: yts
};
