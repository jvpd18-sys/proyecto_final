from rest_framework import serializers
from apps.users.serializers import UsuarioSerializer
from .models import Grupo, GrupoMiembro


class GrupoMiembroSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = GrupoMiembro
        fields = ('id', 'usuario', 'rol', 'unido_en')


class GrupoSerializer(serializers.ModelSerializer):
    creado_por = UsuarioSerializer(read_only=True)
    total_miembros = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = ('id', 'nombre', 'descripcion', 'creado_por', 'total_miembros', 'creado_en')
        read_only_fields = ('id', 'creado_por', 'creado_en')

    def get_total_miembros(self, obj):
        return obj.miembros.count()

    def create(self, validated_data):
        user = self.context['request'].user
        grupo = Grupo.objects.create(creado_por=user, **validated_data)
        GrupoMiembro.objects.create(grupo=grupo, usuario=user, rol=GrupoMiembro.ROL_ADMIN)
        return grupo
