import { createBrowserRouter } from "react-router-dom"

import { AuthLayout } from "@/app/layouts/AuthLayout"
import { BusinessScopedLayout } from "@/app/layouts/BusinessScopedLayout"
import { CustomerAccountLayout } from "@/app/layouts/CustomerAccountLayout"
import { DashboardLayout } from "@/app/layouts/DashboardLayout"
import { PublicBookingLayout } from "@/app/layouts/PublicBookingLayout"
import { RootLayout } from "@/app/layouts/RootLayout"
import { MarketingLandingPage } from "@/app/routes/pages/MarketingLandingPage"
import { NotFoundPage } from "@/app/routes/pages/NotFoundPage"
import { RouteErrorBoundary } from "@/app/routes/pages/RouteErrorBoundary"
import { BusinessScopeGuard } from "@/app/routes/guards/BusinessScopeGuard"
import { RequireBusinessAuth } from "@/app/routes/guards/RequireBusinessAuth"
import { RequireCustomerAuth } from "@/app/routes/guards/RequireCustomerAuth"
import {
  BusinessLoginPage,
  BusinessRegisterPage,
  CustomerLoginPage,
  CustomerRegisterPage,
} from "@/features/auth/pages"
import {
  BookingConfirmationPage,
  BookingConfirmPage,
  BusinessPublicProfilePage,
  ServiceBrowsePage,
  SlotPickerPage,
} from "@/features/booking/pages"
import { BusinessDirectoryPage } from "@/features/business/pages/BusinessDirectoryPage"
import { OnboardingPage, DashboardOverviewPage, DashboardSettingsPage } from "@/features/business-onboarding/pages"
import { DashboardBookingsPage } from "@/features/dashboard-bookings/pages"
import {
  AccountSettingsPage,
  MyBookingsCalendarPage,
  MyBookingsPage,
  MyProfilePage,
  PrivacyPolicyPage,
} from "@/features/my-bookings/pages"
import { ServiceEditPage, ServiceNewPage, ServicesListPage } from "@/features/services/pages"
import { StaffAvailabilityPage, StaffListPage } from "@/features/staff-calendar/pages"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <MarketingLandingPage /> },
      { path: "businesses", element: <BusinessDirectoryPage /> },
      { path: "404", element: <NotFoundPage /> },

      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <CustomerLoginPage /> },
          { path: "register", element: <CustomerRegisterPage /> },
          { path: "business/login", element: <BusinessLoginPage /> },
          { path: "business/register", element: <BusinessRegisterPage /> },
        ],
      },

      {
        path: "onboarding/business",
        element: <RequireBusinessAuth />,
        children: [{ index: true, element: <OnboardingPage /> }],
      },

      {
        path: "account",
        element: <RequireCustomerAuth />,
        children: [
          {
            element: <CustomerAccountLayout />,
            children: [
              { index: true, element: <MyBookingsPage /> },
              { path: "bookings", element: <MyBookingsPage /> },
              { path: "calendar", element: <MyBookingsCalendarPage /> },
              { path: "profile", element: <MyProfilePage /> },
              { path: "settings", element: <AccountSettingsPage /> },
              { path: "privacy", element: <PrivacyPolicyPage /> },
            ],
          },
        ],
      },

      {
        path: ":businessSlug",
        element: <BusinessScopedLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            element: <PublicBookingLayout />,
            children: [
              { index: true, element: <BusinessPublicProfilePage /> },
              { path: "book", element: <ServiceBrowsePage /> },
              { path: "book/:serviceId", element: <SlotPickerPage /> },
              {
                path: "book/:serviceId/confirm",
                element: <RequireCustomerAuth />,
                children: [{ index: true, element: <BookingConfirmPage /> }],
              },
              { path: "booking/:bookingId/confirmation", element: <BookingConfirmationPage /> },
            ],
          },
          {
            path: "dashboard",
            element: <RequireBusinessAuth />,
            children: [
              {
                element: <BusinessScopeGuard />,
                children: [
                  {
                    element: <DashboardLayout />,
                    children: [
                      { index: true, element: <DashboardOverviewPage /> },
                      { path: "services", element: <ServicesListPage /> },
                      { path: "services/new", element: <ServiceNewPage /> },
                      { path: "services/:serviceId/edit", element: <ServiceEditPage /> },
                      { path: "staff", element: <StaffListPage /> },
                      {
                        path: "staff/:staffId/availability",
                        element: <StaffAvailabilityPage />,
                      },
                      { path: "bookings", element: <DashboardBookingsPage /> },
                      { path: "settings", element: <DashboardSettingsPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
