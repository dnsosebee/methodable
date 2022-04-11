import {Block, BlockProps} from "./Block"

const ContextBlock = () => {
    
    const selectionStartCallback = () => {
        console.log("selection started")
    }

    const selectionEndCallback = () => {
        console.log("selection ended")
    }

    const blockProps: BlockProps = {
        tempNum: 1,
        selectionStartCallback,
        selectionEndCallback,
    }

    return(<Block {...blockProps}/>)
}

export default ContextBlock;