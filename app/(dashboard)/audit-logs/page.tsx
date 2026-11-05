import AuditLogsContent from "@/components/widgets/audit-logs/audit-logs-content";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <ModulesPageHeader
        title="Audit Logs"
        subtitle="Monitor administrative activities and changes across Helpaz."
      />

      <AuditLogsContent />
    </div>
  );
}