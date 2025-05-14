import DefaultLayout from "@/layouts/default"
import { EditorView } from "@/apps/editor"
import { useRouter } from "next/router"

const EditorPage = () => {
    const router = useRouter()
    const dag: string | undefined = 
        typeof router.query.dag === "string" && router.query.dag.length > 0 ?
            router.query.dag :
            undefined
    return <DefaultLayout>
        { dag && <EditorView dagName={dag} /> }
    </DefaultLayout>
}

export default EditorPage