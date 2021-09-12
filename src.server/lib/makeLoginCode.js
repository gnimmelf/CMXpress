/**
 * Generate unique code
 */

var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var NUMBERS = '0123456789';

var generate_code = function(id_length, only_numerical) {
  var char_list = only_numerical ? NUMBERS : ALPHABET ;
  var rtn = '';
  for (var i = 0; i < id_length; i++) {
    rtn += char_list.charAt(Math.floor(Math.random() * char_list.length));
  }
  return rtn;
}

var UNIQUE_RETRIES = 9999;

module.exports = function(length=5, previous=[], only_numerical=true) {
  var retries = 0;
  var id;

  // Try to generate a unique ID,
  // i.e. one that isn't in the previous.
  while(!id && retries < UNIQUE_RETRIES) {
    id = generate_code(length, only_numerical);
    if(previous.indexOf(id) !== -1) {
      id = null;
      retries++;
    }
  }

  return id;
};