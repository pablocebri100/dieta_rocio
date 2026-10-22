import json
import random
import math
from collections import Counter

# ==========================================
# CONFIGURACIÓN DEL USUARIO
# ==========================================
NUM_DIAS_GENERAR = 5 # Número de días a generar (1 a 7)

# Añade aquí los IDs de los platos que NO quieres que aparezcan en el menú. Ejemplo: [1, 5, 12]
LISTA_NEGRA_IDS = [1] 

# Fuentes de hidratos que no deben chocar el mismo día (Comida/Cena)
FUENTES_HIDRATOS = ['macarrones', 'patatas', 'batata', 'patata'] 
# ==========================================

def obtener_fuente_hidratos(ingredientes):
    """Detecta si la comida tiene alguna de las fuentes de hidratos clave."""
    for ing in ingredientes:
        nombre_ing = ing.get('ingrediente', '').lower()
        for fuente in FUENTES_HIDRATOS:
            if fuente in nombre_ing:
                return fuente
    return None

def buscar_combinacion(pares_validos, kcal_merienda, num_dias, max_repes_c, max_repes_ce, req_c, req_ce, num_meriendas, intentos_maximos=50000):
    """Busca una combinación forzando el uso de todos los platos disponibles antes de repetir."""
    for intento in range(intentos_maximos):
        pares_disponibles = list(pares_validos)
        random.shuffle(pares_disponibles)
        
        plan_temporal = []
        contador_c = Counter()
        contador_ce = Counter()
        
        for _ in range(num_dias):
            pares_disponibles.sort(key=lambda p: contador_c[p[0]['nombre']] + contador_ce[p[1]['nombre']])
            
            par_encontrado = False
            for idx, (c, ce, base_k) in enumerate(pares_disponibles):
                if contador_c[c['nombre']] < max_repes_c and contador_ce[ce['nombre']] < max_repes_ce:
                    plan_temporal.append((c, ce, base_k))
                    contador_c[c['nombre']] += 1
                    contador_ce[ce['nombre']] += 1
                    pares_disponibles.pop(idx) 
                    par_encontrado = True
                    break
            
            if not par_encontrado:
                break 
                
        if len(plan_temporal) < num_dias:
            continue
            
        if len(contador_c) < req_c or len(contador_ce) < req_ce:
            continue
            
        indices_ordenados = sorted(range(num_dias), key=lambda i: plan_temporal[i][2])
        indices_merienda = set(indices_ordenados[:num_meriendas])
        
        es_rango_valido = True
        plan_final = []
        
        for i in range(num_dias):
            c, ce, base_k = plan_temporal[i]
            tiene_merienda = i in indices_merienda
            total_dia = base_k + (kcal_merienda if tiene_merienda else 0)
            
            if 1600 <= total_dia <= 1900:
                plan_final.append({
                    "tiene_merienda": tiene_merienda,
                    "total_dia": total_dia,
                    "comida": c,
                    "cena": ce
                })
            else:
                es_rango_valido = False
                break
                
        if es_rango_valido:
            return plan_final
            
    return None

