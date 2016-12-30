'use strict';

// SEARCH ENGINE USER AGENT LIST FOR LOGGING REQUESTS FROM BOTS
var bots = {

    // Google Bots:
    "+http://www.googlebot.com/bot.html": "Google Web Search Bot", 
    "Googlebot-News": "Google News Bot", 
    "Googlebot-Image/1.0": "Google Image Bot",
    "Googlebot-Video/1.0": "Google Video Bot",
    "Mediapartners-Google": "Google Mediapartners",
    "AdsBot-Google (+http://www.google.com/adsbot.html)": "Google Ads Bot",

    // Bing Bot:
    "+http://www.bing.com/bingbot.htm": "Bing Bot",

    // Baidu Bot:
    "Baiduspider": "Baiduspider",
    "Baidu Web Search": "Baidu Web Search",
    "Baidu Image Search": "Baidu Image Search",
    "Baiduspider-image": "Baiduspider-image",
    "Baidu Mobile Search": "Baidu Mobile Search",
    "Baiduspider-mobile": "Baiduspider-mobile",
    "Baidu Video Search": "Baidu Video Search",
    "Baiduspider-video": "Baiduspider-video",
    "Baidu News Search": "Baidu News Search",
    "Baiduspider-news": "Baiduspider-news",
    "Baidu Bookmark Search": "Baidu Bookmark Search",
    "Baiduspider-favo": "Baiduspider-favo",
    "Baidu Union Search": "Baidu Union Search",
    "Baiduspider-cpro": "Baiduspider-cpro",
    "Baidu Business Search": "Baidu Business Search",
    "Baiduspider-ads": "Baiduspider-ads",
    "+http://www.baidu.com/search": "Baidu Search",

    // AOL:
    "Mozilla/5.0 (compatible; MSIE 9.0; AOL 9.7; AOLBuild 4343.19; Windows NT 6.1; WOW64; Trident/5.0; FunWebProducts)": "AOL",
    "Mozilla/4.0 (compatible; MSIE 8.0; AOL 9.7; AOLBuild 4343.27; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)": "AOL",
    "Mozilla/4.0 (compatible; MSIE 8.0; AOL 9.7; AOLBuild 4343.21; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C; .NET4.0E)": "AOL", 
    "Mozilla/4.0 (compatible; MSIE 8.0; AOL 9.7; AOLBuild 4343.19; Windows NT 5.1; Trident/4.0; GTB7.2; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)": "AOL",
    "Mozilla/4.0 (compatible; MSIE 8.0; AOL 9.7; AOLBuild 4343.19; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C; .NET4.0E)": "AOL",
    "Mozilla/4.0 (compatible; MSIE 7.0; AOL 9.7; AOLBuild 4343.19; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30; .NET CLR 3.0.04506.648; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C; .NET4.0E)": "AOL",

    // Yahoo!
    "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)": "Yahoo!"
};

module.exports = bots;