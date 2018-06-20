import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Merger, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { SugarElement } from '../../alien/TypeDefinitions';

import * as DefaultEvents from '../../events/DefaultEvents';
import * as Tagger from '../../registry/Tagger';
import * as CustomSpec from '../../spec/CustomSpec';
import { NoContextApi } from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as Component from './Component';
import { AlloyComponent, ComponentApi } from './ComponentApi';
import { SimpleSpec, SimpleOrSketchSpec, AlloySpec, PremadeSpec } from '../../api/component/SpecTypes';

const buildSubcomponents = (spec: SimpleOrSketchSpec): AlloyComponent[] => {
  const components = Objects.readOr('components', [ ])(spec);
  return Arr.map(components, build);
};

const buildFromSpec = (userSpec: SimpleOrSketchSpec): Result<AlloyComponent, string> => {
  const spec: SimpleOrSketchSpec = CustomSpec.make(userSpec);

  // Build the subcomponents
  const components: AlloyComponent[] = buildSubcomponents(spec);

  const completeSpec: SimpleOrSketchSpec = Merger.deepMerge(
    DefaultEvents,
    spec,
    Objects.wrap('components', components)
  );

  return Result.value(
    Component.build(completeSpec)
  );
};

const text = (textContent: string): PremadeSpec => {
  const element = Element.fromText(textContent);

  return external({
    element
  });
};

// Rename.
export interface ExternalElement { uid ?: string; element: SugarElement; }
const external = (spec: ExternalElement): PremadeSpec => {
  const extSpec = ValueSchema.asStructOrDie('external.component', ValueSchema.objOfOnly([
    FieldSchema.strict('element'),
    FieldSchema.option('uid')
  ]), spec);

  const systemApi = Cell(NoContextApi());

  const connect = (newApi) => {
    systemApi.set(newApi);
  };

  const disconnect = () => {
    systemApi.set(NoContextApi(() => {
      return me;
    }));
  };

  extSpec.uid().each((uid) => {
    Tagger.writeOnly(extSpec.element(), uid);
  });

  const me = ComponentApi({
    getSystem: systemApi.get,
    config: Option.none,
    hasConfigured: Fun.constant(false),
    connect,
    disconnect,
    element: Fun.constant(extSpec.element()),
    spec: Fun.constant(spec),
    readState: Fun.constant('No state'),
    syncComponents: Fun.noop,
    components: Fun.constant([ ]),
    events: Fun.constant({ })
  }) as AlloyComponent;
  return GuiTypes.premade(me);
};

// INVESTIGATE: A better way to provide 'meta-specs'
const build = (spec: AlloySpec): AlloyComponent => {
  return GuiTypes.getPremade(spec).fold(() => {
    const userSpecWithUid = Merger.deepMerge({ uid: Tagger.generate('') }, spec);
    return buildFromSpec(userSpecWithUid).getOrDie();
  }, (prebuilt) => {
    return prebuilt;
  });
};

const premade = GuiTypes.premade;

export {
  build,
  premade,
  external,
  text
};