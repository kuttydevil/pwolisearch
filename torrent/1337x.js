const cheerio = require('cheerio');
const axios = require('axios');

async function torrent1337x(query = '', page = '1') {
    const allTorrent = [];
    
    // 1. UPDATE THE DOMAIN
    // The previous domain '1337xx.to' is dead/blocked.
    // '1337x.to' is the official one. '1337x.st' is a common mirror.
    // If you specifically want to use '.icu', change this to 'https://1337x.icu'
    const domain = 'https://1337x.to'; 
    
    const url = `${domain}/search/${query}/${page}/`;

    try {
        const html = await axios.get(url, {
            // 2. ADD HEADERS to avoid "Website is blocked" error
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(html.data);

        const links = [];
        // Extract links from the search results table
        $('table.table-list tr').each((_, element) => {
            // In 1337x, the second link inside td.name is the torrent link
            const linkTag = $(element).find('td.name a').eq(1); 
            let link = linkTag.attr('href');
            if (link) {
                if (!link.startsWith('http')) {
                    link = domain + link;
                }
                links.push(link);
            }
        });

        // 3. FETCH DETAILS FOR EACH LINK
        await Promise.all(links.map(async (linkUrl) => {
            try {
                const detailHtml = await axios.get(linkUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
                    }
                });
                
                const $$ = cheerio.load(detailHtml.data);
                const data = {};

                data.Name = $$('.box-info-heading h1').text().trim();
                data.Magnet = $$('a[href^="magnet:?"]').first().attr('href') || "";
                data.Url = linkUrl;

                const poster = $$('.torrent-image img').attr('src');
                if (poster) {
                    data.Poster = poster.startsWith('http') ? poster : 'https:' + poster;
                } else {
                    data.Poster = '';
                }

                // Extract Metadata using specific list items
                data.Category = $$('ul.list li:contains("Category") span').text().trim();
                data.Type = $$('ul.list li:contains("Type") span').text().trim();
                data.Language = $$('ul.list li:contains("Language") span').text().trim();
                data.Size = $$('ul.list li:contains("Total size") span').text().trim();
                data.UploadedBy = $$('ul.list li:contains("Uploaded By") span a').text().trim();
                data.Downloads = $$('ul.list li:contains("Downloads") span').text().trim();
                data.DateUploaded = $$('ul.list li:contains("Date uploaded") span').text().trim();
                data.Seeders = $$('.seeds').text().trim();
                data.Leechers = $$('.leechs').text().trim();

                if (data.Name) {
                    allTorrent.push(data);
                }

            } catch (err) {
                // Skip this single torrent if it fails
            }
        }));

        return allTorrent;

    } catch (error) {
        // This causes the "Website is blocked change IP" message in app.js
        console.error("1337x Main Search Error:", error.message);
        return null;
    }
}

module.exports = {
    torrent1337x: torrent1337x
};
