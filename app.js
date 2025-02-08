const express = require('express');
const path = require('path');
const scrap1337x = require('./torrent/1337x');
const scrapNyaa = require('./torrent/nyaaSI');
const scrapYts = require('./torrent/yts');
const scrapPirateBay = require('./torrent/pirateBay');
const scrapTorLock = require('./torrent/torLock');
const scrapEzTVio = require('./torrent/ezTV');
const torrentGalaxy = require('./torrent/torrentGalaxy');
const combo = require('./torrent/COMBO');
const rarbg = require('./torrent/rarbg');
const ettvCentral = require('./torrent/ettv');
const zooqle = require('./torrent/zooqle');
const kickAss = require('./torrent/kickAss');
const bitSearch = require('./torrent/bitSearch');
const glodls = require('./torrent/gloTorrents');
const magnet_dl = require('./torrent/magnet_dl');
const limeTorrent = require('./torrent/limeTorrent');
const torrentFunk = require('./torrent/torrentFunk');
const torrentProject = require('./torrent/torrentProject');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/:website/:query/:page?', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let website = (req.params.website).toLowerCase();
    let query = req.params.query;
    let page = req.params.page;

    // Helper function for LESS STRICT filtering
    function filterResults(results, query) {
        if (!results) {
            return [];
        }
        const queryWords = query.toLowerCase().split(/\s+/);

        return results.filter(item => {
            if (!item || !item.name) {
                return false;
            }
            const title = item.name.toLowerCase();
            // Use 'some' instead of 'every' - match ANY word
            return queryWords.some(word => title.includes(word));
        });
    }

    // --- Scraper calls (using the new filterResults) ---
    if (website === '1337x') {
        if (page > 50) {
            return res.json({ error: 'Please enter page value less than 51' });
        }
        scrap1337x.torrent1337x(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'yts') {
        scrapYts.yts(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'eztv') {
        scrapEzTVio.ezTV(query)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'torlock') {
        scrapTorLock.torLock(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'piratebay') {
        scrapPirateBay.pirateBay(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'tgx') {
        torrentGalaxy(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'rarbg') {
        rarbg(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'zooqle') {
        zooqle.zooqle(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'kickass') {
        kickAss(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'bitsearch') {
        bitSearch(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'glodls') {
        glodls(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'magnetdl') {
        magnet_dl(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'limetorrent') {
        limeTorrent(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'torrentfunk') {
        torrentFunk(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === 'torrentproject') {
        torrentProject(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    if (website === 'nyaasi') {
        if (page > 14) {
            return res.json({ error: '14 is the last page' });
        }
        scrapNyaa.nyaaSI(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }
    if (website === "ettv") {
        ettvCentral(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const filteredData = filterResults(data, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;

    }
    if (website === "all") {
        combo(query, page)
            .then(data => {
                if (!data) return res.json({ error: 'Website is blocked or no results' });
                const flattenedData = data.flat(); // Flatten for 'all'
                const filteredData = filterResults(flattenedData, query);
                if (filteredData.length === 0) return res.json({ error: 'No matching results' });
                res.json(filteredData);
            }).catch(next);
        return;
    }

    // If none of the above matched, the website is invalid
    return res.json({
        error: 'Please select a valid website: 1337x, nyaasi, yts, piratebay, torlock, eztv, tgx, rarbg, zooqle, kickass, bitsearch, glodls, magnetdl, limetorrent, torrentfunk, torrentproject, or all'
    });
});

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
console.log('Listening on PORT : ', PORT);
app.listen(PORT);
