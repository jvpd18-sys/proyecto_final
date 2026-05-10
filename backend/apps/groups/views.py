from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.users.models import Usuario
from apps.users.serializers import UsuarioSerializer
from .models import Grupo, GrupoMiembro
from .serializers import GrupoSerializer, GrupoMiembroSerializer


def _es_miembro(grupo, user):
    return grupo.miembros.filter(usuario=user).exists()


def _es_admin(grupo, user):
    return grupo.miembros.filter(usuario=user, rol=GrupoMiembro.ROL_ADMIN).exists()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def grupos_list(request):
    if request.method == 'GET':
        ids = request.user.membresias.values_list('grupo_id', flat=True)
        grupos = Grupo.objects.filter(id__in=ids)
        return Response(GrupoSerializer(grupos, many=True, context={'request': request}).data)
    serializer = GrupoSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def grupo_detail(request, pk):
    grupo = get_object_or_404(Grupo, pk=pk)
    if not _es_miembro(grupo, request.user):
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(GrupoSerializer(grupo, context={'request': request}).data)
    if request.method == 'PUT':
        if not _es_admin(grupo, request.user):
            return Response({'detail': 'Solo el administrador puede editar el grupo.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = GrupoSerializer(grupo, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    if not _es_admin(grupo, request.user):
        return Response({'detail': 'Solo el administrador puede eliminar el grupo.'}, status=status.HTTP_403_FORBIDDEN)
    grupo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grupo_miembros(request, pk):
    grupo = get_object_or_404(Grupo, pk=pk)
    if not _es_miembro(grupo, request.user):
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)
    miembros = grupo.miembros.select_related('usuario').all()
    return Response(GrupoMiembroSerializer(miembros, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invitar_miembro(request, pk):
    grupo = get_object_or_404(Grupo, pk=pk)
    if not _es_miembro(grupo, request.user):
        return Response({'detail': 'No perteneces a este grupo.'}, status=status.HTTP_403_FORBIDDEN)
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'detail': 'El email es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        usuario = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        return Response({'detail': 'No existe un usuario con ese email.'}, status=status.HTTP_404_NOT_FOUND)
    if grupo.miembros.filter(usuario=usuario).exists():
        return Response({'detail': 'El usuario ya es miembro del grupo.'}, status=status.HTTP_400_BAD_REQUEST)
    GrupoMiembro.objects.create(grupo=grupo, usuario=usuario)
    return Response({'detail': f'{usuario.nombre} agregado al grupo.'}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_miembro(request, pk, uid):
    grupo = get_object_or_404(Grupo, pk=pk)
    if not _es_admin(grupo, request.user):
        return Response({'detail': 'Solo el administrador puede eliminar miembros.'}, status=status.HTTP_403_FORBIDDEN)
    membresia = get_object_or_404(GrupoMiembro, grupo=grupo, usuario_id=uid)
    if membresia.usuario == request.user:
        return Response({'detail': 'No puedes eliminarte a ti mismo del grupo.'}, status=status.HTTP_400_BAD_REQUEST)
    membresia.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
