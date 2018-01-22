/**
 * TableCommands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { CopyRows } from '@ephox/snooker';
import { TableFill } from '@ephox/snooker';
import { TableLookup } from '@ephox/snooker';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import Tools from 'tinymce/core/util/Tools';
import Util from '../alien/Util';
import TableTargets from '../queries/TableTargets';
import TableDialog from '../ui/TableDialog';
import RowDialog from '../ui/RowDialog';
import CellDialog from '../ui/CellDialog';

const each = Tools.each;

let clipboardRows = Option.none();

const getClipboardRows = function () {
  return clipboardRows.fold(function () {
    return;
  }, function (rows) {
    return Arr.map(rows, function (row) {
      return row.dom();
    });
  });
};

const setClipboardRows = function (rows) {
  const sugarRows = Arr.map(rows, Element.fromDom);
  clipboardRows = Option.from(sugarRows);
};

const registerCommands = function (editor, actions, cellSelection, selections) {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = function () {
    const cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    const table = TableLookup.table(cell, isRoot);
    table.filter(Fun.not(isRoot)).each(function (table) {
      const cursor = Element.fromText('');
      Insert.after(table, cursor);
      Remove.remove(table);
      const rng = editor.dom.createRng();
      rng.setStart(cursor.dom(), 0);
      rng.setEnd(cursor.dom(), 0);
      editor.selection.setRng(rng);
    });
  };

  const getSelectionStartCell = function () {
    return Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
  };

  const getTableFromCell = function (cell) {
    return TableLookup.table(cell, isRoot);
  };

  const actOnSelection = function (execute) {
    const cell = getSelectionStartCell();
    const table = getTableFromCell(cell);
    table.each(function (table) {
      const targets = TableTargets.forMenu(selections, table, cell);
      execute(table, targets).each(function (rng) {
        editor.selection.setRng(rng);
        editor.focus();
        cellSelection.clear(table);
      });
    });
  };

  const copyRowSelection = function (execute?) {
    const cell = getSelectionStartCell();
    const table = getTableFromCell(cell);
    return table.bind(function (table) {
      const doc = Element.fromDom(editor.getDoc());
      const targets = TableTargets.forMenu(selections, table, cell);
      const generators = TableFill.cellOperations(Fun.noop, doc, Option.none());
      return CopyRows.copyRows(table, targets, generators);
    });
  };

  const pasteOnSelection = function (execute) {
    // If we have clipboard rows to paste
    clipboardRows.each(function (rows) {
      const clonedRows = Arr.map(rows, function (row) {
        return Replication.deep(row);
      });
      const cell = getSelectionStartCell();
      const table = getTableFromCell(cell);
      table.bind(function (table) {
        const doc = Element.fromDom(editor.getDoc());
        const generators = TableFill.paste(doc);
        const targets = TableTargets.pasteRows(selections, table, cell, clonedRows, generators);
        execute(table, targets).each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
        });
      });
    });
  };

  // Register action commands
  each({
    mceTableSplitCells () {
      actOnSelection(actions.unmergeCells);
    },

    mceTableMergeCells () {
      actOnSelection(actions.mergeCells);
    },

    mceTableInsertRowBefore () {
      actOnSelection(actions.insertRowsBefore);
    },

    mceTableInsertRowAfter () {
      actOnSelection(actions.insertRowsAfter);
    },

    mceTableInsertColBefore () {
      actOnSelection(actions.insertColumnsBefore);
    },

    mceTableInsertColAfter () {
      actOnSelection(actions.insertColumnsAfter);
    },

    mceTableDeleteCol () {
      actOnSelection(actions.deleteColumn);
    },

    mceTableDeleteRow () {
      actOnSelection(actions.deleteRow);
    },

    mceTableCutRow (grid) {
      clipboardRows = copyRowSelection();
      actOnSelection(actions.deleteRow);
    },

    mceTableCopyRow (grid) {
      clipboardRows = copyRowSelection();
    },

    mceTablePasteRowBefore (grid) {
      pasteOnSelection(actions.pasteRowsBefore);
    },

    mceTablePasteRowAfter (grid) {
      pasteOnSelection(actions.pasteRowsAfter);
    },

    mceTableDelete: eraseTable
  }, function (func, name) {
    editor.addCommand(name, func);
  });

  // Register dialog commands
  each({
    mceInsertTable: Fun.curry(TableDialog.open, editor),
    mceTableProps: Fun.curry(TableDialog.open, editor, true),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, function (func, name) {
    editor.addCommand(name, function (ui, val) {
      func(val);
    });
  });
};

export default {
  registerCommands,
  getClipboardRows,
  setClipboardRows
};