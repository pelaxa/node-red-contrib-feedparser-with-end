
module.exports = function (RED) {
    "use strict";
    var FeedParser = require("feedparser");
    var request = require("request");
    var url = require('url');

    function FeedParseNode(n) {
        RED.nodes.createNode(this, n);
        this.url = n.url;
        var node = this;
        this.seen = {};
        var parsedUrl = url.parse(this.url);
        if (!(parsedUrl.host || (parsedUrl.hostname && parsedUrl.port)) && !parsedUrl.isUnix) {
            this.error(RED._("feedparse-with-end.errors.invalidurl"));
        }
        else {
            var getFeed = function (msg) {
                var feed_url;
                if (msg.payload != null) {
                    feed_url = msg.payload;
                } else {
                    feed_url = node.url;
                }
                var req = request(feed_url, { timeout: 10000, pool: false });
                //req.setMaxListeners(50);
                req.setHeader('user-agent', 'Mozilla/5.0 (Node-RED)');
                req.setHeader('accept', 'text/html,application/xhtml+xml');

                var feedparser = new FeedParser();

                req.on('error', function (err) { node.error(err); });

                req.on('response', function (res) {
                    if (res.statusCode != 200) { node.warn(RED._("feedparse-with-end.errors.badstatuscode") + " " + res.statusCode); }
                    else { res.pipe(feedparser); }
                });

                feedparser.on('error', function (error) { node.error(error); });

                feedparser.on('readable', function () {
                    var stream = this, article;
                    while (article = stream.read()) {  // jshint ignore:line
                        if (!(article.guid in node.seen) || node.seen[article.guid] != article.date.getTime()) {
                            // Keep track of the latest article
                            if (!node.latestArticleTS || node.latestArticleTS < article.date.getTime()) {
                                node.latestArticleTS = article.date.getTime();
                            }
                            node.seen[article.guid] = article.date ? article.date.getTime() : 0;

                            msg.topic = article.origlink || article.link;
                            msg.payload = article.description;
                            msg.article = article;

                            node.send([null, msg]);
                        }
                    }
                });

                feedparser.on('meta', function (meta) { });
                feedparser.on('end', function () {
                    delete msg.topic;
                    delete msg.article
                    // Return the latest article's timestamp
                    msg.payload = node.latestArticleTS;
                    node.send(msg);
                });
            };
        }

        this.on("input", function (msg) {
            getFeed(msg);
        });
    }

    RED.nodes.registerType("feedparse-with-end", FeedParseNode);
}
