// script.js

// Factores de emisión para Colombia (en kg CO₂e)
// Ajustados para que sean más granular
const FACTORES = {
    electricidad: 0.193, // kg por kWh
    gasolina: 0.17,      // kg por km
    transportePublico: 0.05, // kg por km (aprox. para bus urbano)
    // Para alimentación, usaremos una base y ajustaremos por frecuencia
    // Estos son valores anuales base por persona para cada categoría, que luego ajustamos por frecuencia
    alimentos: {
        carneRoja_frecuencia: {
            "0": 0,       // Nunca
            "1-2": 800,   // Bajo
            "3-4": 1600,  // Medio
            "4+": 2400    // Alto
        },
        aves_cerdo_frecuencia: {
            "0": 0,
            "1-2": 300,
            "3-4": 600,
            "4+": 900
        },
        lacteos_frecuencia: {
            "0": 0,
            "1-2": 200,
            "3-4": 400,
            "4+": 600
        },
        // Añadimos una base de vegetales/frutas que siempre se consume
        baseVegetales: 200 // kg CO2e anual para una dieta base de vegetales
    }
};

// Datos para la comparativa (en toneladas por año)
const PROMEDIOS = {
    colombia: 1.9,
    mundo: 4.7,
    meta2050: 2.0
};

// Referencias a los gráficos para poder actualizarlos
let graficoDesglose = null;
let graficoComparativa = null;

function calcularHuella() {
    // 1. LEER DATOS DEL USUARIO
    const kwh = parseFloat(document.getElementById('kwhMensual').value) || 0;
    const personas = parseInt(document.getElementById('personasHogar').value) || 1;
    const kmCoche = parseFloat(document.getElementById('kmCoche').value) || 0;
    const kmTransportePublico = parseFloat(document.getElementById('kmTransportePublico').value) || 0;

    const freqCarneRoja = document.getElementById('freqCarneRoja').value;
    const freqAvesCerdo = document.getElementById('freqAvesCerdo').value;
    const freqLacteos = document.getElementById('freqLacteos').value;

    // 2. CALCULAR EMISIONES ANUALES (en kg CO₂e)
    const emisionVivienda = (kwh / personas) * FACTORES.electricidad * 12; // Anual
    const emisionCoche = kmCoche * FACTORES.gasolina * 52; // Anual
    const emisionTransportePublico = kmTransportePublico * FACTORES.transportePublico * 52; // Anual

    // Emisiones de Alimentación
    const emisionCarneRoja = FACTORES.alimentos.carneRoja_frecuencia[freqCarneRoja];
    const emisionAvesCerdo = FACTORES.alimentos.aves_cerdo_frecuencia[freqAvesCerdo];
    const emisionLacteos = FACTORES.alimentos.lacteos_frecuencia[freqLacteos];
    const emisionBaseVegetales = FACTORES.alimentos.baseVegetales; // Siempre se incluye

    const emisionAlimentacion = emisionCarneRoja + emisionAvesCerdo + emisionLacteos + emisionBaseVegetales;

    // Suma Total Anual
    const totalAnualKg = emisionVivienda + emisionCoche + emisionTransportePublico + emisionAlimentacion;
    const totalAnualTon = totalAnualKg / 1000;

    // 3. MOSTRAR RESULTADOS
    document.getElementById('resultados').classList.remove('hidden');
    document.getElementById('huellaTotal').innerText = totalAnualTon.toFixed(2);
    document.getElementById('huellaTotalComparativa').innerText = totalAnualTon.toFixed(2);

    // 4. GENERAR GRÁFICOS
    // Gráfico de Desglose Personal (Pie Chart)
    const ctxDesglose = document.getElementById('graficoDesglose').getContext('2d');
    if (graficoDesglose) { graficoDesglose.destroy(); }
    graficoDesglose = new Chart(ctxDesglose, {
        type: 'pie',
        data: {
            labels: ['Vivienda', 'Transporte', 'Alimentación'],
            datasets: [{
                data: [emisionVivienda / 1000, (emisionCoche + emisionTransportePublico) / 1000, emisionAlimentacion / 1000], // en toneladas
                backgroundColor: ['#42a5f5', '#66bb6a', '#ffb300'], // Azules, Verdes, Naranjas
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Desglose de tu Huella de Carbono',
                    font: { size: 16 }
                }
            }
        }
    });

    // Gráfico de Comparativa (Bar Chart)
    const ctxComparativa = document.getElementById('graficoComparativa').getContext('2d');
    if (graficoComparativa) { graficoComparativa.destroy(); }
    graficoComparativa = new Chart(ctxComparativa, {
        type: 'bar',
        data: {
            labels: ['Tu Huella', 'Promedio Colombia', 'Promedio Mundial', 'Meta 2050'],
            datasets: [{
                label: 'Toneladas de CO₂e por año',
                data: [totalAnualTon, PROMEDIOS.colombia, PROMEDIOS.mundo, PROMEDIOS.meta2050],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)', // Tu Huella (Rojo)
                    'rgba(54, 162, 235, 0.8)', // Colombia (Azul)
                    'rgba(255, 206, 86, 0.8)', // Mundial (Amarillo)
                    'rgba(75, 192, 192, 0.8)'  // Meta 2050 (Verde)
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tu Huella vs. Promedios',
                    font: { size: 16 }
                },
                legend: {
                    display: false // No mostrar leyenda, los labels de las barras son suficientes
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Toneladas de CO₂e'
                    }
                }
            }
        }
    });
}