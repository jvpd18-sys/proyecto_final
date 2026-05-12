from django.db import models
from django.conf import settings


class Pago(models.Model):
    ESTADO_PENDIENTE = 'pendiente'
    ESTADO_CONFIRMADO = 'confirmado'
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'Pendiente'),
        (ESTADO_CONFIRMADO, 'Confirmado'),
    ]

    grupo = models.ForeignKey('groups.Grupo', on_delete=models.CASCADE, related_name='pagos')
    de_usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pagos_realizados')
    a_usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pagos_recibidos')
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE)
    fecha = models.DateField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pagos'
        ordering = ['-creado_en']

    def __str__(self):
        return f'{self.de_usuario.email} → {self.a_usuario.email}: ${self.monto}'
