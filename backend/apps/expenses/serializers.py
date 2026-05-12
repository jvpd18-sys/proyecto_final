from rest_framework import serializers
from decimal import Decimal
from apps.users.serializers import UsuarioSerializer
from .models import Categoria, Gasto, GastoParticipante


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'icono', 'color_hex', 'es_predefinida')


class GastoParticipanteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = GastoParticipante
        fields = ('id', 'usuario', 'usuario_id', 'porcentaje', 'monto_correspondiente')
        read_only_fields = ('monto_correspondiente',)


class GastoSerializer(serializers.ModelSerializer):
    participantes = GastoParticipanteSerializer(many=True)
    pagado_por = UsuarioSerializer(read_only=True)
    pagado_por_id = serializers.IntegerField(write_only=True, required=False)
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)

    class Meta:
        model = Gasto
        fields = (
            'id', 'grupo', 'descripcion', 'monto', 'categoria', 'categoria_id',
            'pagado_por', 'pagado_por_id', 'fecha', 'creado_en', 'participantes'
        )
        read_only_fields = ('id', 'creado_en', 'pagado_por')

    def validate(self, attrs):
        participantes = attrs.get('participantes', [])
        if not participantes:
            raise serializers.ValidationError({'participantes': 'Debe haber al menos un participante.'})
        total = sum(Decimal(str(p.get('porcentaje', 0))) for p in participantes)
        if abs(total - Decimal('100')) > Decimal('0.01'):
            raise serializers.ValidationError({'participantes': f'Los porcentajes deben sumar 100%. Suma actual: {total}%'})
        return attrs

    def create(self, validated_data):
        participantes_data = validated_data.pop('participantes')
        user = self.context['request'].user
        if 'pagado_por_id' not in validated_data:
            validated_data['pagado_por_id'] = user.id
        gasto = Gasto.objects.create(creado_por=user, **validated_data)
        for p in participantes_data:
            monto = round(gasto.monto * Decimal(str(p['porcentaje'])) / Decimal('100'), 2)
            GastoParticipante.objects.create(
                gasto=gasto,
                usuario_id=p['usuario_id'],
                porcentaje=p['porcentaje'],
                monto_correspondiente=monto,
            )
        return gasto
