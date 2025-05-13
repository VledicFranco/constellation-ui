import ExplorerPanel from './components/explorer-panel';
import ExplorerToggleButton from './components/explorer-toggle-button';

import { useDisclosure } from '@heroui/react';

export default function ModuleExplorerView() {

    const { 
        isOpen: isShown,
        onOpen: open,
        onClose: close 
    } = useDisclosure();

    const toggle = () => {
        console.log('toggle')
        isShown ? close() : open()
    }

    return <>
        <ExplorerToggleButton position='top-right' onClick={toggle} />
        {isShown && <ExplorerPanel />}
    </>
}
