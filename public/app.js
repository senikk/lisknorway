var Helper = {
  api: axios.create({
    baseURL: 'http://192.168.99.100:7000/api/dapps/9162474935058545118/api/'
  })
};

riot.mixin('Helper', Helper);
riot.mount('app');
riot.route.start(true);