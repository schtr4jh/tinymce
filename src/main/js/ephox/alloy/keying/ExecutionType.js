define(
  'ephox.alloy.keying.ExecutionType',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (EditableFields, Keys, KeyingType, KeyingTypes, AlloyLogger, KeyMatch, KeyRules, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.defaulted('useSpace', false),
      FieldSchema.defaulted('useEnter', true),
      FieldSchema.defaulted('useDown', false)
    ];

    var execute = function (component, simulatedEvent, executeInfo) {
      return executeInfo.execute()(component, simulatedEvent, component.element());
    };
    
    var getRules = function (component, simulatedEvent, executeInfo) {
      var spaceExec = executeInfo.useSpace() && !EditableFields.inside(component.element()) ? Keys.SPACE() : [ ];
      var enterExec = executeInfo.useEnter() ? Keys.ENTER() : [ ];
      var downExec = executeInfo.useDown() ? Keys.DOWN() : [ ];
      var execKeys = spaceExec.concat(enterExec).concat(downExec);

      return [
        KeyRules.rule( KeyMatch.inSet(execKeys), execute)
      ];
    };

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.none());
  }
);