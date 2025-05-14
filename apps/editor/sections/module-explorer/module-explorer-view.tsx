import ExplorerPanel from './components/explorer-panel';
import ExplorerToggleButton from './components/explorer-toggle-button';

import { useInitModuleExplorerState, useModuleExplorerState } from './module-explorer-state';

export default function ModuleExplorerView() {
    useInitModuleExplorerState()
    const state = useModuleExplorerState((state) => state)

    return (<>
        <ExplorerToggleButton position='top-right' onClick={state.togglePanel} />
        {state.panelShown && <ExplorerPanel modules={state.modules} />}
    </>);
}