def generar_menu_variable(ruta_archivo='menu.json'):
    num_dias = max(1, min(7, NUM_DIAS_GENERAR))
    nombres_dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    dias_semana = nombres_dias[:num_dias]
    
    num_meriendas = min(3, num_dias)

    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as file:
            datos = json.load(file)
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {ruta_archivo}")
        return

    datos = [m for m in datos if m.get('id') not in LISTA_NEGRA_IDS]

    desayunos = [m for m in datos if m.get('tipo', '').upper() == 'DESAYUNO']
    almuerzos = [m for m in datos if m.get('tipo', '').upper() == 'ALMUERZO']
    comidas = [m for m in datos if m.get('tipo', '').upper() == 'COMIDA']
    cenas = [m for m in datos if m.get('tipo', '').upper() == 'CENA']

    tostada_jamon = next((m for m in almuerzos if "tostada de jamón" in m['nombre'].lower() or "tostada de jamon" in m['nombre'].lower()), None)
    if not tostada_jamon:
        print("No se ha encontrado la 'Tostada de Jamón' en los almuerzos.")
        return

    # Cálculos fijos de Kcal y Proteínas
    kcal_desayuno = sum(m.get('kcal_totales', 0) for m in desayunos)
    kcal_almuerzo = sum(m.get('kcal_totales', 0) for m in almuerzos)
    kcal_fijas_diarias = kcal_desayuno + kcal_almuerzo
    kcal_merienda = tostada_jamon.get('kcal_totales', 0)

    proteina_desayuno = sum(m.get('proteina_total', 0) for m in desayunos)
    proteina_almuerzo = sum(m.get('proteina_total', 0) for m in almuerzos)
    proteina_fija_diaria = proteina_desayuno + proteina_almuerzo
    proteina_merienda = tostada_jamon.get('proteina_total', 0)

    max_repes_c = math.ceil(num_dias / len(comidas)) if comidas else 1
    max_repes_ce = math.ceil(num_dias / len(cenas)) if cenas else 1
    req_c = min(num_dias, len(comidas))
    req_ce = min(num_dias, len(cenas))

    pares_validos = []
    for c in comidas:
        for ce in cenas:
            hidrato_c = obtener_fuente_hidratos(c.get('ingredientes', []))
            hidrato_ce = obtener_fuente_hidratos(ce.get('ingredientes', []))
            
            if hidrato_c and hidrato_ce and hidrato_c == hidrato_ce:
                continue
            
            if c['kcal_totales'] <= ce['kcal_totales']:
                continue
                
            base_kcal = kcal_fijas_diarias + c['kcal_totales'] + ce['kcal_totales']
            pares_validos.append((c, ce, base_kcal))

    if not pares_validos:
        print("No hay combinaciones válidas. (Comprueba que haya Comidas con más kcal que las Cenas).")
        return
    
    plan_encontrado = buscar_combinacion(pares_validos, kcal_merienda, num_dias, max_repes_c, max_repes_ce, req_c, req_ce, num_meriendas)

    if not plan_encontrado:
        print("No se encontró combinación. Intenta ampliar el margen de Kcal o quita platos de la lista negra.")
        return

    # Imprimir tabla
    print("="*160)
    print(f"PLAN DE {num_dias} DÍAS GENERADO:")
    print("="*160)
    print(f"{'Día':<12} | {'Kcal Totales':<14} | {'Proteína (g)':<14} | {'Merienda':<10} | {'Comidas y Cenas Seleccionadas'}")
    print("="*160)
    
    total_proteina_semana = 0

    for i, dia in enumerate(plan_encontrado):
        c_kcal = dia['comida']['kcal_totales']
        ce_kcal = dia['cena']['kcal_totales']
        
        # Calcular proteína del día
        prot_dia = proteina_fija_diaria + dia['comida'].get('proteina_total', 0) + dia['cena'].get('proteina_total', 0)
        if dia['tiene_merienda']:
            prot_dia += proteina_merienda
            
        total_proteina_semana += prot_dia
        
        comidas_str = f"COMIDA: {dia['comida']['nombre']} ({c_kcal} kcal) / CENA: {dia['cena']['nombre']} ({ce_kcal} kcal)"
        merienda_str = "Sí" if dia['tiene_merienda'] else "No"
        print(f"{dias_semana[i]:<12} | {dia['total_dia']:<14.1f} | {prot_dia:<14.1f} | {merienda_str:<10} | {comidas_str}")
    print("="*160)
    
    # Calcular e imprimir media de proteínas
    media_proteina = total_proteina_semana / num_dias
    print(f"-> MEDIA DIARIA DE PROTEÍNAS: {media_proteina:.1f} g")
    
    # Procesar platos no utilizados
    todas_comidas = {c['nombre']: c['kcal_totales'] for c in comidas}
    todas_cenas = {ce['nombre']: ce['kcal_totales'] for ce in cenas}
    
    nombres_usadas_c = {dia['comida']['nombre'] for dia in plan_encontrado}
    nombres_usadas_ce = {dia['cena']['nombre'] for dia in plan_encontrado}
    
    comidas_no_usadas = set(todas_comidas.keys()) - nombres_usadas_c
    cenas_no_usadas = set(todas_cenas.keys()) - nombres_usadas_ce
    
    print("\n" + "="*60)
    print("PLATOS NO UTILIZADOS EN ESTA DISTRIBUCIÓN:")
    print("="*60)
    
    hay_sobrantes = False
    for plato in sorted(comidas_no_usadas):
        print(f"- [COMIDA] {plato} ({todas_comidas[plato]} kcal)")
        hay_sobrantes = True
    for plato in sorted(cenas_no_usadas):
        print(f"- [CENA] {plato} ({todas_cenas[plato]} kcal)")
        hay_sobrantes = True
        
    if not hay_sobrantes:
        print("- ¡Se han utilizado todos los platos disponibles!")
    print("="*60)

if __name__ == "__main__":
    generar_menu_variable()