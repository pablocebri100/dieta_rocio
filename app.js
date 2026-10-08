document.addEventListener('DOMContentLoaded', () => {
    const contenedorMenu = document.getElementById('contenedor-menu');
    const filtroDias = document.getElementById('filtro-dias');

    let datosMenu = [];
    
    const ordenDias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
    const ordenComidas = ["DESAYUNO", "COMIDA", "MERIENDA", "CENA"];

    fetch('menu.json')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            datosMenu = data;
            renderizarMenu('TODOS');
        })
        .catch(error => {
            console.error('Error:', error);
            contenedorMenu.innerHTML = `<p style="text-align:center; padding: 2rem;">Error al cargar el menú. Asegúrate de ejecutar un servidor local.</p>`;
        });

    filtroDias.addEventListener('change', (e) => {
        renderizarMenu(e.target.value);
    });

    function renderizarMenu(diaSeleccionado) {
        contenedorMenu.innerHTML = ''; 

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

            // Agrupar por TIPO de comida (Desayuno, Comida, etc.)
            ordenComidas.forEach(tipoActual => {
                // Filtramos todos los platos de este día que correspondan a este tipo
                const platosDeEsteTipo = platosDelDia.filter(p => p.tipo === tipoActual);
                
                if (platosDeEsteTipo.length === 0) return; // Si no hay platos de este tipo, saltamos

                // Crear la sección de la comida (Solo aparece una vez por tipo)
                const comidaSeccion = document.createElement('div');
                comidaSeccion.className = 'comida-seccion';

                const tipoEtiqueta = document.createElement('span');
                tipoEtiqueta.className = 'tipo-comida';
                tipoEtiqueta.textContent = tipoActual;
                comidaSeccion.appendChild(tipoEtiqueta);

                // Imprimir cada plato dentro de esta sección
                platosDeEsteTipo.forEach(plato => {
                    const platoContenedor = document.createElement('div');
                    platoContenedor.className = 'plato-contenedor';

                    const platoHeader = document.createElement('div');
                    platoHeader.className = 'plato-header';

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
                    if (plato.imagen && !plato.imagen.includes('imagen_no_encontrada')) {
                        const img = document.createElement('img');
                        img.className = 'plato-img';
                        img.alt = plato.nombre;
                        img.src = plato.imagen;
                        img.onerror = () => img.style.display = 'none'; 
                        platoHeader.appendChild(img);
                    }

                    
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

                    comidaSeccion.appendChild(platoContenedor);
                });

                diaCard.appendChild(comidaSeccion);
            });

            contenedorMenu.appendChild(diaCard);
        });
    }
});