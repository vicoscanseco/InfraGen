import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function createAppTour() {
  return driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0,0,0,0.5)',
    stagePadding: 8,
    stageRadius: 8,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Listo!',
    progressText: 'Paso {{current}} de {{total}}',
    steps: [
      {
        popover: {
          title: '👋 Bienvenido a InfraGen',
          description:
            'InfraGen genera código Bicep listo para desplegar infraestructura en Azure. Este tour te muestra cómo usarlo en menos de 2 minutos.',
          side: 'over',
          align: 'center',
        },
      },
      {
        element: '#tour-base-config',
        popover: {
          title: '1. Configuración base',
          description:
            'Empieza aquí. Selecciona el <strong>ambiente</strong> (dev, test, prod), la <strong>región Azure</strong> y escribe el <strong>nombre de tu aplicación</strong>. El grupo de recursos se genera automáticamente.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-available-components',
        popover: {
          title: '2. Componentes disponibles',
          description:
            'Haz clic en cualquier componente para agregarlo a tu infraestructura: App Service, SQL Database, Storage Account, Container Apps, Functions y más.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-configured-components',
        popover: {
          title: '3. Componentes configurados',
          description:
            'Aquí aparecen los componentes que ya agregaste. Usa <strong>Editar</strong> para ajustar cada recurso (SKU, nombre, opciones) o <strong>Quitar</strong> para eliminarlo.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-generate-buttons',
        popover: {
          title: '4. Generar infraestructura',
          description:
            '<strong>Generar Infraestructura</strong> produce el código Bicep listo para copiar o descargar. <strong>Vista de Arquitectura</strong> muestra un diagrama visual de los recursos y sus relaciones.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-cost-estimator',
        popover: {
          title: '5. Estimación de costos',
          description:
            'Estimación mensual aproximada basada en los componentes configurados y la región seleccionada. Los precios son referenciales de Azure.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-action-buttons',
        popover: {
          title: '6. Acciones adicionales',
          description:
            '<strong>Importar Bicep</strong>: carga un archivo .bicep existente para editarlo. <strong>Administrador Azure</strong>: despliega directamente desde el navegador usando Azure CLI.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        popover: {
          title: '¡Ya estás listo!',
          description:
            'Configura tu ambiente → agrega componentes → genera el Bicep → despliega. ¿Dudas? El botón <strong>Tutorial</strong> siempre está disponible en la barra superior.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  })
}
