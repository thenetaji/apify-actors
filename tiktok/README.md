# **TikTok Scraper Actor – Scrape TikTok Profiles & Posts with Apify**

## **🚀 About the TikTok Scraper**

This **Apify TikTok Scraper Actor** lets you extract **detailed profile and post data** from TikTok. You can **scrape usernames, followers, videos, likes, comments, post URLs, and more** – all without logging in! Perfect for **marketers, data analysts, and researchers** who need structured TikTok data.

✅ **No login required**  
✅ **Real-time TikTok data**  
✅ **Profiles & posts scraping**  
✅ **Export to JSON, CSV, Excel**  
✅ **Fast & lightweight**

---

## **🔹 Features**

### **1️⃣ Scrape TikTok Profiles**

Get detailed profile data, including:  
✔️ Username & unique ID  
✔️ Followers & following count  
✔️ Account bio, links, region  
✔️ Profile verification status  
✔️ Profile picture (HD)

### **2️⃣ Scrape TikTok Posts**

Extract high-quality post details:  
✔️ Post ID, description, timestamp  
✔️ Video URL & cover image  
✔️ Likes, shares, comments, plays  
✔️ Music details (title, URL)  
✔️ Author details (ID, username)

### **3️⃣ Output Formats**

- **JSON** (structured API responses)
- **CSV** (for Excel & Sheets)
- **Excel** (business reports)
- **Apify Dataset** (visual analysis)

---

## **📥 How to Use**

### **1️⃣ Run on Apify Console**

- Open the **Apify Marketplace**
- Search for **TikTok Scraper**
- Click **Run** and input TikTok profile/post URLs

### **2️⃣ Use API to Fetch Data**

Make API calls to fetch TikTok data:

```bash
curl "https://api.apify.com/v2/datasets/your-dataset-id/items?format=json"
```

Or fetch CSV/Excel:

```bash
curl "https://api.apify.com/v2/datasets/your-dataset-id/items?format=csv"
```

---

## **⚡ Input Parameters**

---

## **📊 Example Output**

### Profile Data

```json
{
  "userId": "123456",
  "uniqueId": "tiktok_user",
  "nickname": "TikTok Creator",
  "followers": 150000,
  "verified": true,
  "region": "US",
  "bioSignature": "Social Media Influencer",
  "bioLink": "https://example.com",
  "videos": 320
}
```

### Post Data

```json
{
  "videoId": "abc123",
  "description": "Check out my new dance!",
  "videoUrl": "https://www.tiktok.com/video123",
  "coverImage": "https://coverimage.com",
  "likes": 50000,
  "shares": 8000,
  "comments": 1200,
  "plays": 1000000
}
```

---

## **📌 Use Cases**

- Social Media Monitoring – Track TikTok influencers & trends
- Market Research – Analyze engagement & post performance
- Data Collection – Automate TikTok data scraping for insights
- Competitor Analysis – Monitor rival brands & their audience

---

## **💡 Why Choose This Scraper?**

✅ Fast & Efficient – Fetch data within seconds  
✅ No Login Required – No need to authenticate  
✅ Customizable – Modify scraper settings easily  
✅ Cloud-Based – Runs on Apify's secure cloud infrastructure

---

## **🛠️ Setup & Deployment**

### Run in Apify CLI

```bash
apify run your-tiktok-scraper
```

### Deploy Your Own Scraper

1. Clone the repo:

```bash
git clone https://github.com/your-repo/tiktok-scraper.git
cd tiktok-scraper
```

2. Install dependencies:

```bash
npm install
```

3. Run the scraper:

```bash
node main.js
```

---

## **📜 License**

This project is licensed under the MIT License. See the LICENSE file for details.

---

## **📩 Need Help?**

For issues or feature requests, open a GitHub Issue.

🔗 Try TikTok Scraper on Apify Now!

---

## **SEO Keywords for Better Ranking**

- TikTok Scraper
- TikTok Data Scraper
- Extract TikTok Posts
- Scrape TikTok Profiles
- TikTok API Alternative
- TikTok Post Analytics
- Apify Scraper for TikTok

---
