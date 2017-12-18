getURLParameter = function(name) {
  return decodeParameters(name, location.search);
}

decodeParameters = function(name, string) {
  var result;
  result = decodeURI((RegExp("[\\?&]" + name + "=([^&#]*)").exec(string) || [null, null])[1]);
  if (result === "null") {
    return null;
  } else {
    return result;
  }
}

parametersObject = function(string) {
  var i, key, len, param, ref, val;
  params = {};
  ref = string.replace(/&amp;/g, '&').split('&');
  for (i = 0, len = ref.length; i < len; i++) {
    param = ref[i];
    key = param.split('=')[0];
    val = param.split('=')[1];
    params[key] = val;
  }
  return params;
}

setParametersFromURL = function(idNameMap) {
  var id, name, results, val;
  results = [];
  for (id in idNameMap) {
    name = idNameMap[id];
    val = getURLParameter(name);
    if (val) {
      results.push($(id).val(val));
    } else {
      results.push(void 0);
    }
  }
  return results;
}
