@pelaxa/node-red-feedparser-with-end
========================

A modified version of [node-red-node-feedparser-extended](https://github.com/arossmann/node-red-contrib-feedparser-extended) 

Extended the input for injection, not only for timing, but also receiving the url as payload from previous step. 
This is good for debugging the flow or a flexible interval.

This node has two outputs:  
- The first is only called once the feed articles have been looped.  The payload in this case is the timestamp of the most recent article.
- The second is called for each article in the feed.

![](screenshot.png)


Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install @pelaxa/node-red-feedparser-with-end
