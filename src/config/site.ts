export const siteConfig = {
  name: "Tourvis Select",
  description: "Premium hotel selection platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/selecthotels",
    github: "https://github.com/selecthotels",
  },
}

export const navConfig = {
  mainNav: [
    {
      title: "Hotels",
      href: "/hotels",
    },
    {
      title: "Destinations",
      href: "/destinations",
    },
    {
      title: "Brands",
      href: "/brands",
    },
  ],
}
