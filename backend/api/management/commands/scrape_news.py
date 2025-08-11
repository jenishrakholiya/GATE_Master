import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from api.models import NewsArticle
from urllib.parse import quote
from dateutil.relativedelta import relativedelta # <-- Required for date calculations

# Topics to search for on Google News
SEARCH_TOPICS = [
    "GATE CS exam",
    "GATE computer science",
    "IISc Bangalore GATE",
]

class Command(BaseCommand):
    help = 'Scrapes Google News RSS feeds for GATE CS news from the last 2 months.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Starting news scrape from Google News RSS..."))
        
        new_articles_found = 0
        skipped_articles_count = 0 # <-- NEW: Counter for old articles
        
        # --- NEW: Calculate the cutoff date (2 months ago from today) ---
        two_months_ago = datetime.now(timezone.utc) - relativedelta(months=2)
        self.stdout.write(f"  -> Filtering for news published after {two_months_ago.strftime('%Y-%m-%d')}")
        
        for topic in SEARCH_TOPICS:
            self.stdout.write(f"  -> Searching for topic: '{topic}'")
            
            search_url = f"https://news.google.com/rss/search?q={quote(topic)}&hl=en-IN&gl=IN&ceid=IN:en"
            
            try:
                response = requests.get(search_url, timeout=20)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                self.stderr.write(self.style.ERROR(f"    Failed to fetch RSS feed for '{topic}': {e}"))
                continue

            soup = BeautifulSoup(response.content, "xml")
            news_items = soup.find_all('item')

            for item in news_items:
                title = item.find('title').get_text(strip=True) if item.find('title') else "No Title"
                link = item.find('link').get_text(strip=True) if item.find('link') else "#"
                pub_date_str = item.find('pubDate').get_text(strip=True) if item.find('pubDate') else ''
                
                try:
                    pub_date = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %Z').replace(tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    pub_date = datetime.now(timezone.utc)
                
                # --- NEW: Check if the article is recent enough ---
                if pub_date < two_months_ago:
                    skipped_articles_count += 1
                    continue # Skip this article and move to the next one

                article, created = NewsArticle.objects.get_or_create(
                    link=link,
                    defaults={
                        'title': title,
                        'description': title,
                        'publication_date': pub_date,
                        'source': item.find('source').get_text(strip=True) if item.find('source') else 'Google News'
                    }
                )

                if created:
                    new_articles_found += 1

        if new_articles_found > 0:
            self.stdout.write(self.style.SUCCESS(f"\nScraping complete. Found and added {new_articles_found} new articles."))
        else:
            self.stdout.write(self.style.SUCCESS("\nNo new articles found. Database is up to date."))
            
        if skipped_articles_count > 0:
            self.stdout.write(self.style.NOTICE(f"Skipped {skipped_articles_count} old articles."))