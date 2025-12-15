const cheerio = require('cheerio');
const axios = require('axios');

async function yts(query, page = '1') {
    let all = [];
    let ALLURL = [];
    
    // 1. FIXED URL: YTS uses /browse-movies/ for search, not /movies/
    const baseUrl = "https://yts.lt/browse-movies/";
    const searchPath = `${query}/all/all/0/latest/0/all`;
    const url = page === '1' || page === '' 
        ? `${baseUrl}${searchPath}` 
        : `${baseUrl}${searchPath}?page=${page}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }
        });

        const $ = cheerio.load(response.data);

        // 2. UPDATED SELECTOR: Find the movie links from the wrap container
        $('.browse-movie-wrap').each((_, element) => {
            let movieUrl = $(element).find('a.browse-movie-link').attr('href');
            if (movieUrl) ALLURL.push(movieUrl);
        });

        // Use Promise.all to fetch details for each movie
        await Promise.all(ALLURL.map(async (movieUrl) => {
            try {
                const res = await axios.get(movieUrl, {
                    headers: { "User-Agent": "Mozilla/5.0..." }
                });
                const $$ = cheerio.load(res.data);

                const data = {
                    'Name': $$('div.hidden-xs h1').text().trim(),
                    'ReleasedDate': $$('div.hidden-xs h2').eq(0).text().trim(),
                    'Genre': $$('div.hidden-xs h2').eq(1).text().trim(),
                    'Rating': $$('span[itemprop="ratingValue"]').text().trim() + ' ⭐',
                    'Likes': $$('#movie-likes').text().trim(),
                    'Runtime': $$('.tech-spec-element').contains('min').text().trim() || "N/A",
                    'Language': $$('.tech-spec-element').first().text().trim(), // Usually first spec
                    'Url': movieUrl,
                    'Poster': $$('#movie-poster img').attr('src'),
                    'Files': []
                };

                // 3. UPDATED TORRENT LOGIC: YTS usually lists torrents in a specific container
                $$('.modal-download .modal-content .modal-torrent').each((_, ele) => {
                    data.Files.push({
                        Quality: $$(ele).find('.modal-quality').text().trim(),
                        Type: $$(ele).find('p:contains("File type")').text().replace('File type:', '').trim(),
                        Size: $$(ele).find('p:contains("File size")').text().replace('File size:', '').trim(),
                        Torrent: $$(ele).find('a.download-torrent-button').attr('href'),
                        Magnet: $$(ele).find('a.magnet-download').attr('href')
                    });
                });

                all.push(data);
            } catch (err) {
                // Individual movie page failed (likely Cloudflare block)
            }
        }));

        return all;
    } catch (error) {
        console.error("Error fetching YTS search results:", error.message);
        return null;
    }
}

module.exports = { yts };
