define(
  'ephox.katamari.test.arb.ArbDataTypes',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.wrap.Jsc'
  ],

  function (Fun, Result, Jsc) {
    var show = function (res) {
      return res.fold(function (e) {
        return 'Result.error(' + e + ')';
      }, function (v) {
        return 'Result.value(' + v + ')';
      });
    };

    var resultError = Jsc.string.smap(function (e) {
      return Result.error(e);
    }, function (res) {
      return res.fold(Fun.identity, Fun.die('This should not happen'));
    }, show);

    var resultValue = Jsc.string.smap(function (e) {
      return Result.value(e);
    }, function (res) {
      return res.fold(Fun.die('This should not happen'), Fun.identity);
    }, show);

    var result = Jsc.oneof([ resultError, resultValue ]);


    var genIndexArrayOf = function (len) {
      return Jsc.integer(0, len).generator.map(function (aLength) {
        var r = [ ];
        for (var i = 0; i < aLength; i++) {
          r.push(i);
        }
        return r;
      });
    };

    var arbIndexArrayOf = function (len) {
      return Jsc.bless({
        generator: genIndexArrayOf(len)
      });
    };

    return {
      resultError: resultError,
      resultValue: resultValue,
      result: result,

      indexArrayOf: arbIndexArrayOf
    };
  }
);