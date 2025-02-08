const scrap1337x = require('./1337x');
const scrapNyaa = require('./nyaaSI');
const scrapYts = require('./yts');
const scrapPirateBay = require('./pirateBay');
const scrapTorLock = require('./torLock');
const scrapEzTVio = require('./ezTV');
const torrentGalaxy = require('./torrentGalaxy');
const rarbg = require('./rarbg');
const zooqle = require('./zooqle');
const kickAss = require('./kickAss');
const bitSearch = require('./bitSearch');
const glodls = require('./gloTorrents');
const magnet_dl = require('./magnet_dl');
const limeTorrent = require('./limeTorrent');
const torrentFunk = require('./torrentFunk');
const torrentProject = require('./torrentProject');


async function combo(query, page) {
    try {
        const results = await Promise.all([
            torrentGalaxy(query, page).catch(e => { console.error("torrentGalaxy error:", e); return []; }),
            scrapNyaa.nyaaSI(query, page).catch(e => { console.error("nyaaSI error:", e); return []; }),
            scrapYts.yts(query, page).catch(e => { console.error("yts error:", e); return []; }),
            scrapPirateBay.pirateBay(query, page).catch(e => { console.error("pirateBay error:", e); return []; }),
            scrapTorLock.torLock(query, page).catch(e => { console.error("torLock error:", e); return []; }),
            scrapEzTVio.ezTV(query).catch(e => { console.error("ezTV error:", e); return []; }),
            scrap1337x.torrent1337x(query, page).catch(e => { console.error("1337x error:", e); return []; }),
            rarbg(query, page).catch(e => { console.error("rarbg error:", e); return []; }),
            zooqle.zooqle(query, page).catch(e => { console.error("zooqle error:", e); return []; }),
            kickAss(query, page).catch(e => { console.error("kickAss error:", e); return []; }),
            bitSearch(query, page).catch(e => { console.error("bitSearch error:", e); return []; }),
            glodls(query, page).catch(e => { console.error("glodls error:", e); return []; }),
            magnet_dl(query, page).catch(e => { console.error("magnet_dl error:", e); return []; }),
            limeTorrent(query, page).catch(e => { console.error("limeTorrent error:", e); return []; }),
            torrentFunk(query, page).catch(e => { console.error("torrentFunk error:", e); return []; }),
            torrentProject(query, page).catch(e => { console.error("torrentProject error:", e); return []; })
        ]);

        // Use flatMap to combine results.  No need for null check now.
        const flattenedResults = results.flat();
        return flattenedResults;

    } catch (error) {
        console.error("An error occurred in combo:", error);
        return []; // Return an empty array in case of a general error
    }
}
module.exports = combo;
