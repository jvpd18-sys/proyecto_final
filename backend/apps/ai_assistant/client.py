import anthropic
from django.conf import settings


def get_client():
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def categorizar_gasto(descripcion, monto, nombres_categorias):
    """Sugiere una categoría para un gasto dado su descripción y monto."""
    try:
        client = get_client()
        lista = ', '.join(nombres_categorias)
        message = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=50,
            messages=[{
                'role': 'user',
                'content': (
                    f'Clasifica este gasto en una sola categoría de la siguiente lista: {lista}. '
                    f'Gasto: "{descripcion}" por ${monto}. '
                    f'Responde ÚNICAMENTE con el nombre exacto de la categoría, sin explicación.'
                )
            }]
        )
        sugerencia = message.content[0].text.strip()
        if sugerencia in nombres_categorias:
            return sugerencia
        for nombre in nombres_categorias:
            if nombre.lower() in sugerencia.lower():
                return nombre
        return 'Otros'
    except Exception:
        return 'Otros'


def generar_recomendaciones(resumen_gastos):
    """Genera 3 recomendaciones de ahorro basadas en el historial."""
    try:
        client = get_client()
        message = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=400,
            messages=[{
                'role': 'user',
                'content': (
                    f'Eres un asesor financiero personal. Basándote en este resumen de gastos del último mes: '
                    f'{resumen_gastos}. '
                    f'Genera exactamente 3 recomendaciones de ahorro específicas, prácticas y accionables en español. '
                    f'Formato: devuelve solo las 3 recomendaciones separadas por |||, sin numeración ni encabezados.'
                )
            }]
        )
        texto = message.content[0].text.strip()
        partes = [p.strip() for p in texto.split('|||') if p.strip()]
        return partes[:3] if len(partes) >= 3 else partes
    except Exception:
        return ['Registra todos tus gastos diariamente para tener mejor control.']
