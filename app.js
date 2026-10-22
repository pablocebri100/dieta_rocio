document.addEventListener('DOMContentLoaded', () => {
    const contenedorMenu = document.getElementById('contenedor-menu');
    const filtroDias = document.getElementById('filtro-dias');
    const selectorOrden = document.getElementById('selectorOrden'); 

    let datosMenu = [];
    
    const ordenDias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
    
    const seccionesVisibles = [
        { titulo: "DESAYUNO Y ALMUERZO", tipos: ["DESAYUNO", "ALMUERZO"], plegable: true },
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
            contenedorMenu.innerHTML = `<p style="text-align:center; padding: 2rem;">Error al cargar el menú.</p>`;
        });

    filtroDias.addEventListener('change', renderizarMenu);
    selectorOrden.addEventListener('change', renderizarMenu);

    function crearTarjetaPlato(plato, mostrarMacros = true) {
        const platoContenedor = document.createElement('div');
        platoContenedor.className = 'plato-contenedor';

        if (mostrarMacros) {
            const cabeceraMacros = document.createElement('div');
            cabeceraMacros.style.display = 'flex';
            cabeceraMacros.style.justifyContent = 'space-between';
            cabeceraMacros.style.alignItems = 'center';
            cabeceraMacros.style.marginBottom = '12px';
            cabeceraMacros.style.paddingBottom = '8px';
            cabeceraMacros.style.borderBottom = '1px solid #eee';
            cabeceraMacros.style.fontSize = '0.9em';

            const etiquetaTipo = document.createElement('span');
            etiquetaTipo.textContent = (plato.tipo || 'OTRO').toUpperCase();
            etiquetaTipo.style.fontWeight = 'bold';
            etiquetaTipo.style.color = '#7f8c8d';
            cabeceraMacros.appendChild(etiquetaTipo);

            const contenedorDerecha = document.createElement('div');
            contenedorDerecha.style.display = 'flex';
            contenedorDerecha.style.gap = '15px';

            if (plato.kcal_totales) {
                const etiquetaKcal = document.createElement('span');
                etiquetaKcal.textContent = `🔥 ${plato.kcal_totales} kcal`;
                etiquetaKcal.style.color = '#e67e22';
                etiquetaKcal.style.fontWeight = 'bold';
                contenedorDerecha.appendChild(etiquetaKcal);
            }
            if (plato.proteina_total) {
                const etiquetaProt = document.createElement('span');
                etiquetaProt.textContent = `🥩 ${plato.proteina_total}g Prot`;
                etiquetaProt.style.color = '#2980b9';
                etiquetaProt.style.fontWeight = 'bold';
                contenedorDerecha.appendChild(etiquetaProt);
            }
            cabeceraMacros.appendChild(contenedorDerecha);
            platoContenedor.appendChild(cabeceraMacros);
        }

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

        // 1. MODO ORDENAMIENTO (LISTA PLANA)
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
                contenedorPlano.appendChild(crearTarjetaPlato(plato, true)); 
            });
            
            if(recetasUnicas.length === 0) {
                contenedorPlano.innerHTML += '<p style="padding:15px">No hay comidas ni cenas para mostrar.</p>';
            }

            contenedorMenu.appendChild(contenedorPlano);
            return; 
        }

        // 2. MODO CALENDARIO
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

            let totalKcalDia = 0;
            let totalProtDia = 0;
            platosDelDia.forEach(plato => {
                if (plato.kcal_totales) totalKcalDia += Number(plato.kcal_totales);
                if (plato.proteina_total) totalProtDia += Number(plato.proteina_total);
            });

            const diaCard = document.createElement('div');
            diaCard.className = 'dia-card';

            const tituloDia = document.createElement('h2');
            tituloDia.className = 'dia-titulo';
            tituloDia.style.display = 'flex';
            tituloDia.style.justifyContent = 'space-between';
            tituloDia.style.alignItems = 'center';

            const spanDia = document.createElement('span');
            spanDia.textContent = dia;
            tituloDia.appendChild(spanDia);

            if (totalKcalDia > 0 || totalProtDia > 0) {
                const contenedorTotales = document.createElement('div');
                contenedorTotales.style.display = 'flex';
                contenedorTotales.style.gap = '15px';
                contenedorTotales.style.fontSize = '0.75em';
                
                if (totalKcalDia > 0) {
                    const spanKcal = document.createElement('span');
                    spanKcal.textContent = `${Math.round(totalKcalDia)} kcal`; 
                    spanKcal.style.color = '#fffd';
                    contenedorTotales.appendChild(spanKcal);
                }
                
                if (totalProtDia > 0) {
                    const spanProt = document.createElement('span');
                    spanProt.textContent = `${Math.round(totalProtDia)}gr Prot`;
                    spanProt.style.color = '#fffd';
                    contenedorTotales.appendChild(spanProt);
                }
                tituloDia.appendChild(contenedorTotales);
            }
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

                const comidaSeccion = document.createElement(seccion.plegable ? 'details' : 'div');
                comidaSeccion.className = 'comida-seccion';

                let kcalSeccion = 0;
                let protSeccion = 0;
                platosDeEstaSeccion.forEach(p => {
                    if (p.kcal_totales) kcalSeccion += Number(p.kcal_totales);
                    if (p.proteina_total) protSeccion += Number(p.proteina_total);
                });

                const cabeceraSeccion = document.createElement(seccion.plegable ? 'summary' : 'div');
                cabeceraSeccion.style.display = 'flex';
                cabeceraSeccion.style.justifyContent = 'space-between';
                cabeceraSeccion.style.alignItems = 'center';
                cabeceraSeccion.style.borderBottom = '2px solid #ecf0f1';
                cabeceraSeccion.style.padding = '8px 5px';
                cabeceraSeccion.style.outline = 'none';
                cabeceraSeccion.style.listStyle = 'none'; // Oculta el triángulo por defecto del navegador

                // Estilos específicos de interactividad para secciones desplegables
                if (seccion.plegable) {
                    cabeceraSeccion.style.cursor = 'pointer';
                    cabeceraSeccion.style.borderRadius = '6px';
                    cabeceraSeccion.style.transition = 'background-color 0.2s ease';
                    
                    cabeceraSeccion.addEventListener('mouseenter', () => {
                        cabeceraSeccion.style.backgroundColor = '#f8f9fa';
                    });
                    cabeceraSeccion.addEventListener('mouseleave', () => {
                        cabeceraSeccion.style.backgroundColor = 'transparent';
                    });
                }

                // Lado izquierdo: Flecha de estado + Título
                const tituloContenedor = document.createElement('div');
                tituloContenedor.style.display = 'flex';
                tituloContenedor.style.alignItems = 'center';
                tituloContenedor.style.gap = '8px';

                let iconoFlecha = null;
                if (seccion.plegable) {
                    iconoFlecha = document.createElement('span');
                    iconoFlecha.textContent = '▶'; // Flecha cerrada por defecto
                    iconoFlecha.style.fontSize = '0.8em';
                    iconoFlecha.style.color = '#e67e22';
                    iconoFlecha.style.transition = 'transform 0.2s ease';
                    tituloContenedor.appendChild(iconoFlecha);

                    // Escuchamos el cambio de estado para orientar la flecha
                    comidaSeccion.addEventListener('toggle', () => {
                        if (comidaSeccion.open) {
                            iconoFlecha.textContent = '▼';
                        } else {
                            iconoFlecha.textContent = '▶';
                        }
                    });
                }

                const tipoEtiqueta = document.createElement('span');
                tipoEtiqueta.className = 'tipo-comida';
                tipoEtiqueta.textContent = seccion.titulo;
                tipoEtiqueta.style.margin = '0';
                tituloContenedor.appendChild(tipoEtiqueta);

                cabeceraSeccion.appendChild(tituloContenedor);

                // Lado derecho: Macros
                if (kcalSeccion > 0 || protSeccion > 0) {
                    const macrosSeccion = document.createElement('div');
                    macrosSeccion.style.display = 'flex';
                    macrosSeccion.style.gap = '15px';
                    macrosSeccion.style.fontSize = '0.9em';
                    
                    if (kcalSeccion > 0) {
                        const sKcal = document.createElement('span');
                        sKcal.textContent = `${Math.round(kcalSeccion)} kcal`;
                        sKcal.style.color = '#444';
                        sKcal.style.fontWeight = 'bold';
                        macrosSeccion.appendChild(sKcal);
                    }
                    if (protSeccion > 0) {
                        const sProt = document.createElement('span');
                        sProt.textContent = `${Math.round(protSeccion)}g Prot`;
                        sProt.style.color = '#444';
                        sProt.style.fontWeight = 'bold';
                        macrosSeccion.appendChild(sProt);
                    }
                    cabeceraSeccion.appendChild(macrosSeccion);
                }

                comidaSeccion.appendChild(cabeceraSeccion);

                const platosContenedorInner = document.createElement('div');
                platosContenedorInner.style.marginTop = '10px';

                platosDeEstaSeccion.forEach(plato => {
                    platosContenedorInner.appendChild(crearTarjetaPlato(plato, false));
                });

                comidaSeccion.appendChild(platosContenedorInner);

                diaCard.appendChild(comidaSeccion);
            });

            contenedorMenu.appendChild(diaCard);
        });
    }
});