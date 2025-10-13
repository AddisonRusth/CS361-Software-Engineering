import requests
import concurrent.futures
import matplotlib.pyplot as plt
from transformers import pipeline
from bs4 import BeautifulSoup
from collections import Counter
import time

# Load sentiment analysis model (Hugging Face)
sentiment_model = pipeline("sentiment-analysis")

# Target news sites (simple headlines scraping)
SITES = {
    "BBC": "https://www.bbc.com/news",
    "Reuters": "https://www.reuters.com/",
    "CNN": "https://edition.cnn.com/",
}

def fetch_headlines(url):
    """Fetch headlines from a website."""
    try:
        html = requests.get(url, timeout=5).text
        soup = BeautifulSoup(html, "html.parser")
        headlines = [h.get_text().strip() for h in soup.find_all(["h1", "h2", "h3"]) if len(h.get_text()) > 20]
        return headlines
    except Exception as e:
        return [f"Error fetching {url}: {e}"]

def analyze_sentiment(headlines):
    """Run sentiment analysis on headlines."""
    results = sentiment_model(headlines)
    sentiments = [r['label'] for r in results]
    return Counter(sentiments)

def scrape_and_analyze():
    """Fetch and analyze from all sites concurrently."""
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(lambda kv: (kv[0], fetch_headlines(kv[1])), SITES.items())
    sentiment_counts = Counter()
    for site, headlines in results:
        sentiment_counts += analyze_sentiment(headlines[:10])  # Limit for speed
    return sentiment_counts

# --- Real-time visualization ---
plt.ion()
fig, ax = plt.subplots()

while True:
    sentiments = scrape_and_analyze()
    ax.clear()
    ax.bar(sentiments.keys(), sentiments.values(), color=['green', 'red', 'blue'])
    ax.set_title("📰 Live News Sentiment Tracker")
    ax.set_ylabel("Count")
    ax.set_xlabel("Sentiment")
    plt.pause(15)  # Update every 15 seconds
