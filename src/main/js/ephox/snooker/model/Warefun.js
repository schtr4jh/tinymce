define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (Arr, Array) {

    var render = function (structure) {

      var getColumn = function (grid, index) {
        return Arr.map(grid, function (row) {
          return row[index];
        });
      };

      var getRow = function (grid, index) {
        return grid[index];
      };


      var findDiff = function (xs, comp) {
        if (xs.length === 0) return 0;
        var first = xs[0];
        var index = Arr.findIndex(xs, function (x) {
          return !comp(first, x);
        });
        return index === -1 ? xs.length : index;
      };

      var extract = function (line, what) {
        var current = 0;
        var cells = [];
        while (current < line.length) {
          var slice = line.slice(current);
          var span = findDiff(slice, function (x, y) { return x === y; });
          var res = {};
          res[what] = span;
          res.element = line[current];
          cells.push(res);
          current += span;
        }
        return cells;
      };


      var result = {};
      for (var i=0; i<structure.length; i++) {
        var rowToAnalyse = getRow(structure, i);
        var colToAnalyse = getColumn(structure, i);

        var row = extract(rowToAnalyse, 'colspan');
        var col = extract(colToAnalyse, 'rowspan');
        console.log('row',row);
        // Qui abbiamo row X / col X.
        // So we can merge them together.


        for (var rowIndex = 0; rowIndex<row.length; rowIndex++) {
          result[rowIndex] = {};
          for (var colIndex = 0; colIndex<col.length; colIndex++) {


            // We are in the same row



              result[rowIndex].element = row[rowIndex].element;
              result[rowIndex].colspan = row[rowIndex].colspan;
              result[colIndex].rowspan = col[colIndex].rowspan;
          }
        }





      }

      return result;






    };

    return {
      render: render
    };
  }
);