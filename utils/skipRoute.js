const skipRoute = (admittedRoutes) => {
  return (req, res, next) => {
    if (admittedRoutes.includes(req.params.id)) next('route');
    else next();
  };
};

module.exports = skipRoute;
