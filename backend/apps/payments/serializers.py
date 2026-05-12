from rest_framework import serializers
from apps.users.serializers import UsuarioSerializer
from .models import Pago


class PagoSerializer(serializers.ModelSerializer):
    de_usuario = UsuarioSerializer(read_only=True)
    a_usuario = UsuarioSerializer(read_only=True)
    a_usuario_id = serializers.IntegerField(write_only=True)
    grupo_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Pago
        fields = ('id', 'grupo_id', 'de_usuario', 'a_usuario', 'a_usuario_id', 'monto', 'estado', 'fecha', 'creado_en')
        read_only_fields = ('id', 'estado', 'creado_en', 'de_usuario')

    def create(self, validated_data):
        validated_data['de_usuario'] = self.context['request'].user
        return super().create(validated_data)
