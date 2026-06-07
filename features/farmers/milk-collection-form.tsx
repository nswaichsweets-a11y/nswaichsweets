import Link from "next/link";
import { createModuleRecordAction } from "@/features/modules/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FarmerProfile } from "./farmer-service";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function MilkCollectionForm({ farmers, selectedFarmerId }: { farmers: FarmerProfile[]; selectedFarmerId?: string }) {
  const activeFarmers = farmers.filter((farmer) => farmer.active);
  const selectedFarmer = activeFarmers.find((farmer) => farmer.id === selectedFarmerId);

  if (activeFarmers.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-soft">
        <h3 className="text-lg font-bold">Create farmer profiles first</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Daily milk entries now use saved farmer profiles, so staff can select a farmer instead of typing full details every day.
        </p>
        <Button asChild className="mt-5">
          <Link href="/farmers/profiles">Open Farmer Profiles</Link>
        </Button>
      </section>
    );
  }

  return (
    <form action={createModuleRecordAction} className="grid gap-5 rounded-lg border border-border bg-white p-5 shadow-soft">
      <input type="hidden" name="moduleKey" value="farmers" />
      {selectedFarmer ? (
        <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-semibold">Adding milk for {selectedFarmer.name}</p>
          <p className="mt-1 text-muted-foreground">{selectedFarmer.phone}</p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="farmerId">Farmer profile *</Label>
          <select
            id="farmerId"
            name="farmerId"
            required
            defaultValue={selectedFarmer?.id}
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            {activeFarmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.name} - {farmer.phone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="collectionDate">Collection date *</Label>
          <Input id="collectionDate" name="collectionDate" type="date" defaultValue={todayInputValue()} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="session">Session *</Label>
          <select id="session" name="session" required className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20">
            <option value="MORNING">Morning</option>
            <option value="EVENING">Evening</option>
          </select>
        </div>
        <div>
          <Label htmlFor="quantityLitres">Quantity litres *</Label>
          <Input id="quantityLitres" name="quantityLitres" type="number" min="0" step="0.001" required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="fat">Fat</Label>
          <Input id="fat" name="fat" type="number" min="0" step="0.01" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="snf">SNF</Label>
          <Input id="snf" name="snf" type="number" min="0" step="0.01" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="ratePerLitre">Rate per litre *</Label>
          <Input id="ratePerLitre" name="ratePerLitre" type="number" min="0" step="0.01" required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="paidAmount">Advance paid</Label>
          <Input id="paidAmount" name="paidAmount" type="number" min="0" step="0.01" className="mt-2" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" className="mt-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="reset" variant="outline">Reset</Button>
        <Button type="submit">Add Daily Milk</Button>
      </div>
    </form>
  );
}
