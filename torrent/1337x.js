const cheerio = require('cheerio');
const axios = require('axios');

async function torrent1337x(query = '', page = '1') {
    const allTorrent = [];
    // 1337x has multiple domains (1337x.to, 1377x.to). 
    // The HTML provided uses relative links, so we need a base URL.
    const baseUrl = 'https://www.1377x.to'; 
    const url = `${baseUrl}/search/${query}/${page}/`;

    // 1. Add Headers to mimic a real browser to bypass basic blocking
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': baseUrl
    };

    let html;
    try {
        html = await axios.get(url, { headers });
    } catch (err) {
        console.error("Search Page Error:", err.message);
        return null;
    }

    const $ = cheerio.load(html.data);

    // 2. Extract links using a more specific selector based on your HTML dump
    // HTML: <td class="coll-1 name"><a ...icon></a><a href="/torrent/...">Title</a></td>
    const links = $('table.table-list tbody tr').map((_, element) => {
        const linkHref = $(element).find('td.name a[href^="/torrent/"]').attr('href');
        return linkHref ? baseUrl + linkHref : null;
    }).get().filter(link => link !== null); // Filter out any nulls

    if (links.length === 0) {
        console.log("No links found. Possible Cloudflare block or no results.");
        return [];
    }

    // 3. Process detail pages
    await Promise.all(links.map(async (element) => {
        try {
            const data = {};
            // Re-use headers for the detail page
            const detailHtml = await axios.get(element, { headers });
            const $ = cheerio.load(detailHtml.data);

            data.Name = $('.box-info-heading h1').text().trim();
            // Specific selector for magnet link to avoid getting random links
            data.Magnet = $('a[href^="magnet:?"]').attr('href') || "";
            
            const poster = $('div.torrent-image img').attr('src');
            if (poster) {
                data.Poster = poster.startsWith('http') ? poster : 'https:' + poster;
            } else {
                data.Poster = '';
            }

            // Using the labels from your original code, but mapping them safely
            // Note: 1337x detail page structure for these li elements is usually:
            // Category, Type, Language, Size, Uploaded By, Downloads, Last Checked, Date Uploaded, Seeds, Leechers
            const labels = ['Category', 'Type', 'Language', 'Size', 'UploadedBy', 'Downloads', 'LastChecked', 'DateUploaded', 'Seeders', 'Leechers'];
            
            $('.torrent-category-small li, .list li').each((i, el) => {
                 // The text is often inside a <span> or just inside the li. 
                 // We clean it to remove label text like "Category:" if it exists
                 let text = $(el).find('span').text().trim();
                 if(!text) text = $(el).text().trim();
                 
                 if (labels[i]) {
                     data[labels[i]] = text;
                 }
            });

            data.Url = element;
            allTorrent.push(data);
        } catch (err) {
            console.error(`Error scraping detail page ${element}:`, err.message);
            // Don't return null here, just skip this specific torrent
        }
    }));

    return allTorrent;
}

torrent1337x.customName = "1337x";
module.exports = torrent1337x;
