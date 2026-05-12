from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.users.serializers import UsuarioSerializer
from apps.groups.models import Grupo
from .models import Categoria, Gasto
from .serializers import CategoriaSerializer, GastoSerializer
from .services import calcular_balances, calcular_liquidacion


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def categorias_list(request):
    categorias = Categoria.objects.all()
    return Response(CategoriaSerializer(categorias, many=True).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def gastos_list(request):
    if request.method == 'GET':
        ids_grupos = request.user.membresias.values_list('grupo_id', flat=True)
        qs = Gasto.objects.filter(grupo_id__in=ids_grupos).select_related(
            'categoria', 'pagado_por', 'grupo', 'creado_por'
        ).prefetch_related('participantes__usuario')

        grupo_id = request.query_params.get('group')
        categoria_id = request.query_params.get('category')
        desde = request.query_params.get('from')
        hasta = request.query_params.get('to')
        busqueda = request.query_params.get('q')

        if grupo_id:
            qs = qs.filter(grupo_id=grupo_id)
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        if desde:
            qs = qs.filter(fecha__gte=desde)
        if hasta:
            qs = qs.filter(fecha__lte=hasta)
        if busqueda:
            qs = qs.filter(descripcion__icontains=busqueda)

        page = int(request.query_params.get('page', 1))
        page_size = 10
        total = qs.count()
        qs = qs[(page - 1) * page_size: page * page_size]

        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'results': GastoSerializer(qs, many=True, context={'request': request}).data,
        })

    serializer = GastoSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    grupo = serializer.validated_data['grupo']
    if not grupo.miembros.filter(usuario=request.user).exists():
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gasto_detail(request, pk):
    gasto = get_object_or_404(Gasto, pk=pk)
    if not gasto.grupo.miembros.filter(usuario=request.user).exists():
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(GastoSerializer(gasto, context={'request': request}).data)
    if request.method == 'PUT':
        if gasto.creado_por != request.user:
            return Response({'detail': 'Solo el creador puede editar este gasto.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = GastoSerializer(gasto, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    if gasto.creado_por != request.user:
        return Response({'detail': 'Solo el creador puede eliminar este gasto.'}, status=status.HTTP_403_FORBIDDEN)
    gasto.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grupo_balances(request, grupo_id):
    grupo = get_object_or_404(Grupo, pk=grupo_id)
    if not grupo.miembros.filter(usuario=request.user).exists():
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)

    balances = calcular_balances(grupo)
    miembros = {m.usuario_id: m.usuario for m in grupo.miembros.select_related('usuario').all()}
    resultado = []
    for uid, balance in balances.items():
        usuario = miembros.get(uid)
        if usuario:
            resultado.append({
                'usuario': UsuarioSerializer(usuario, context={'request': request}).data,
                'balance': float(balance),
            })
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grupo_liquidacion(request, grupo_id):
    grupo = get_object_or_404(Grupo, pk=grupo_id)
    if not grupo.miembros.filter(usuario=request.user).exists():
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)

    balances = calcular_balances(grupo)
    miembros = {m.usuario_id: m.usuario for m in grupo.miembros.select_related('usuario').all()}
    transferencias = calcular_liquidacion(balances, miembros)
    resultado = []
    for t in transferencias:
        resultado.append({
            'de': UsuarioSerializer(t['de'], context={'request': request}).data if t['de'] else None,
            'a': UsuarioSerializer(t['a'], context={'request': request}).data if t['a'] else None,
            'monto': float(t['monto']),
        })
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    from django.db.models import Sum
    from apps.payments.models import Pago
    from datetime import date

    hoy = date.today()
    primer_dia_mes = hoy.replace(day=1)
    ids_grupos = request.user.membresias.values_list('grupo_id', flat=True)

    total_mes = Gasto.objects.filter(
        participantes__usuario=request.user,
        fecha__gte=primer_dia_mes
    ).aggregate(total=Sum('participantes__monto_correspondiente'))['total'] or 0

    pagos_pendientes = Pago.objects.filter(
        de_usuario=request.user, estado='pendiente'
    ).aggregate(total=Sum('monto'))['total'] or 0

    grupos_activos = Grupo.objects.filter(id__in=ids_grupos).count()

    from decimal import Decimal
    total_pagado = Gasto.objects.filter(
        pagado_por=request.user, grupo_id__in=ids_grupos
    ).aggregate(total=Sum('monto'))['total'] or Decimal('0')
    total_debe = Gasto.objects.filter(
        participantes__usuario=request.user, grupo_id__in=ids_grupos
    ).aggregate(total=Sum('participantes__monto_correspondiente'))['total'] or Decimal('0')
    balance_neto = float(total_pagado - total_debe)

    ultimos = Gasto.objects.filter(grupo_id__in=ids_grupos).select_related(
        'categoria', 'pagado_por', 'grupo'
    ).prefetch_related('participantes__usuario')[:5]

    por_categoria = []
    cats = Categoria.objects.filter(
        gasto__grupo_id__in=ids_grupos,
        gasto__fecha__gte=primer_dia_mes
    ).distinct()
    for cat in cats:
        total_cat = Gasto.objects.filter(
            categoria=cat, grupo_id__in=ids_grupos, fecha__gte=primer_dia_mes
        ).aggregate(t=Sum('monto'))['t'] or 0
        por_categoria.append({'categoria': cat.nombre, 'color': cat.color_hex, 'total': float(total_cat)})

    return Response({
        'total_mes': float(total_mes),
        'balance_neto': balance_neto,
        'grupos_activos': grupos_activos,
        'pagos_pendientes': float(pagos_pendientes),
        'ultimos_gastos': GastoSerializer(ultimos, many=True, context={'request': request}).data,
        'por_categoria': por_categoria,
    })
