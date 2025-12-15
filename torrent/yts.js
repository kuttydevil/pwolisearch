const axios = require('axios');

async function yts(query, page = '1') {
    // 1. Use the Official YTS API instead of scraping HTML
    const url = `https://yts.mx/api/v2/list_movies.json?query_term=${query}&page=${page}`;

    try {
        const response = await axios.get(url);
        
        // 2. Validate response structure
        if (!response.data || !response.data.data || !response.data.data.movies) {
            return []; // Return empty array if no movies found
        }

        const movies = response.data.data.movies;
        let all = [];

        // 3. Map API JSON to the format your Frontend expects
        movies.forEach(movie => {
            // Construct a standard tracker list for magnet links
            const trackers = "&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969";

            const data = {
                'Name': movie.title,
                'ReleasedDate': movie.year.toString(),
                'Genre': movie.genres ? movie.genres.join(', ') : 'N/A',
                'Rating': `${movie.rating} ⭐`,
                'Likes': 'N/A', // API doesn't provide like count in list view
                'Runtime': `${movie.runtime} min`,
                'Language': movie.language,
                'Url': movie.url,
                'Poster': movie.medium_cover_image,
                'Files': []
            };

            // 4. Process Torrents into Files array
            if (movie.torrents) {
                movie.torrents.forEach(torrent => {
                    let files = {};
                    files.Quality = torrent.quality;
                    files.Type = torrent.type;
                    files.Size = torrent.size;
                    files.Torrent = torrent.url;
                    // YTS API gives the hash, we must build the magnet link manually
                    files.Magnet = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}${trackers}`;
                    
                    data.Files.push(files);
                });
            }
            all.push(data);
        });

        return all;

    } catch (error) {
        // Return null to indicate a network/blocking error (handled in app.js)
        console.error("YTS API Error:", error.message);
        return null;
    }
}

module.exports = {
    yts: yts
};
