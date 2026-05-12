from django.db import models
from django.conf import settings


class Categoria(models.Model):
    nombre = models.CharField(max_length=80)
    icono = models.CharField(max_length=50, default='tag')
    color_hex = models.CharField(max_length=7, default='#6366f1')
    es_predefinida = models.BooleanField(default=False)

    class Meta:
        db_table = 'categorias'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Gasto(models.Model):
    grupo = models.ForeignKey('groups.Grupo', on_delete=models.CASCADE, related_name='gastos')
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    pagado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gastos_pagados')
    fecha = models.DateField()
    creado_en = models.DateTimeField(auto_now_add=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gastos_creados')

    class Meta:
        db_table = 'gastos'
        ordering = ['-fecha', '-creado_en']

    def __str__(self):
        return f'{self.descripcion} - ${self.monto}'


class GastoParticipante(models.Model):
    gasto = models.ForeignKey(Gasto, on_delete=models.CASCADE, related_name='participantes')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='participaciones')
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)
    monto_correspondiente = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'gasto_participantes'
        unique_together = ('gasto', 'usuario')

    def __str__(self):
        return f'{self.usuario.email} - {self.porcentaje}%'
