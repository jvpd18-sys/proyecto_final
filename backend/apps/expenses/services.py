from decimal import Decimal
from collections import defaultdict


def calcular_balances(grupo):
    """
    Calcula cuánto debe o le deben a cada miembro del grupo.
    Retorna dict {usuario_id: balance} donde positivo = le deben, negativo = debe.
    """
    balances = defaultdict(Decimal)
    gastos = grupo.gastos.prefetch_related('participantes').all()

    for gasto in gastos:
        balances[gasto.pagado_por_id] += gasto.monto
        for participante in gasto.participantes.all():
            balances[participante.usuario_id] -= participante.monto_correspondiente

    return dict(balances)


def calcular_liquidacion(balances, usuarios_map):
    """
    Algoritmo greedy de deuda mínima.
    Retorna lista de {'de': usuario, 'a': usuario, 'monto': Decimal}.
    """
    deudores = sorted(
        [(uid, -bal) for uid, bal in balances.items() if bal < 0],
        key=lambda x: x[1], reverse=True
    )
    acreedores = sorted(
        [(uid, bal) for uid, bal in balances.items() if bal > 0],
        key=lambda x: x[1], reverse=True
    )

    deudores = list(deudores)
    acreedores = list(acreedores)
    transferencias = []

    i, j = 0, 0
    while i < len(deudores) and j < len(acreedores):
        uid_deudor, deuda = deudores[i]
        uid_acreedor, credito = acreedores[j]
        pago = min(deuda, credito)

        transferencias.append({
            'de': usuarios_map.get(uid_deudor),
            'a': usuarios_map.get(uid_acreedor),
            'monto': round(pago, 2),
        })

        deudores[i] = (uid_deudor, deuda - pago)
        acreedores[j] = (uid_acreedor, credito - pago)

        if deudores[i][1] == 0:
            i += 1
        if acreedores[j][1] == 0:
            j += 1

    return transferencias
