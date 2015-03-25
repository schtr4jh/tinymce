define(
  'ephox.robin.util.WordSanitiser',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.data.WordScope'
  ],

  function (Arr, Option, WordScope) {

    var whitelist = ['\'twas'];

    var trimStart = function (ws) {
      var word = ws.word();
      return WordScope(word.substring(1), Option.some('\''), ws.right());
    };

    var trimEnd = function (ws) {
      var word = ws.word();
      return WordScope(word.substring(0, word.length - 1), ws.left(), Option.some('\''));
    };

    var isQuote = function (s) {
      return s === '\'';
    };

    var rhs = function (ws) {
      var word = ws.word();
      var trailing = word.length >= 2 && isQuote(word.charAt(word.length - 1)) && !isQuote(word.charAt(word.length - 2));
      return trailing ? trimEnd(ws) : ws;
    };

    var lhs = function (ws) {
      var word = ws.word();
      var whitelisted = Arr.exists(whitelist, function (x) {
        return word.indexOf(x) > -1;
      });

      var apostrophes = whitelisted ? 2 : 1;
      var quoted = word.substring(0, apostrophes);

      var leading = Arr.forall(quoted, isQuote) && !isQuote(word.charAt(apostrophes));

      return leading ? trimStart(ws) : ws;
    };

    /**
     * If there are quotes at the edges of the WordScope, this determines if they are part of the word
     *
     * ws: WordScope
     */
    var scope = function (ws) {
      var r = rhs(ws);
      return lhs(r);
    };

    /**
     * Extracts the actual word from the text using scope()
     */
    var text = function (word) {
      var ws = WordScope(word, Option.none(), Option.none());
      var r = scope(ws);
      return r.word();
    };

    return {
      scope: scope,
      text: text
    };
  }
);
