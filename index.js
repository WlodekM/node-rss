import RSS from 'rss';
import fs from 'fs';
import { parseString } from 'xml2js';
import { website } from "./web.js";

// Read the XML content from the file
const xmlContent = fs.readFileSync("public/rss.xml", 'utf-8');

export let rssFeed

// Parse the XML content into a JavaScript object using xml2js
parseString(xmlContent, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err);
  } else {
    // Extract feed information
    const feedInfo = result.rss.channel[0];

    // Construct an RSS object based on the parsed data
   rssFeed = new RSS({
      title: feedInfo.title[0],
      description: feedInfo.description[0],
      feed_url: feedInfo.link[0],
      site_url: feedInfo.link[0],
      language: feedInfo.language[0],
      pubDate: (feedInfo.pubDate ? feedInfo.pubDate[0] : null),
      lastBuildDate: feedInfo.lastBuildDate[0],
      ttl: (feedInfo.ttl ? feedInfo.ttl[0] : null),
      webMaster: (feedInfo.webMaster ? feedInfo.webMaster[0] : null),
      managingEditor: (feedInfo.managingEditor ? feedInfo.managingEditor[0] : null),
    });

    // Add items to the RSS object
    feedInfo.item.forEach((item) => {
      rssFeed.item({
        title: item.title[0],
        description: item.description[0],
        url: (item.link ? item.link[0] : null),
        guid: item.guid[0][0],
        date: (item.pubDate ? item.pubDate[0] : null),
      });
    });

    // Now you have an RSS object constructed from the parsed XML
    console.log('RSS Feed Object:', rssFeed);
    // Write the RSS feed to a file
    const xml = rssFeed.xml({ indent: true });
    fs.writeFileSync('public/rss2.xml', xml);
  }
});

website()