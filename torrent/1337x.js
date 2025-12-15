const cheerio = require('cheerio');
const axios = require('axios');

async function torrent1337x(query = '', page = '1') {
    const allTorrent = [];
    
    // 1. USE A DIFFERENT MIRROR
    // 'x1337x.ws' or 'x1337x.se' or '1337x.so' often have less Cloudflare protection than .to
    const domain = 'https://x1337x.ws'; 
    
    const url = `${domain}/search/${query}/${page}/`;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Referer": domain
            }
        });

        const $ = cheerio.load(response.data);

        // 2. CHECK FOR CLOUDFLARE BLOCK
        if ($('title').text().includes("Just a moment") || $('title').text().includes("Cloudflare")) {
            console.log("1337x Blocked by Cloudflare on this mirror.");
            return null; // Return null so app.js sends the error message
        }

        const links = [];
        
        // Extract links
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

        // 3. FETCH DETAILS
        await Promise.all(links.map(async (linkUrl) => {
            try {
                const detailRes = await axios.get(linkUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
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

    } catch (error) {
        console.error("1337x Error:", error.message);
        return null;
    }
}

module.exports = {
    torrent1337x: torrent1337x
};
