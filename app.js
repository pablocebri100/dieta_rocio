document.addEventListener('DOMContentLoaded', () => {
    const contenedorMenu = document.getElementById('contenedor-menu');
    const filtroDias = document.getElementById('filtro-dias');
    const selectorOrden = document.getElementById('selectorOrden'); 

    let datosMenu = [];
    
    const ordenDias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
    
    const seccionesVisibles = [
        { titulo: "DESAYUNO Y ALMUERZO", tipos: ["DESAYUNO", "ALMUERZO"] },
        { titulo: "COMIDA", tipos: ["COMIDA"] },
        { titulo: "MERIENDA", tipos: ["MERIENDA"] },
        { titulo: "CENA", tipos: ["CENA"] }
    ];

    fetch('menu.json')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            datosMenu = data;
            renderizarMenu(); 
        })
        .catch(error => {
            console.error('Error:', error);
            contenedorMenu.innerHTML = `<p style="text-align:center; padding: 2rem;">Error al cargar el menú. Asegúrate de ejecutar un servidor local.</p>`;
        });

    filtroDias.addEventListener('change', renderizarMenu);
    selectorOrden.addEventListener('change', renderizarMenu);

    function crearTarjetaPlato(plato) {
        const platoContenedor = document.createElement('div');
        platoContenedor.className = 'plato-contenedor';

        const platoHeader = document.createElement('div');
        platoHeader.className = 'plato-header';

        if (plato.imagen && !plato.imagen.includes('imagen_no_encontrada')) {
            const img = document.createElement('img');
            img.className = 'plato-img';
            img.src = plato.imagen;
            img.alt = plato.nombre;
            img.onerror = () => img.style.display = 'none'; 
            platoHeader.appendChild(img);
        }

        const platoInfo = document.createElement('div');
        platoInfo.className = 'plato-info';

        const platoTitulo = document.createElement('h3');
        platoTitulo.className = 'plato-titulo';
        platoTitulo.textContent = plato.nombre;
        platoInfo.appendChild(platoTitulo);

        // Inyección de Macros y Tipo
        const etiquetasContenedor = document.createElement('div');
        etiquetasContenedor.className = 'etiquetas-info';
        etiquetasContenedor.style.display = 'flex';
        etiquetasContenedor.style.gap = '10px';
        etiquetasContenedor.style.marginBottom = '10px';
        etiquetasContenedor.style.flexWrap = 'wrap';
        etiquetasContenedor.style.fontSize = '0.9em';

        const etiquetaTipo = document.createElement('span');
        etiquetaTipo.textContent = (plato.tipo || 'OTRO').toUpperCase();
        etiquetaTipo.style.fontWeight = 'bold';
        etiquetaTipo.style.color = '#7f8c8d';
        etiquetasContenedor.appendChild(etiquetaTipo);

        // Solo se crea y añade la etiqueta si existen las kcal
        if (plato.kcal_totales) {
            const etiquetaKcal = document.createElement('span');
            etiquetaKcal.textContent = `${plato.kcal_totales} kcal`;
            etiquetaKcal.style.fontWeight = 'bold';
            etiquetasContenedor.appendChild(etiquetaKcal);
        }

        // Solo se crea y añade la etiqueta si existen las proteínas
        if (plato.proteina_total) {
            const etiquetaProt = document.createElement('span');
            etiquetaProt.textContent = `${plato.proteina_total}g Prot`;
            etiquetaProt.style.fontWeight = 'bold';
            etiquetasContenedor.appendChild(etiquetaProt);
        }

        platoInfo.appendChild(etiquetasContenedor);

        if (plato.enlace_tiktok) {
            const btnTiktok = document.createElement('a');
            btnTiktok.className = 'btn-tiktok';
            btnTiktok.href = plato.enlace_tiktok;
            btnTiktok.target = '_blank';
            btnTiktok.textContent = 'Ver TikTok';
            platoInfo.appendChild(btnTiktok);
        }

        platoHeader.appendChild(platoInfo);
        platoContenedor.appendChild(platoHeader);

        if (plato.ingredientes && plato.ingredientes.length > 0) {
            const listaIngredientes = document.createElement('ul');
            listaIngredientes.className = 'ingredientes-lista';

            plato.ingredientes.forEach(ing => {
                const li = document.createElement('li');
                li.className = 'ingrediente-item';
                
                const spanNombre = document.createElement('span');
                spanNombre.className = 'ing-nombre';
                spanNombre.textContent = ing.ingrediente;
                
                const spanCantidad = document.createElement('span');
                spanCantidad.className = 'ing-cantidad';
                spanCantidad.textContent = ing.cantidad || '';

                li.appendChild(spanNombre);
                li.appendChild(spanCantidad);
                listaIngredientes.appendChild(li);
            });
            platoContenedor.appendChild(listaIngredientes);
        }

        return platoContenedor;
    }

    function renderizarMenu() {
        const diaSeleccionado = filtroDias.value;
        const criterioOrden = selectorOrden.value;
        
        contenedorMenu.innerHTML = ''; 

        // 1. MODO ORDENAMIENTO: Lista plana exclusiva para COMIDA y CENA
        if (criterioOrden !== 'defecto') {
            let recetasFiltradas = datosMenu.filter(p => {
                const tipo = p.tipo ? p.tipo.toUpperCase() : "";
                return tipo === "COMIDA" || tipo === "CENA";
            });
            
            if (diaSeleccionado !== 'TODOS') {
                recetasFiltradas = recetasFiltradas.filter(p => p.dias && p.dias.includes(diaSeleccionado));
            }

            if (criterioOrden === 'kcal_asc') {
                recetasFiltradas.sort((a, b) => (a.kcal_totales || 99999) - (b.kcal_totales || 99999));
            } else if (criterioOrden === 'prot_desc') {
                recetasFiltradas.sort((a, b) => (b.proteina_total || 0) - (a.proteina_total || 0));
            }

            const contenedorPlano = document.createElement('div');
            contenedorPlano.className = 'dia-card'; 
            
            const tituloLista = document.createElement('h2');
            tituloLista.className = 'dia-titulo';
            
            const textoOrden = criterioOrden === 'kcal_asc' ? 'Calorías (Menor a Mayor)' : 'Proteínas (Mayor a Menor)';
            tituloLista.textContent = `Comidas y Cenas ordenadas por ${textoOrden}`;
            
            contenedorPlano.appendChild(tituloLista);

            const recetasUnicas = Array.from(new Set(recetasFiltradas.map(a => a.id)))
                .map(id => recetasFiltradas.find(a => a.id === id));

            recetasUnicas.forEach(plato => {
                contenedorPlano.appendChild(crearTarjetaPlato(plato));
            });
            
            if(recetasUnicas.length === 0) {
                contenedorPlano.innerHTML += '<p style="padding:15px">No hay comidas ni cenas para mostrar.</p>';
            }

            contenedorMenu.appendChild(contenedorPlano);
            return; 
        }

        // 2. MODO CALENDARIO: Agrupado por días y secciones
        const menuAgrupado = {};
        ordenDias.forEach(dia => menuAgrupado[dia] = []);

        datosMenu.forEach(plato => {
            if (plato.dias) {
                plato.dias.forEach(dia => {
                    if (menuAgrupado[dia]) {
                        menuAgrupado[dia].push({ ...plato });
                    }
                });
            }
        });

        ordenDias.forEach(dia => {
            if (diaSeleccionado !== 'TODOS' && dia !== diaSeleccionado) return;

            const platosDelDia = menuAgrupado[dia];
            if (platosDelDia.length === 0) return; 

            const diaCard = document.createElement('div');
            diaCard.className = 'dia-card';

            const tituloDia = document.createElement('h2');
            tituloDia.className = 'dia-titulo';
            tituloDia.textContent = dia;
            diaCard.appendChild(tituloDia);

            seccionesVisibles.forEach(seccion => {
                const platosDeEstaSeccion = platosDelDia.filter(p => {
                    const tipoPlato = p.tipo ? p.tipo.toUpperCase() : "";
                    return seccion.tipos.includes(tipoPlato);
                });
                
                if (platosDeEstaSeccion.length === 0) return;

                platosDeEstaSeccion.sort((a, b) => {
                    const tipoA = a.tipo ? a.tipo.toUpperCase() : "";
                    const tipoB = b.tipo ? b.tipo.toUpperCase() : "";
                    return seccion.tipos.indexOf(tipoA) - seccion.tipos.indexOf(tipoB);
                });

                const comidaSeccion = document.createElement('div');
                comidaSeccion.className = 'comida-seccion';

                const tipoEtiqueta = document.createElement('span');
                tipoEtiqueta.className = 'tipo-comida';
                tipoEtiqueta.textContent = seccion.titulo;
                comidaSeccion.appendChild(tipoEtiqueta);

                platosDeEstaSeccion.forEach(plato => {
                    comidaSeccion.appendChild(crearTarjetaPlato(plato));
                });

                diaCard.appendChild(comidaSeccion);
            });

            contenedorMenu.appendChild(diaCard);
        });
    }
});