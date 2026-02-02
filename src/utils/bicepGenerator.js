// Minimal Bicep generator module
// Exports: generateMain(params) -> { mainBicep, modules, parametersJson }

export function generateMain({ appName = 'app', location = 'eastus', components = [], parameters = {} } = {}) {
  const params = {
    appName: appName,
    location: location,
    ...parameters,
  };

  // Simple param block
  let main = `param appName string = '${params.appName}'\nparam location string = '${params.location}'\n\n`;

  // Resource stubs
  components.forEach((c, i) => {
    const type = c.type || 'unknown';
    const name = (c.config && c.config.name) || `${params.appName}-${type}-${i}`;
    main += `// Resource: ${type}\n`;
    main += `// name: ${name}\n`;
    // Minimal representation so users can see generated content
    main += `// config: ${JSON.stringify(c.config || {}, null, 2)}\n\n`;
  });

  // Example outputs section
  main += `output deploymentName string = 'generated-${Date.now()}'\n`;

  const modules = {}; // placeholder for future modular output
  const parametersJson = JSON.stringify(params, null, 2);

  return { mainBicep: main, modules, parametersJson };
}

export default { generateMain };
