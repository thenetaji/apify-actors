import { Actor } from 'apify';
import { CheerioCrawler, RequestQueue } from 'crawlee';
import { gotScraping } from 'got-scraping';

// Initialize the Apify SDK
await Actor.init();

// Get input from the user
const input = await Actor.getInput() || {};
const {
    keywords = 'smartphone',  // Default search keyword
    maxProducts = 10,         // Maximum number of products to scrape
    proxyConfiguration = { useApifyProxy: true },
} = input;

const requestQueue = await RequestQueue.open();

// Add initial search URL to the queue
await requestQueue.addRequest({
    url: `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(keywords)}.html`,
    userData: {
        label: 'SEARCH',
    },
});

// Create a crawler
const crawler = new CheerioCrawler({
    requestQueue,
    maxRequestRetries: 5,
    navigationTimeoutSecs: 90,
    requestHandlerTimeoutSecs: 90,
    preNavigationHooks: [
        // Adding headers to mimic a real browser
        async ({ request }) => {
            request.headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.aliexpress.com/',
            };
        },
    ],
    async requestHandler({ request, body, $ }) {
        console.log(`Processing ${request.url}`);

        switch (request.userData.label) {
            case 'SEARCH':
                await handleSearchPage(request, $);
                break;
            case 'PRODUCT':
                await handleProductPage(request, body);
                break;
        }
    },
});

// Handler for search results pages
async function handleSearchPage(request, $) {
    console.log('Processing search results page');

    try {
        // Extract product data from the page using techniques from ScrapFly article
        // AliExpress loads data via JavaScript, we need to extract it from the script tags
        const scriptContent = $('script').map((_, script) => $(script).html()).get()
            .find(content => content && content.includes('window.runParams'));

        if (!scriptContent) {
            console.log('No product data found on search page');
            return;
        }

        // Try to extract the "runParams" object that contains the products data
        const runParamsMatch = scriptContent.match(/window\.runParams\s*=\s*({.*?});/s);
        if (!runParamsMatch) {
            console.log('Could not find runParams in script');
            return;
        }

        let productsData;
        try {
            // Parse the data containing the items
            const runParams = eval(`(${runParamsMatch[1]})`);
            productsData = runParams.mods?.itemList?.content;
        } catch (e) {
            console.log('Error parsing runParams:', e);
            return;
        }

        if (!productsData || !Array.isArray(productsData)) {
            console.log('No product array found in runParams');
            return;
        }

        console.log(`Found ${productsData.length} products on search page`);
        
        // Process each product preview and add detailed product pages to the queue
        let counter = 0;
        for (const product of productsData) {
            if (counter >= maxProducts) break;

            // Extract product ID
            const productId = product.productId;
            if (!productId) continue;

            // Create product URL
            const productUrl = `https://www.aliexpress.com/item/${productId}.html`;

            // Queue detailed product page
            await requestQueue.addRequest({
                url: productUrl,
                userData: {
                    label: 'PRODUCT',
                    preview: {
                        id: productId,
                        title: product.title,
                        price: product.price,
                        imageUrl: product.image,
                        orders: product.orders,
                        shipping: product.shipping,
                        store: product.store
                    }
                }
            });
            
            counter++;
        }

        // Check if there are more pages to scrape
        const pagination = $('.search-pagination-next');
        if (counter < maxProducts && pagination.length > 0) {
            const nextPageUrl = new URL($('.search-pagination-next').attr('href'), request.url).href;
            await requestQueue.addRequest({
                url: nextPageUrl,
                userData: {
                    label: 'SEARCH',
                }
            });
        }
    } catch (error) {
        console.error('Error while processing search page:', error);
    }
}

// Handler for product detail pages
async function handleProductPage(request, body) {
    console.log(`Processing product page: ${request.url}`);
    
    try {
        // Product data on AliExpress is available in a data object inside script tags
        // Following the ScrapFly article approach to extract this data
        const productDataMatch = body.match(/window\.runParams\s*=\s*({.*?})\s*;/s);
        if (!productDataMatch) {
            console.log('No product data found on page');
            return;
        }

        let productData;
        try {
            // Use a safer approach than eval
            const jsonStr = productDataMatch[1].replace(/undefined/g, 'null');
            productData = Function(`return ${jsonStr}`)();
        } catch (e) {
            console.log('Failed to parse product data:', e);
            return;
        }

        // Extract the detailed product information
        const detailedProduct = {
            id: request.userData.preview.id,
            url: request.url,
            title: productData.data?.titleModule?.subject || request.userData.preview.title,
            price: {
                currency: productData.data?.currencyCode || 'USD',
                current: productData.data?.priceModule?.formatedPrice,
                original: productData.data?.priceModule?.formatedActivityPrice
            },
            rating: {
                average: productData.data?.titleModule?.feedbackRating?.averageStar,
                count: productData.data?.titleModule?.feedbackRating?.totalValidNum
            },
            store: {
                name: productData.data?.storeModule?.storeName,
                url: productData.data?.storeModule?.storeURL,
                since: productData.data?.storeModule?.openTime,
                rating: productData.data?.storeModule?.positiveRate
            },
            shipping: {
                method: productData.data?.shippingModule?.shipFrom,
                company: productData.data?.shippingModule?.company,
                deliveryDate: productData.data?.shippingModule?.deliveryDate
            },
            specs: productData.data?.specsModule?.props?.map(spec => ({
                name: spec.attrName,
                value: spec.attrValue
            })),
            description: productData.data?.productDescComponent,
            images: productData.data?.imageModule?.imagePathList,
            skuOptions: productData.data?.skuModule?.productSKUPropertyList?.map(prop => ({
                name: prop.skuPropertyName,
                values: prop.skuPropertyValues?.map(v => ({
                    name: v.propertyValueDisplayName,
                    image: v.skuPropertyImagePath
                }))
            })),
            timestamp: new Date().toISOString()
        };

        // Save data to the default dataset
        await Actor.pushData(detailedProduct);
        console.log(`Saved data for product: ${detailedProduct.title}`);
        
    } catch (error) {
        console.error('Error while processing product page:', error);
    }
}

// Start the crawler
await crawler.run();

// Exit the Actor gracefully
await Actor.exit();