import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  "Fine Hotels + Resorts": [
    { href: "/fine-hotels", label: "Browse Properties" },
    { href: "/benefits", label: "Member Benefits" },
    { href: "/destinations", label: "Destinations" },
    { href: "/experiences", label: "Unique Experiences" },
    { href: "/packages", label: "Exclusive Packages" },
  ],
  "Tourvis Select": [
    { href: "/platinum-card", label: "Platinum Card®" },
    { href: "/gold-card", label: "Gold Card®" },
    { href: "/green-card", label: "Green Card®" },
    { href: "/business-cards", label: "Business Cards" },
    { href: "/apply", label: "Apply Now" },
  ],
  "Travel Services": [
    { href: "/travel-portal", label: "Amex Travel Portal" },
    { href: "/concierge", label: "Platinum Concierge" },
    { href: "/global-lounge", label: "Global Lounge Collection" },
    { href: "/travel-insurance", label: "Travel Insurance" },
    { href: "/car-rental", label: "Car Rental Partners" },
  ],
  "Account & Support": [
    { href: "/account", label: "Manage Account" },
    { href: "/bookings", label: "My Bookings" },
    { href: "/rewards", label: "Membership Rewards®" },
    { href: "/help", label: "Help & Support" },
    { href: "/contact", label: "Contact Us" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-[1200px] px-4">
        {/* Main Footer Links */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 amex-transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-200" />

        {/* Legal & Brand */}
        <div className="py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-xs text-gray-500">
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-blue-600 amex-transition">
              Privacy Statement
            </Link>
            <Link href="/terms" className="hover:text-blue-600 amex-transition">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-blue-600 amex-transition">
              Accessibility
            </Link>
            <Link href="/security" className="hover:text-blue-600 amex-transition">
              Security Center
            </Link>
            <Link href="/sitemap" className="hover:text-blue-600 amex-transition">
              Site Map
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span>&copy; 2024 Tourvis Select Company. All rights reserved.</span>
          </div>
        </div>

        {/* Brand Statement */}
        <div className="pb-8 text-center">
          <div className="inline-flex items-center space-x-3 text-blue-600">
            <div className="w-9 h-9 bg-blue-600 rounded-sm flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">TS</span>
            </div>
            <div className="text-sm font-bold text-gray-700">Tourvis Select Fine Hotels + Resorts®</div>
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-2xl mx-auto">
            Platinum Card® Members enjoy exclusive benefits and experiences at the world's finest hotels and resorts.
          </p>
        </div>
      </div>
    </footer>
  )
}
