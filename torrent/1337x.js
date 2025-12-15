const cheerio = require('cheerio');
const axios = require('axios');

async function torrent1337x(query = '', page = '1') {
    const allTorrent = [];
    
    // 1. USE A MIRROR DOMAIN
    // .to is heavily blocked. .st, .ws, .se are official mirrors.
    // .st usually works better for scraping.
    const domain = 'https://1337x.st'; 
    
    const url = `${domain}/search/${query}/${page}/`;

    // 2. ENHANCED HEADERS to bypass 403 Forbidden
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": `${domain}/`,
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    };

    try {
        const html = await axios.get(url, { headers: headers });
        const $ = cheerio.load(html.data);
        const links = [];

        // Extract search result links
        $('table.table-list tr').each((_, element) => {
            const linkTag = $(element).find('td.name a').eq(1); 
            let link = linkTag.attr('href');
            if (link) {
                if (!link.startsWith('http')) {
                    link = domain + link;
                }
                links.push(link);
            }
        });

        // 3. FETCH DETAILS (Sequential loop is safer for 403 than Promise.all)
        // We use Promise.all here for speed, but if it fails again, we might need to slow it down.
        await Promise.all(links.map(async (linkUrl) => {
            try {
                const detailHtml = await axios.get(linkUrl, { headers: headers });
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
                // If specific page fails, just skip it
            }
        }));

        return allTorrent;

    } catch (error) {
        // If the main search page returns 403, we log it
        console.error(`1337x Error (${domain}):`, error.message);
        return null;
    }
}

module.exports = {
    torrent1337x: torrent1337x
};
