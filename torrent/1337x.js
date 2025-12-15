const cheerio = require('cheerio');
const axios = require('axios');

// List of mirrors to try (Updated for 2025)
const domains = [
    'https://1377x.to',       // Very popular alternative
    'https://x1337x.se',      // Swedish mirror, often works
    'https://x1337x.eu',      // EU mirror
    'https://1337x.tw',       // Taiwan mirror
    'https://1337x.st',       // Standard mirror
    'https://x1337x.ws',      // Standard mirror
    'https://1337x.to'        // Official (Blocked often, kept as last resort)
];

async function torrent1337x(query = '', page = '1') {
    let allTorrent = [];
    let html = null;
    let activeDomain = '';

    // Loop through mirrors until one works
    for (const domain of domains) {
        try {
            const url = `${domain}/search/${query}/${page}/`;
            console.log(`Trying 1337x mirror: ${domain}...`);

            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Referer": "https://www.google.com/"
                },
                timeout: 6000 // 6 second timeout per mirror
            });

            // Check if we got a valid page (not Cloudflare, not 404/403)
            if (response.data && !response.data.includes("Just a moment") && !response.data.includes("Cloudflare")) {
                html = response.data;
                activeDomain = domain;
                console.log(`Success with: ${domain}`);
                break; // Stop looping, we found a working one!
            }
        } catch (err) {
            // console.log(`Failed: ${domain}`);
            continue; // Try the next mirror
        }
    }

    if (!html) {
        console.error("All 1337x mirrors failed or are blocked.");
        return null;
    }

    const $ = cheerio.load(html);
    const links = [];

    $('table.table-list tr').each((_, element) => {
        const linkTag = $(element).find('td.name a').eq(1); 
        let link = linkTag.attr('href');
        if (link) {
            if (!link.startsWith('http')) {
                link = activeDomain + link;
            }
            links.push(link);
        }
    });

    // Limit detail requests to 5 to avoid getting banned during the detail fetch
    const limitedLinks = links.slice(0, 5);

    await Promise.all(limitedLinks.map(async (linkUrl) => {
        try {
            const detailRes = await axios.get(linkUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                timeout: 5000
            });
            
            const $$ = cheerio.load(detailRes.data);
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

        } catch (err) {}
    }));

    return allTorrent;
}

module.exports = {
    torrent1337x: torrent1337x
};
