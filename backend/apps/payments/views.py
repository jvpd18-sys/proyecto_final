from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Pago
from .serializers import PagoSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def pagos_list(request):
    if request.method == 'GET':
        pagos = Pago.objects.filter(
            de_usuario=request.user
        ).union(
            Pago.objects.filter(a_usuario=request.user)
        ).order_by('-creado_en')
        return Response(PagoSerializer(pagos, many=True, context={'request': request}).data)

    serializer = PagoSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    pago = serializer.save()
    return Response(PagoSerializer(pago, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_pago(request, pk):
    pago = get_object_or_404(Pago, pk=pk)
    if pago.a_usuario != request.user:
        return Response({'detail': 'Solo el receptor puede confirmar el pago.'}, status=status.HTTP_403_FORBIDDEN)
    if pago.estado == Pago.ESTADO_CONFIRMADO:
        return Response({'detail': 'El pago ya fue confirmado.'}, status=status.HTTP_400_BAD_REQUEST)
    pago.estado = Pago.ESTADO_CONFIRMADO
    pago.save()
    return Response(PagoSerializer(pago, context={'request': request}).data)
