from django.db import models
from django.conf import settings


class Grupo(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, default='')
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grupos_creados')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grupos'
        ordering = ['-creado_en']

    def __str__(self):
        return self.nombre


class GrupoMiembro(models.Model):
    ROL_ADMIN = 'admin'
    ROL_MIEMBRO = 'miembro'
    ROL_CHOICES = [(ROL_ADMIN, 'Administrador'), (ROL_MIEMBRO, 'Miembro')]

    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='miembros')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='membresias')
    rol = models.CharField(max_length=10, choices=ROL_CHOICES, default=ROL_MIEMBRO)
    unido_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grupo_miembros'
        unique_together = ('grupo', 'usuario')

    def __str__(self):
        return f'{self.usuario.email} en {self.grupo.nombre}'
