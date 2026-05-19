export type UserType = 'customer' | 'vendor' | 'admin';

export interface OnboardingResponse {
  title: string;
  body: string;
  steps?: string[];
  recommendedActions?: string[];
  quickLinks?: { label: string; path: string }[];
}

/**
 * Generate concise onboarding guidance tailored by user type and topic.
 * Topics: 'booking' | 'vendor_registration' | 'features' | 'first_steps' | 'pricing'
 */
export function getOnboardingResponse(
  userType: UserType,
  topic: 'booking' | 'vendor_registration' | 'features' | 'first_steps' | 'pricing',
  context?: Record<string, any>,
): OnboardingResponse {
  if (userType === 'customer') {
    if (topic === 'booking') {
      return {
        title: 'How to book a service',
        body: 'Booking is fast — search garages, pick a service, choose a time, and confirm. We handle reminders and secure payments.',
        steps: [
          'Search for your car model or service (e.g. Oil Change)',
          'Select a garage from results and review services & price',
          'Pick a date/time and confirm booking',
          'Receive confirmation and a reminder 24 hours before',
        ],
        recommendedActions: ['Add your car details in Profile', 'Save payment method for one-click checkout'],
        quickLinks: [
          { label: 'Search garages', path: '/search' },
          { label: 'My bookings', path: '/customer/bookings' },
        ],
      };
    }

    if (topic === 'first_steps') {
      return {
        title: 'Getting started with CarMerica',
        body: 'Welcome — let me walk you through the essentials to get your car serviced quickly and confidently.',
        steps: [
          'Add vehicle(s) to your profile',
          'Browse popular services for your car',
          'Book your first appointment and choose a nearby garage',
        ],
        recommendedActions: ['Upload your vehicle registration for easy matching'],
        quickLinks: [{ label: 'Add vehicle', path: '/account/vehicles' }],
      };
    }

    if (topic === 'features') {
      return {
        title: 'Key features for customers',
        body: 'CarMerica simplifies service discovery, transparent pricing, and booking management.',
        steps: ['Compare garages by rating and price', 'Use chat to ask garages questions', 'Manage bookings and receipts from your account'],
        quickLinks: [{ label: 'Help & FAQ', path: '/help' }],
      };
    }
  }

  if (userType === 'vendor') {
    if (topic === 'vendor_registration') {
      return {
        title: 'Vendor registration — quick guide',
        body: 'Registering your garage is straightforward. Prepare proof of business, service list, and pricing.',
        steps: [
          'Create a vendor account and verify email',
          'Complete business profile and upload documents',
          'Add services, pricing, and availability',
          'Enable booking acceptance and set staff schedules',
        ],
        recommendedActions: ['Upload high-quality photos of your garage', 'Set clear service durations and cancellation rules'],
        quickLinks: [
          { label: 'Vendor registration', path: '/vendor/register' },
          { label: 'Vendor dashboard', path: '/vendor' },
        ],
      };
    }

    if (topic === 'features') {
      return {
        title: 'Vendor features to know',
        body: 'Use the Vendor Dashboard to manage bookings, inventory, and promotions.',
        steps: ['Set service availability', 'Monitor inventory and enable auto-restock', 'Respond to customer messages promptly'],
        recommendedActions: ['Enable push notifications for new bookings', 'Use promotions to fill slow slots'],
        quickLinks: [{ label: 'Vendor Dashboard', path: '/vendor' }],
      };
    }
  }

  // Admin or fallback
  if (topic === 'pricing') {
    return {
      title: 'Pricing & billing',
      body: 'Customers see transparent service prices. Vendors receive payouts per platform terms — check Settings for payout schedules.',
      steps: ['Review price breakdown on each service', 'Set vendor payout details under Payments'],
      quickLinks: [{ label: 'Payments', path: '/vendor/payments' }],
    };
  }

  // Generic fallback
  return {
    title: 'Welcome to CarMerica',
    body: 'Tell me what you want to do — book a service, register as a vendor, or explore features. I’ll guide you step-by-step.',
    quickLinks: [
      { label: 'Search garages', path: '/search' },
      { label: 'Vendor registration', path: '/vendor/register' },
    ],
  };
}

/**
 * Small helper to produce short conversational prompts for chat UI.
 */
export function shortOnboardingPrompt(userType: UserType, topic: string) {
  if (userType === 'customer') {
    if (topic === 'booking') return 'Need help booking your first service?';
    return 'How can I help you get started today?';
  }
  if (userType === 'vendor') return 'Ready to register your garage? I’ll guide you.';
  return 'How can I assist you with onboarding?';
}

export default { getOnboardingResponse, shortOnboardingPrompt };
