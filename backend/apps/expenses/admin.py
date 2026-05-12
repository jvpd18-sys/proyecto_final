from django.contrib import admin
from .models import Categoria, Gasto, GastoParticipante

admin.site.register(Categoria)
admin.site.register(Gasto)
admin.site.register(GastoParticipante)
