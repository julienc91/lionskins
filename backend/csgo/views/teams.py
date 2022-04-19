from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from csgo.management.commands.fetch_players import Command


@cache_page(timeout=600)
def teams_view(request):
    sitemap_file = Command.output_file()
    try:
        with open(sitemap_file, "r") as f:
            content = f.read()
    except FileNotFoundError:
        return HttpResponse("File not generated yet.", status=404)
    return HttpResponse(content, content_type="application/json")
