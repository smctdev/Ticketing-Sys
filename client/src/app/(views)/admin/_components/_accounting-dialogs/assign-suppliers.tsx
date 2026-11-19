import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  // accounting staff row gikan sa table
  user: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchData: () => void;
};

const extractList = (res: any): any[] =>
  Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

export default function AssignSuppliersDialog({
  user,
  open,
  setOpen,
  fetchData,
}: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loginId = user?.login_id;

  // Load suppliers ug ang na-assign na kung ma-open ang dialog
  useEffect(() => {
    if (!open || !loginId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [allRes, assignedRes] = await Promise.all([
          api.get("/all-suppliers"),
          api.get(`/accounting-staff/${loginId}/suppliers`),
        ]);
        setSuppliers(extractList(allRes.data));
        setSelected(extractList(assignedRes.data).map((id: any) => Number(id)));
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load suppliers", {
          description: err?.response?.data?.message,
          position: "bottom-center",
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [open, loginId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      String(s.suppliers ?? "")
        .toLowerCase()
        .includes(q),
    );
  }, [suppliers, search]);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Select all / clear para sa gi-filter lang nga results
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.includes(Number(s.id)));

  const toggleAllFiltered = () => {
    const ids = filtered.map((s) => Number(s.id));
    setSelected((prev) =>
      allFilteredSelected
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids])),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put(`/accounting-staff/${loginId}/suppliers`, {
        supplier_ids: selected,
      });
      toast.success("Success", {
        description: response.data?.message ?? "Suppliers updated.",
        position: "bottom-center",
      });
      setOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save suppliers", {
        description: err?.response?.data?.message,
        position: "bottom-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign suppliers</DialogTitle>
          <DialogDescription>
            {user?.full_name ?? "Accounting staff"} mo-handle ug Item
            Receipt-PO tickets para sa mga napili nga supplier. Kung walay
            napili, siya ang default para sa tanang supplier nga walay assigned
            staff.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selected.length} selected
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={toggleAllFiltered}
              disabled={isLoading || filtered.length === 0}
            >
              {allFilteredSelected ? "Clear shown" : "Select shown"}
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border p-2">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                No suppliers found
              </p>
            ) : (
              filtered.map((supplier) => {
                const id = Number(supplier.id);
                return (
                  <label
                    key={id}
                    htmlFor={`supplier-${id}`}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      id={`supplier-${id}`}
                      checked={selected.includes(id)}
                      onCheckedChange={() => toggle(id)}
                    />
                    {String(supplier.suppliers ?? "").trim()}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}