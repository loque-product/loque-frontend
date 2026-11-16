import { Suspense, type ComponentType } from "react"
import { createBrowserRouter, type RouteObject } from "react-router"
import { LoginReturn, CustomerLogin } from "@/features/auth"
import {
  GuestOnly,
  PublicAudience,
  RequireAuth,
  RequireBarber,
  RequirePasswordChanged,
  RequireCompleteProfile,
  RequireCustomer,
  RequireRole,
  RequireShop,
} from "./guards"
import { AuthLayout, StaffLayout, SuperAdminLayout } from "./layouts"
import { BarberLayout, CustomerLayout, PublicLayout, WizardLayout } from "./layouts/chrome"
import LoginRoute from "./routes/LoginRoute"
import NotFoundRoute from "./routes/NotFoundRoute"
import { resolveBasename } from "./basename"
import { routes } from "./routes/routeConfig"
import { RouteError } from "./routes/RouteError"

type Loader = () => Promise<{ default: ComponentType }>

/** Rute yang dimuat saat dibuka, jadi area publik, customer, dan staf tidak saling mengunduh kodenya. */
const page = (path: string, load: Loader): RouteObject => ({
  path,
  errorElement: <RouteError />,
  lazy: async () => ({ Component: (await load()).default }),
})

const toRoute = (r: (typeof routes)[number]) => ({
  path: r.path,
  errorElement: <RouteError />,
  element: (
    <RequireRole allow={r.allow}>
      {r.path.startsWith("/sa") ? (
        <Suspense fallback={null}>
          <r.element />
        </Suspense>
      ) : (
        <RequireShop>
          <Suspense fallback={null}>
            <r.element />
          </Suspense>
        </RequireShop>
      )}
    </RequireRole>
  ),
})

// Aplikasi bisa disajikan di subpath. `BASE_URL` berasal dari `base` Vite (`VITE_BASE_PATH`).
const basename = resolveBasename(import.meta.env.BASE_URL)

export const router = createBrowserRouter(
  [
    {
      element: <PublicAudience />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            page("/", () => import("./routes/public/HomeRoute")),
            page("/barber", () => import("./routes/public/BarberListRoute")),
            page("/b/:slug", () => import("./routes/public/BarberProfileRoute")),
            page("/toko", () => import("./routes/public/ShopInfoRoute")),
            page("/syarat", () => import("./routes/public/TermsRoute")),
            page("/privasi", () => import("./routes/public/PrivacyRoute")),
            page("/bantuan", () => import("./routes/public/HelpRoute")),
          ],
        },
      ],
    },
    {
      element: <GuestOnly />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            { path: "/masuk", element: <CustomerLogin /> },
            { path: "/staf/masuk", element: <LoginRoute /> },
          ],
        },
      ],
    },
    { element: <AuthLayout />, children: [{ path: "/masuk/kembali", element: <LoginReturn /> }] },
    {
      element: <RequireAuth />,
      children: [
        {
          element: <RequireCustomer />,
          children: [
            {
              element: <CustomerLayout />,
              children: [
                page("/akun/lengkapi", () => import("./routes/customer/CompleteProfileRoute")),
                {
                  element: <RequireCompleteProfile />,
                  children: [
                    page(
                      "/booking/status/:id",
                      () => import("./routes/customer/BookingStatusRoute"),
                    ),
                    page("/booking-saya", () => import("./routes/customer/MyBookingsRoute")),
                    page("/booking-saya/:id", () => import("./routes/customer/BookingDetailRoute")),
                    page(
                      "/booking-saya/:id/transaksi",
                      () => import("./routes/customer/TransactionRoute"),
                    ),
                    page("/ulasan/:bookingId", () => import("./routes/customer/ReviewFormRoute")),
                    page("/ulasan-saya", () => import("./routes/customer/MyReviewsRoute")),
                    page("/notifikasi", () => import("./routes/customer/NotificationsRoute")),
                    page("/akun", () => import("./routes/customer/AccountRoute")),
                  ],
                },
              ],
            },
            {
              element: <RequireCompleteProfile />,
              children: [
                {
                  element: <WizardLayout />,
                  children: [
                    page("/booking/data-tamu", () => import("./routes/customer/StepGuestRoute")),
                    page("/booking/layanan", () => import("./routes/customer/StepServicesRoute")),
                    page("/booking/barber", () => import("./routes/customer/StepBarberRoute")),
                    page("/booking/jadwal", () => import("./routes/customer/StepScheduleRoute")),
                    page("/booking/ringkasan", () => import("./routes/customer/StepSummaryRoute")),
                  ],
                },
              ],
            },
          ],
        },
        {
          element: <AuthLayout />,
          children: [
            page("/staf/ganti-password", () => import("./routes/barber/FirstPasswordRoute")),
          ],
        },
        {
          element: <RequireBarber />,
          children: [
            {
              element: <RequirePasswordChanged />,
              children: [
                {
                  element: <BarberLayout />,
                  children: [
                    page("/barber/hari-ini", () => import("./routes/barber/TodayRoute")),
                    page("/barber/booking/:id", () => import("./routes/barber/BookingRoute")),
                    page("/barber/jadwal", () => import("./routes/barber/ScheduleRoute")),
                    page("/barber/profil", () => import("./routes/barber/ProfileRoute")),
                    page("/barber/profil/pratinjau", () => import("./routes/barber/PreviewRoute")),
                    page("/barber/tautan", () => import("./routes/barber/LinksRoute")),
                    page("/barber/ulasan", () => import("./routes/barber/ReviewsRoute")),
                    page("/barber/notifikasi", () => import("./routes/barber/NotificationsRoute")),
                    page("/barber/akun", () => import("./routes/barber/AccountRoute")),
                  ],
                },
              ],
            },
          ],
        },
        {
          element: <StaffLayout />,
          children: routes
            .filter((r) => r.path.startsWith("/staf") || r.path.startsWith("/owner"))
            .map(toRoute),
        },
        {
          element: <SuperAdminLayout />,
          children: routes.filter((r) => r.path.startsWith("/sa")).map(toRoute),
        },
      ],
    },
    { path: "*", element: <NotFoundRoute /> },
  ],
  { basename },
)
