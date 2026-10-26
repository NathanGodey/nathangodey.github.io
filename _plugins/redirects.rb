# Generates redirect pages so old URLs keep working:
#   - each publication's `old_url` -> its project page (if on this site) or its entry on /publications/
#   - entries in _data/redirects.yml (from -> to)
module Redirects
  class Page < Jekyll::Page
    def initialize(site, from, to)
      @site = site
      @base = site.source
      @dir = from
      @name = "index.html"
      process(@name)
      @data = { "layout" => "redirect", "redirect_to" => to, "sitemap" => false }
      @content = ""
    end
  end

  class Generator < Jekyll::Generator
    safe true

    def generate(site)
      (site.data["publications"] || []).each do |pub|
        next unless pub["old_url"]
        project = pub.dig("links", "project")
        to = project&.start_with?("/") ? project : "/publications/##{pub['id']}"
        site.pages << Page.new(site, pub["old_url"], to)
      end
      (site.data["redirects"] || []).each do |r|
        site.pages << Page.new(site, r["from"], r["to"])
      end
    end
  end
end
