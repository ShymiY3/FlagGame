import requests
from bs4 import BeautifulSoup as Soup
import json
import hashlib
import random

class FlagScrapeException(Exception):
    pass

class FlagScrape():
    def __init__(self, url: str, headline: str) -> None:
        self.url = url
        self.headline = headline
        
    def make_request(self, url):
        try:
            response = requests.get(url)
            if not response.ok:
                raise FlagScrapeException("Can't connect to page")
            markup = response.text
        except Exception as e:
            print(f"Url: {url}, Error: {e}")
            markup = None
        finally:
            return markup
    
    def get_flag_table(self, markup):
        soup = Soup(markup, "html.parser")
        span = soup.find('span', string=self.headline)
        if not (span and span.parent):
            raise FlagScrapeException("Can't locate the table")
        table = span.parent.find_next_sibling("table")
        if not (table and table.tbody):
            raise FlagScrapeException("Can't locate the table")
        return table.tbody
    
    def create_id(self, string: str):
        return hashlib.shake_256(string.encode()).hexdigest(10)
    
    def scrape_flag_sources(self, table):
        flag_urls = {}
        if not (rows:=table.find_all("tr")):
            raise FlagScrapeException()
        for row in rows:
            flag = self.scrape_flag(row)
            country = self.scrape_country(row)
            if not (flag and country):
                continue
            flag_urls.update({country:{
                "id" : self.create_id(country),
                "url": flag,
            }})
        return flag_urls

    def scrape_flag(self, row):
        img = row.find("img")
        if not img:
            return None
        src = img.attrs.get("src", None)
        if not src:
            return None
        return self.format_flag_url(src)     
        
    def scrape_country(self, row):
        if not (b:=row.find("b")):
            return
        if not (b.a):
            return None
        return b.a.text    
    
    def format_flag_url(self, src):
        url = src.replace("/thumb", "")
        url = "/".join(url.split("/")[:-1])
        url = url.strip("/")
        url = url if url.startswith("http") else "https://" + url
        return url
            
    def random_save_to_json(self, urls: dict):
        random_keys = list(urls.keys())
        random.shuffle(random_keys)
        with open("flags.json", "w") as f:
            f.write(json.dumps({key:urls[key] for key in random_keys}, indent=2))

    
    def run(self):
        markup = self.make_request(self.url)
        table = self.get_flag_table(markup)
        urls = self.scrape_flag_sources(table)
        self.random_save_to_json(urls)
        
if __name__ == "__main__":
    obj = FlagScrape("https://en.wikipedia.org/wiki/Flags_of_Europe", headline="Flags of European sovereign states")
    obj.run()