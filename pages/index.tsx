import { BrowserDagsView } from "@/apps/browser-dags";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {

  return (
    <DefaultLayout>
      <BrowserDagsView />
    </DefaultLayout>
  );
}
