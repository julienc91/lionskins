from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from lionskins.management.commands.generate_sitemap import Command


@cache_page(timeout=600)
def sitemap_view(request):
    sitemap_file = Command.output_file()
    try:
        with open(sitemap_file, "r") as f:
            content = f.read()
    except FileNotFoundError:
        return HttpResponse("Sitemap not generated yet.", status=404)
    return HttpResponse(content, content_type="application/xml")
