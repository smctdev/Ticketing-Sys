import TopCard from "./top-card";
import BottomCard from "./bottom-card";
import BranchSupplierCard from "./branch-supplier-card";
import AdminDashboardLoader from "@/components/loaders/admin-dashboard";

export default function AdminDashboard({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const totalTickets =
    data?.tickets?.tickets_pending +
    data?.tickets?.tickets_rejected +
    data?.tickets?.tickets_edited;
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {isLoading ? (
        <AdminDashboardLoader />
      ) : (
        <>
          <BranchSupplierCard data={data} />

          <TopCard data={data} totalTickets={totalTickets} />

          <BottomCard data={data} totalTickets={totalTickets} />
        </>
      )}
    </div>
  );
}
