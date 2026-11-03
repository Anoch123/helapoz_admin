import { CreateShopForm } from "@/components/forms/create-shop-form";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

export default function ManageShopsNewPage() {
  return (
    <main>
      <ModulesPageHeader
        title="New Shop"
        subtitle="Create a new shop here"
        />

      <CreateShopForm />
    </main>
  );
}