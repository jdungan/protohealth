"use strict";
var healthdata = (function (){
  var options = {
    endpoint: '/json',
    domain: !document.domain.match(/localhost/i) && document.domain || 'localhost:1984' 
  };

  //generic call
  var call_api = function(resource, ajax_params) {
    ajax_params = ajax_params || {};
    return $.ajax({
      type: "get",
      url: "http://" + options.domain + options.endpoint +resource,
      data: ajax_params,
      dataType: 'json',
    })
  };

  function API(domain){
    options.domain = domain || options.domain;
    var call_map = [
      ['datasets','/datasets'],
      ['json',''],
      
    ];
    call_map.forEach(function(value) {
      this.prototype[value[0]] = function (params) {
        return call_api(value[1], params)
      }
    },API);

  }  
  
  return API;

}());


