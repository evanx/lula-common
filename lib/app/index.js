const buildServices = (app, serviceFactories) => {
  return Object.entries(serviceFactories).reduce(
    (services, [name, factory]) => {
      services[name] = factory(app, app.monitor.child({ name }))
      return services
    },
    {},
  )
}

module.exports = { buildServices }
