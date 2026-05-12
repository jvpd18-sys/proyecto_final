from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from apps.expenses.models import Categoria, Gasto
from .client import categorizar_gasto, generar_recomendaciones


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def categorizar(request):
    descripcion = request.data.get('description', '').strip()
    monto = request.data.get('amount', 0)
    if not descripcion:
        return Response({'detail': 'La descripción es requerida.'}, status=status.HTTP_400_BAD_REQUEST)

    categorias = list(Categoria.objects.values('id', 'nombre'))
    nombres = [c['nombre'] for c in categorias]
    nombre_sugerido = categorizar_gasto(descripcion, monto, nombres)

    categoria_obj = next((c for c in categorias if c['nombre'] == nombre_sugerido), None)
    return Response({
        'category_name': nombre_sugerido,
        'category_id': categoria_obj['id'] if categoria_obj else None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recomendaciones(request):
    from datetime import date
    user = request.user
    hoy = date.today()
    primer_dia = hoy.replace(day=1)
    ids_grupos = user.membresias.values_list('grupo_id', flat=True)

    gastos_mes = Gasto.objects.filter(
        participantes__usuario=user,
        grupo_id__in=ids_grupos,
        fecha__gte=primer_dia
    ).select_related('categoria')

    if gastos_mes.count() < 3:
        return Response({
            'recomendaciones': [],
            'mensaje': 'Necesitas al menos 3 gastos registrados para obtener recomendaciones.',
        })

    por_categoria = (
        gastos_mes.values('categoria__nombre')
        .annotate(total=Sum('participantes__monto_correspondiente'))
        .order_by('-total')
    )
    resumen = ', '.join(
        f"{item['categoria__nombre'] or 'Sin categoría'}: ${float(item['total']):.2f}"
        for item in por_categoria
    )
    sugerencias = generar_recomendaciones(resumen)
    return Response({'recomendaciones': sugerencias, 'resumen': resumen})
