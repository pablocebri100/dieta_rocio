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

    // --- NUEVA FUNCIÓN: MODAL PRO PARA LAS ALTERNATIVAS ---
    function abrirModalReceta(plato) {
        const modalPrevio = document.getElementById('modal-receta');
        if (modalPrevio) modalPrevio.remove();

        const overlay = document.createElement('div');
        overlay.id = 'modal-receta';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.backdropFilter = 'blur(4px)'; 

        // Botón "X" exterior
        const btnCerrar = document.createElement('div');
        btnCerrar.innerHTML = '&times;';
        btnCerrar.style.position = 'absolute';
        btnCerrar.style.top = '20px';
        btnCerrar.style.right = '30px';
        btnCerrar.style.color = '#fff';
        btnCerrar.style.fontSize = '50px';
        btnCerrar.style.fontWeight = 'bold';
        btnCerrar.style.cursor = 'pointer';
        btnCerrar.style.zIndex = '10000';
        btnCerrar.style.lineHeight = '1';
        
        // Contenedor interno de la tarjeta
        const contenedorInterno = document.createElement('div');
        contenedorInterno.style.backgroundColor = '#fff';
        contenedorInterno.style.borderRadius = '12px';
        contenedorInterno.style.padding = '20px';
        contenedorInterno.style.maxWidth = '90%';
        contenedorInterno.style.width = '500px'; 
        contenedorInterno.style.maxHeight = '90vh';
        contenedorInterno.style.overflowY = 'auto';
        contenedorInterno.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        
        const tarjeta = crearTarjetaPlato(plato, true);
        
        // Limpiamos los botones interactivos dentro del modal para evitar recursividad
        const botonesModal = tarjeta.querySelectorAll('button');
        botonesModal.forEach(btn => {
            if(btn.textContent.includes('Similares')) {
                btn.nextElementSibling?.remove(); 
                btn.remove(); 
            }
        });

        contenedorInterno.appendChild(tarjeta);
        overlay.appendChild(btnCerrar);
        overlay.appendChild(contenedorInterno);
        document.body.appendChild(overlay);

        const cerrarModal = () => overlay.remove();
        btnCerrar.addEventListener('click', cerrarModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModal(); // Cierra si haces clic fuera de la tarjeta blanca
        });
    }

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
                etiquetaKcal.textContent = ` ${plato.kcal_totales} kcal`;
                etiquetaKcal.style.color = '#e67e22';
                etiquetaKcal.style.fontWeight = 'bold';
                contenedorDerecha.appendChild(etiquetaKcal);
            }
            if (plato.proteina_total) {
                const etiquetaProt = document.createElement('span');
                etiquetaProt.textContent = ` ${plato.proteina_total}g Prot`;
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

        // CONTENEDOR DE BOTONES (TIKTOK Y SIMILARES)
        const contenedorBotones = document.createElement('div');
        contenedorBotones.style.display = 'flex';
        contenedorBotones.style.gap = '10px';
        contenedorBotones.style.marginTop = '10px';
        contenedorBotones.style.flexWrap = 'wrap';

        if (plato.enlace_tiktok) {
            const btnTiktok = document.createElement('a');
            btnTiktok.className = 'btn-tiktok';
            btnTiktok.href = plato.enlace_tiktok;
            btnTiktok.target = '_blank';
            btnTiktok.textContent = 'Ver TikTok';
            btnTiktok.style.display = 'inline-block';
            btnTiktok.style.padding = '6px 12px';
            btnTiktok.style.backgroundColor = '#000';
            btnTiktok.style.color = '#fff';
            btnTiktok.style.textDecoration = 'none';
            btnTiktok.style.borderRadius = '4px';
            btnTiktok.style.fontSize = '0.9em';
            contenedorBotones.appendChild(btnTiktok);
        }

        const tipoParaAlternativa = (plato.tipo || '').toUpperCase();
        if (plato.kcal_totales && (tipoParaAlternativa === 'COMIDA' || tipoParaAlternativa === 'CENA')) {
            const btnAlternativas = document.createElement('button');
            btnAlternativas.textContent = 'Similar';
            btnAlternativas.style.padding = '6px 10px';
            btnAlternativas.style.backgroundColor = '#D4A373';
            btnAlternativas.style.color = 'white';
            btnAlternativas.style.border = 'none';
            btnAlternativas.style.borderRadius = '4px';
            btnAlternativas.style.cursor = 'pointer';
            btnAlternativas.style.fontSize = '0.9em';
            btnAlternativas.style.fontWeight = 'bold';

            const panelAlternativas = document.createElement('div');
            panelAlternativas.style.display = 'none';
            panelAlternativas.style.marginTop = '10px';
            panelAlternativas.style.padding = '12px';
            panelAlternativas.style.backgroundColor = '#faf0e5'; 
            panelAlternativas.style.border = '1px solid #d4b18f';
            panelAlternativas.style.borderRadius = '6px';
            panelAlternativas.style.fontSize = '0.9em';
            panelAlternativas.style.color = '#333';

            btnAlternativas.addEventListener('click', () => {
                if (panelAlternativas.style.display === 'block') {
                    panelAlternativas.style.display = 'none';
                    btnAlternativas.style.backgroundColor = '#D4A373';
                    return;
                }

                const misKcal = Number(plato.kcal_totales);
                const opciones = datosMenu.filter(p => {
                    if (p.id === plato.id) return false; 
                    if (!p.kcal_totales) return false;   
                    const tipoOpcion = (p.tipo || '').toUpperCase();
                    if (tipoOpcion !== 'COMIDA' && tipoOpcion !== 'CENA') return false; 
                    return Math.abs(Number(p.kcal_totales) - misKcal) <= 50;
                });

                panelAlternativas.innerHTML = ''; 
                if (opciones.length === 0) {
                    panelAlternativas.innerHTML = '<i>No hay opciones similares en un rango de ±50 kcal.</i>';
                } else {
                    const tituloPanel = document.createElement('strong');
                    tituloPanel.textContent = `Opciones entre ${Math.round(misKcal - 50)} y ${Math.round(misKcal + 50)} kcal:`;
                    tituloPanel.style.display = 'block';
                    tituloPanel.style.marginBottom = '10px';
                    panelAlternativas.appendChild(tituloPanel);

                    const listaUl = document.createElement('ul');
                    listaUl.style.margin = '0';
                    listaUl.style.paddingLeft = '20px';
                    
                    opciones.forEach(op => {
                        const li = document.createElement('li');
                        li.style.marginBottom = '6px';
                        
                        // Creación del enlace interactivo
                        const enlaceAlternativa = document.createElement('span');
                        enlaceAlternativa.textContent = op.nombre;
                        enlaceAlternativa.style.color = '#2980b9';
                        enlaceAlternativa.style.textDecoration = 'underline';
                        enlaceAlternativa.style.cursor = 'pointer';
                        enlaceAlternativa.style.fontWeight = 'bold';
                        
                        enlaceAlternativa.addEventListener('click', () => {
                            abrirModalReceta(op);
                        });
                        
                        const textoExtra = document.createTextNode(` (${op.tipo}) -  ${op.kcal_totales} kcal`);
                        
                        li.appendChild(enlaceAlternativa);
                        li.appendChild(textoExtra);
                        listaUl.appendChild(li);
                    });
                    panelAlternativas.appendChild(listaUl);
                }

                panelAlternativas.style.display = 'block';
                btnAlternativas.style.backgroundColor = '#e7b787'; 
            });

            contenedorBotones.appendChild(btnAlternativas);
            platoInfo.appendChild(contenedorBotones);
            platoInfo.appendChild(panelAlternativas);
        } else {
            if (plato.enlace_tiktok) {
                platoInfo.appendChild(contenedorBotones);
            }
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
                    spanKcal.style.color = '#fffe';
                    contenedorTotales.appendChild(spanKcal);
                }
                
                if (totalProtDia > 0) {
                    const spanProt = document.createElement('span');
                    spanProt.textContent = `${Math.round(totalProtDia)}g Prot`;
                    spanProt.style.color = '#fffe';
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
                if (seccion.plegable) {
                    comidaSeccion.style.cursor = 'pointer';
                    comidaSeccion.style.marginTop = '10px';
                    comidaSeccion.style.marginBottom = '10px';
                }

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
                cabeceraSeccion.style.listStyle = 'none'; 

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

                const tituloContenedor = document.createElement('div');
                tituloContenedor.style.display = 'flex';
                tituloContenedor.style.alignItems = 'center';
                tituloContenedor.style.gap = '8px';

                let iconoFlecha = null;
                if (seccion.plegable) {
                    iconoFlecha = document.createElement('span');
                    iconoFlecha.textContent = '▶'; 
                    iconoFlecha.style.fontSize = '0.8em';
                    iconoFlecha.style.color = '#e67e22';
                    iconoFlecha.style.transition = 'transform 0.2s ease';
                    tituloContenedor.appendChild(iconoFlecha);

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

                if (kcalSeccion > 0 || protSeccion > 0) {
                    const macrosSeccion = document.createElement('div');
                    macrosSeccion.style.display = 'flex';
                    macrosSeccion.style.gap = '15px';
                    macrosSeccion.style.fontSize = '0.9em';
                    
                    if (kcalSeccion > 0) {
                        const sKcal = document.createElement('span');
                        sKcal.textContent = `${Math.round(kcalSeccion)} Kcal`;
                        sKcal.style.color = '#444';
                        sKcal.style.fontWeight = 'bold';
                        macrosSeccion.appendChild(sKcal);
                    }
                    if (protSeccion > 0) {
                        const sProt = document.createElement('span');
                        sProt.textContent = `${Math.round(protSeccion)}Gr Prot`;
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