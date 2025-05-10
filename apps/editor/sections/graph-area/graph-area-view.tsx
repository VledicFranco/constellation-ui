import { Button } from "@heroui/button"
import { ModuleBarApi } from "../module-bar"

const GraphAreaView = () => 
    <div>
        <h1>Graph Area</h1>
        <Button color="primary" onPress={() => {
            console.log("Button Pressed")
            ModuleBarApi.addModule()
        }}>Add Module</Button>
    </div>

export default GraphAreaView