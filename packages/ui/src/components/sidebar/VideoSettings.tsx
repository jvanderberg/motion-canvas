import {RendererState} from '@motion-canvas/core';
import {useApplication} from '../../contexts';
import {useRendererState, useScenes, useStorage} from '../../hooks';
import {openOutputPath} from '../../utils';
import {Button, ButtonSelect, Group, Label, Separator} from '../controls';
import {Expandable} from '../fields';
import {MetaFieldView} from '../meta';
import {Pane} from '../tabs';

export function VideoSettings() {
  const {meta} = useApplication();
  const [processId, setProcess] = useStorage('main-action', 0);

  return (
    <Pane title="Video Settings" id="settings-pane">
      <Expandable title={meta.shared.name} open>
        <MetaFieldView field={meta.shared} />
      </Expandable>
      <Expandable title={meta.preview.name} open>
        <MetaFieldView field={meta.preview} />
      </Expandable>
      <Expandable title={meta.rendering.name} open>
        <MetaFieldView field={meta.rendering} />
        <Separator />
        <Group>
          <Label />
          <ProcessButton processId={processId} setProcess={setProcess} />
        </Group>
        {processId === 0 && (
          <Group>
            <Label />
            <Button
              title="Reveal the output directory in file explorer"
              onClick={openOutputPath}
            >
              Output Directory
            </Button>
          </Group>
        )}
      </Expandable>
    </Pane>
  );
}

interface ProcessButtonProps {
  processId: number;
  setProcess: (id: number) => void;
}

function ProcessButton({processId, setProcess}: ProcessButtonProps) {
  const {renderer, presenter, meta, project, player} = useApplication();
  const rendererState = useRendererState();
  const scenes = useScenes();

  return rendererState === RendererState.Initial ? (
    <ButtonSelect
      main
      id="render"
      value={processId}
      onChange={setProcess}
      onClick={() => {
        if (processId === 0) {
          const allScenes = player.allScenes;
          const isFiltered =
            scenes.length > 0 && scenes.length < allScenes.length;
          const filteredNames = isFiltered
            ? scenes.map(s => s.name)
            : undefined;
          renderer.render({
            ...meta.getFullRenderingSettings(),
            name:
              filteredNames && filteredNames.length === 1
                ? filteredNames[0]
                : project.name,
            ...(filteredNames && {sceneNames: filteredNames}),
          });
        } else {
          presenter.present({
            ...meta.getFullRenderingSettings(),
            name: project.name,
            slide: null,
          });
        }
      }}
      options={[
        {
          value: 0,
          text: 'Render',
        },
        {value: 1, text: 'Present'},
      ]}
    />
  ) : (
    <Button
      main
      loading
      id="render"
      data-rendering={true}
      disabled={rendererState === RendererState.Aborting}
      onClick={() => {
        renderer.abort();
      }}
    >
      {rendererState === RendererState.Working ? 'Abort' : 'Aborting'}
    </Button>
  );
}
