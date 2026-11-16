import { Link } from "react-router"
import {
  Async,
  EmptyState,
  PageSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta } from "@/shared/hooks"
import { tabOf, type BookingTab } from "../domain/status"
import { useMyBookings } from "../hooks"
import type { CustomerBooking } from "../types"
import { BookingRow } from "./BookingRow"
import { beginBooking } from "../store/wizard"

const TABS: { value: BookingTab; label: string; empty: string; action?: "book" }[] = [
  { value: "upcoming", label: "Mendatang", empty: "Belum ada booking mendatang.", action: "book" },
  { value: "done", label: "Selesai", empty: "Belum ada booking yang selesai." },
  { value: "cancelled", label: "Dibatalkan", empty: "Tidak ada booking yang dibatalkan." },
]

function sorted(list: CustomerBooking[], tab: BookingTab): CustomerBooking[] {
  const dir = tab === "upcoming" ? 1 : -1
  return [...list].sort((a, b) => dir * (new Date(a.start).getTime() - new Date(b.start).getTime()))
}

export function MyBookingsView() {
  usePageMeta("Booking saya")
  const q = useMyBookings()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Booking saya</h1>
      <Async query={q} skeleton={<PageSkeleton />}>
        {(all) => (
          <Tabs defaultValue="upcoming">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => {
              const rows = sorted(
                all.filter((b) => tabOf(b.status) === t.value),
                t.value,
              )
              return (
                <TabsContent key={t.value} value={t.value}>
                  {rows.length === 0 ? (
                    <EmptyState
                      title={t.empty}
                      action={
                        t.action ? (
                          <Link
                            to="/booking/data-tamu"
                            onClick={() => beginBooking()}
                            className={buttonVariants()}
                          >
                            Booking baru
                          </Link>
                        ) : undefined
                      }
                    />
                  ) : (
                    <ul className="divide-y rounded-xl bg-white px-3 shadow-card">
                      {rows.map((b) => (
                        <BookingRow key={b.id} booking={b} to={`/booking-saya/${b.id}`} />
                      ))}
                    </ul>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </Async>
    </div>
  )
}
