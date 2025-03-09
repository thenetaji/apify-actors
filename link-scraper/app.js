import { Actor, log } from 'apify';
import { CheerioCrawler, createCheerioRouter } from 'crawlee';
import { URL } from 'url';
import { normalizeUrl, createMediaLinkDetector } from './utils.js';

if(process.env.NODE_ENV == "production"){
  log.setLevel(log.LEVELS.INFO);
} else {
  log.setLevel(log.LEVELS.DEBUG);
}

await Actor.init();

try {
    const input = await Actor.getInput();
    log.info('Actor input loaded', { input });
    
    const {
        startUrls,
        mediaType = 'all',
        maxCrawlDepth = 1,
        maxConcurrency = 10,
        maxRequestRetries = 3,
        maxUrlsToCrawl = 100,
        useProxy = {},
    } = input;
    
    const { useApifyProxy = false, apifyProxyGroups = [], apifyProxyCountry } = useProxy;
    
    let proxyConfig;
    if (useApifyProxy) {
        log.info('Setting up Apify proxy', { 
            groups: apifyProxyGroups, 
            countryCode: apifyProxyCountry 
        });
        
        proxyConfig = await Actor.createProxyConfiguration({
            groups: apifyProxyGroups,
            countryCode: apifyProxyCountry || undefined,
        });
        
        log.info('Proxy configuration created', { 
            proxyUrl: proxyConfig.newUrl() 
        });
    } else {
        log.info('Running without proxy');
    }

    log.info('Starting Media Download Link Crawler...', {
        mediaType,
        maxCrawlDepth,
        maxConcurrency,
        maxUrlsToCrawl // Log the max URLs limit
    });

    if (!startUrls || !Array.isArray(startUrls) || startUrls.length === 0) {
        throw new Error('Input parameter "startUrls" must be a non-empty array!');
    }

    // Initialize the request queue for crawler
    const requestQueue = await Actor.openRequestQueue();
    log.info('Request queue initialized');
    
    // Track crawled URLs count
    let crawledUrlsCount = 0;
    
    // Add start URLs to the queue
    for (const startUrl of startUrls) {
        const url = startUrl.url || startUrl;
        await requestQueue.addRequest({
            url: url,
            userData: { depth: 0 }
        });
        log.debug('Added start URL to queue', { url });
    }
    
    // Create media link detector based on selected type
    const isMediaLink = createMediaLinkDetector(mediaType);
    log.debug('Media link detector created', { mediaType });
    
    // Create Cheerio router
    const router = createCheerioRouter();

    // Define route for handling pages
    router.addDefaultHandler(async ({ request, $, log }) => {
        const { url, loadedUrl } = request;
        const { depth = 0 } = request.userData;
        
        // Increment the crawled URLs counter
        crawledUrlsCount++;
        
        log.info(`Processing page (${crawledUrlsCount}/${maxUrlsToCrawl})`, { 
            url, 
            depth,
            remainingUrls: maxUrlsToCrawl - crawledUrlsCount
        });

        // Extract all links from the page
        const links = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                try {
                    const absoluteUrl = new URL(href, loadedUrl).href;
                    links.push(absoluteUrl);
                } catch (e) {
                    log.warning('Failed to parse URL', { href, error: e.message });
                }
            }
        });
        log.debug(`Found ${links.length} links on page`);

        // Find media links on the current page based on selected type
        const mediaLinks = [];
        
        // Different selectors based on media type
        let selectors = [];
        switch (mediaType) {
            case 'video':
                selectors = ['video source[src]', 'a[href*=".mp4"]', 'a[href*=".webm"]', 
                            'video[src]', 'iframe[src*="youtube"]', 'iframe[src*="vimeo"]'];
                break;
            case 'audio':
                selectors = ['audio source[src]', 'a[href*=".mp3"]', 'a[href*=".wav"]', 
                            'a[href*=".ogg"]', 'audio[src]'];
                break;
            case 'image':
                selectors = ['img[src]', 'a[href*=".jpg"]', 'a[href*=".jpeg"]', 
                            'a[href*=".png"]', 'a[href*=".gif"]', 'a[href*=".webp"]'];
                break;
            case 'all':
                selectors = ['video source[src]', 'audio source[src]', 'img[src]', 
                            'a[href]', 'source[src]', 'iframe[src]'];
                break;
        }
        
        // Extract media using the selectors
        selectors.forEach(selector => {
            $(selector).each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('href');
                if (src) {
                    try {
                        const absoluteUrl = new URL(src, loadedUrl).href;
                        if (isMediaLink(absoluteUrl)) {
                            mediaLinks.push({
                                url: absoluteUrl,
                                sourceUrl: loadedUrl,
                                title: $('title').text().trim() || absoluteUrl,
                                type: determineMediaType(absoluteUrl, mediaType),
                                foundAt: new Date().toISOString(),
                            });
                        }
                    } catch (e) {
                        log.warning('Failed to process media URL', { src, error: e.message });
                    }
                }
            });
        });
        log.debug(`Found ${mediaLinks.length} media links on page`);

        // Save found media links to the dataset
        if (mediaLinks.length > 0) {
            try {
                const dataToSave = {
                    sourceUrl: loadedUrl,
                    pageTitle: $('title').text().trim(),
                    mediaLinks,
                    timestamp: new Date().toISOString(),
                };
                
                log.info(`Saving ${mediaLinks.length} media links to dataset`, { 
                    sourceUrl: loadedUrl,
                    sampleLink: mediaLinks[0].url
                });
                
                // Make sure to await the pushData call
                await Actor.pushData(dataToSave);
                
                log.debug('Successfully saved data to dataset', {
                    sourceUrl: loadedUrl,
                    mediaLinksCount: mediaLinks.length
                });
            } catch (error) {
                log.error('Failed to save data to dataset', { 
                    error: error.message,
                    stack: error.stack 
                });
            }
        } else {
            log.debug('No media links found on page, skipping dataset save');
        }

        // Check if we've reached the maximum URLs limit
        if (crawledUrlsCount >= maxUrlsToCrawl) {
            log.info(`Reached maximum URL limit of ${maxUrlsToCrawl}. Stopping further URL enqueuing.`);
            return;
        }

        // Enqueue more links for crawling if not at max depth
        if (depth < maxCrawlDepth) {
            // Stay on the same domain as the start URL
            const startDomain = new URL(startUrls[0].url || startUrls[0]).hostname;
            let enqueueCount = 0;
            
            // Calculate how many more URLs we can potentially add
            const remainingUrlsQuota = maxUrlsToCrawl - crawledUrlsCount;
            // Get current pending requests count to understand how many more we can add
            const { pendingRequestCount } = await requestQueue.getInfo();
            // Calculate remaining capacity (leave room for some URLs that are already in the queue)
            const remainingCapacity = Math.max(0, remainingUrlsQuota - pendingRequestCount);
            
            if (remainingCapacity <= 0) {
                log.info('URL quota filled by pending requests. Not enqueueing more URLs.');
                return;
            }
            
            // Limit the number of URLs to process from this page
            const urlsToProcess = links.slice(0, remainingCapacity);
            
            log.debug(`Processing ${urlsToProcess.length} URLs out of ${links.length} found (quota: ${remainingCapacity})`, {
                pendingRequests: pendingRequestCount,
                maxUrls: maxUrlsToCrawl,
                crawledSoFar: crawledUrlsCount
            });
            
            for (const link of urlsToProcess) {
                try {
                    const linkUrl = new URL(link);
                    const normalizedUrl = normalizeUrl(link);
                    
                    // Only follow links on the same domain
                    if (linkUrl.hostname === startDomain) {
                        await requestQueue.addRequest({
                            url: normalizedUrl,
                            userData: {
                                depth: depth + 1,
                            }
                        }, { forefront: false });
                        enqueueCount++;
                    }
                } catch (e) {
                    log.warning('Failed to enqueue URL for crawling', { 
                        link, 
                        error: e.message 
                    });
                }
            }
            log.debug(`Enqueued ${enqueueCount} new URLs for crawling`, { 
                currentDepth: depth, 
                maxDepth: maxCrawlDepth,
                totalCrawledSoFar: crawledUrlsCount,
                maxUrlLimit: maxUrlsToCrawl
            });
        } else {
            log.debug('Max crawl depth reached, not enqueueing new URLs', { 
                currentDepth: depth, 
                maxDepth: maxCrawlDepth 
            });
        }
    });

    // Initialize crawler with or without proxy based on user preference
    const crawler = new CheerioCrawler({
        requestQueue,
        maxConcurrency,
        maxRequestRetries,
        proxyConfiguration: useApifyProxy ? proxyConfig : undefined,
        requestHandler: router,
        // Add advanced options for better reliability
        navigationTimeoutSecs: 60,
        ignoreSslErrors: true,
        additionalMimeTypes: ['application/json', 'text/xml'],
        failedRequestHandler: ({ request, error }) => {
            log.error('Request failed', { 
                url: request.url, 
                errorMessage: error.message 
            });
        },
        // Stop crawling when maxUrlsToCrawl is reached
        maxRequestsPerCrawl: maxUrlsToCrawl,
    });
    
    log.info('Starting the crawler', { 
        startUrlsCount: startUrls.length, 
        maxConcurrency,
        maxUrlsToCrawl
    });

    await crawler.run();
    
    const { defaultDatasetId } = Actor.getEnv();
    log.info('Crawler finished successfully!', { 
        defaultDatasetId,
        totalUrlsCrawled: crawledUrlsCount,
        maxUrlLimit: maxUrlsToCrawl,
        datasetLink: `https://console.apify.com/actors/runs/${Actor.getEnv().actorRunId}/dataset`
    });
    
} catch (error) {
    log.error('Actor failed', { 
        errorMessage: error.message,
        stack: error.stack
    });
    throw error;
} finally {
    log.info('Actor is exiting');
    await Actor.exit();
}

function determineMediaType(url, defaultType) {
    const videoExts = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)(\?.*)?$/i;
    const audioExts = /\.(mp3|wav|ogg|aac|flac|m4a)(\?.*)?$/i;
    const imageExts = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i;
    
    if (videoExts.test(url)) return 'video';
    if (audioExts.test(url)) return 'audio';
    if (imageExts.test(url)) return 'image';
    
    return defaultType;
}