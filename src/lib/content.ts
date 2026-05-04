import { z } from "zod";

export const cmsSectionSchema = z.object({
  type: z.string().min(1, "Section type is required"),
  props: z.record(z.string(), z.unknown()),
});

export const cmsPageContentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  sections: z.array(cmsSectionSchema).default([]),
});

export const DEFAULT_ABOUT_CONTENT = {
  title: "About",
  sections: [
    {
      type: "hero",
      props: {
        heading: "About KGNA",
        body: "For over 30 years, we've been the bridge connecting Kashmiri Americans to their roots while building a vibrant community for the future.",
      },
    },
    {
      type: "missionVision",
      props: {
        missionTitle: "Our Mission",
        missionBody:
          "To preserve, promote, and celebrate Kashmiri culture, heritage, and traditions while fostering unity and support among Kashmiri Americans across North America.",
        visionTitle: "Our Vision",
        visionBody:
          "To be the leading organization that empowers Kashmiri Americans to thrive while maintaining strong connections to their cultural heritage, creating a legacy that spans generations.",
      },
    },
    {
      type: "values",
      props: {
        heading: "Our Core Values",
        items: [
          {
            title: "Cultural Preservation",
            description:
              "Keeping Kashmiri traditions, language, and customs alive for future generations",
          },
          {
            title: "Community Building",
            description:
              "Creating spaces for Kashmiris to connect, celebrate, and support each other",
          },
          {
            title: "Education",
            description:
              "Teaching youth about their heritage through language classes and cultural programs",
          },
          {
            title: "Inclusivity",
            description:
              "Welcoming all members of the Kashmiri diaspora regardless of background",
          },
        ],
      },
    },
    {
      type: "journey",
      props: {
        heading: "Our Journey",
        items: [
          {
            year: "1994",
            title: "KGNA Founded",
            description: "A small group of Kashmiri families came together to establish KGNA",
          },
          {
            year: "2000",
            title: "501(c)(3) Status",
            description: "Received official nonprofit recognition from the IRS",
          },
          {
            year: "2005",
            title: "First Annual Conference",
            description: "Hosted our first large-scale gathering with 500+ attendees",
          },
          {
            year: "2010",
            title: "Youth Programs Launch",
            description: "Started dedicated programs for second-generation Kashmiris",
          },
          {
            year: "2015",
            title: "National Expansion",
            description: "Established chapters in 15 cities across North America",
          },
          {
            year: "2020",
            title: "Virtual Connectivity",
            description: "Launched online programs reaching thousands globally",
          },
          {
            year: "2024",
            title: "30 Years of Service",
            description: "Celebrating three decades of cultural preservation",
          },
        ],
      },
    },
    {
      type: "leadership",
      props: {
        heading: "Our Leadership Team",
        body: "Dedicated volunteers working tirelessly to serve our community and preserve our heritage",
        members: [
          {
            name: "Dr. Ahmad Shah",
            role: "President",
            bio: "Leading KGNA's mission to preserve Kashmiri heritage for over 10 years.",
            imageUrl: "",
          },
          {
            name: "Sarah Malik",
            role: "Vice President",
            bio: "Passionate about connecting Kashmiri youth with their cultural roots.",
            imageUrl: "",
          },
          {
            name: "Mohammad Ali",
            role: "Secretary",
            bio: "Dedicated to organizing cultural events and community programs.",
            imageUrl: "",
          },
          {
            name: "Fatima Khan",
            role: "Treasurer",
            bio: "Ensuring financial transparency and sustainability of our programs.",
            imageUrl: "",
          },
          {
            name: "Rashid Ahmed",
            role: "Event Coordinator",
            bio: "Creating memorable cultural experiences for our community.",
            imageUrl: "",
          },
          {
            name: "Zahra Hussain",
            role: "Youth Program Director",
            bio: "Engaging the next generation in Kashmiri cultural activities.",
            imageUrl: "",
          },
        ],
      },
    },
    {
      type: "cta",
      props: {
        heading: "Get Involved",
        body: "Join us in our mission to preserve Kashmiri culture and build a stronger community. There are many ways to contribute your time, skills, and resources.",
        primaryLabel: "Become a Volunteer",
        primaryHref: "/volunteer",
        secondaryLabel: "Support Our Mission",
        secondaryHref: "/donate",
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_HOME_CONTENT = {
  title: "Home",
  sections: [
    {
      type: "hero",
      props: {
        headline: "Preserving Kashmir's Rich Heritage in North America",
        subheadline:
          "Join the largest network of Kashmiri Americans united in celebrating our culture, supporting our community, and preserving our identity for future generations.",
        primaryLabel: "Explore Events",
        primaryHref: "/events",
        secondaryLabel: "Support Our Mission",
        secondaryHref: "/donate",
        imageUrl: "/images/kashmir-shikara-hero.jpg",
      },
    },
    {
      type: "mission",
      props: {
        heading: "Our Mission",
        body: "KGNA is a non-profit organization devoted to charitable, educational, and scientific development in an effort to preserve the unique Kashmiri culture and identity. We bring together Kashmiris across North America to celebrate our heritage and build lasting community connections.",
        pillars: [
          {
            title: "Charitable",
            description: "Supporting our community through philanthropic initiatives and humanitarian aid",
          },
          {
            title: "Educational",
            description: "Preserving and teaching Kashmiri language, history, and cultural traditions",
          },
          {
            title: "Scientific",
            description: "Promoting research and documentation of Kashmiri heritage and culture",
          },
        ],
      },
    },
    {
      type: "events",
      props: {
        heading: "Upcoming Events",
        body: "Join us in celebrating Kashmiri culture through our community events and gatherings",
        items: [
          { id: "1", title: "Annual Cultural Festival 2024", description: "Join us for a celebration of Kashmiri culture with traditional music, dance, and cuisine", date: "2024-06-15", time: "5:00 PM - 10:00 PM", location: "Community Center, New York", category: "cultural", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000", registrationUrl: "#" },
          { id: "2", title: "Kashmiri Language Workshop", description: "Learn the basics of Kashmiri language in this interactive workshop for all ages", date: "2024-05-20", time: "2:00 PM - 4:00 PM", location: "Virtual Event", category: "educational", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000", registrationUrl: "#" },
          { id: "3", title: "Community Iftar Gathering", description: "Break your fast with the community during the holy month of Ramadan", date: "2024-04-10", time: "7:00 PM - 9:00 PM", location: "Islamic Center, Boston", category: "social", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000", registrationUrl: "#" },
        ],
      },
    },
    {
      type: "impact",
      props: {
        heading: "Our Impact",
        body: "Building bridges across generations and preserving our heritage for the future",
        stats: [
          { value: "30+", label: "Years of Service" },
          { value: "5000+", label: "Community Members" },
          { value: "50+", label: "Events Hosted" },
          { value: "25+", label: "Cities Across NA" },
        ],
      },
    },
    {
      type: "donationCta",
      props: {
        heading: "Support Our Mission",
        body: "Your generosity helps us preserve Kashmiri heritage, support our community, and create lasting connections for future generations.",
        monthlyHeading: "Become a Monthly Supporter",
        monthlyBody: "Join our community of sustaining donors and make a lasting impact with regular monthly contributions.",
      },
    },
    {
      type: "gallery",
      props: {
        heading: "Photo Gallery",
        body: "Capturing moments from our events and the beauty of Kashmir",
        items: [
          { id: "1", title: "Kashmir Valley", category: "landscape", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000" },
          { id: "2", title: "Cultural Festival 2023", category: "events", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000" },
          { id: "3", title: "Traditional Wazwan", category: "cuisine", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2000" },
          { id: "4", title: "Heritage Crafts", category: "culture", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
        ],
      },
    },
    {
      type: "newsletter",
      props: {
        heading: "Stay Connected",
        body: "Join our newsletter to receive updates about upcoming events, cultural programs, and community initiatives.",
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_CONTACT_CONTENT = {
  title: "Contact",
  sections: [
    {
      type: "hero",
      props: {
        heading: "Get in Touch",
        body: "We're here to help and answer any questions you might have. We look forward to hearing from you!",
      },
    },
    {
      type: "contactInfo",
      props: {
        heading: "Contact Information",
        email: "info@kgna.us",
        addressLine1: "123 Main Street",
        addressLine2: "New York, NY 10001",
      },
    },
    {
      type: "form",
      props: {
        heading: "Send us a Message",
        body: "Fill out the form below and we'll get back to you as soon as possible",
      },
    },
    {
      type: "social",
      props: {
        heading: "Follow Us",
        body: "Stay connected with our community on social media",
        links: [
          { label: "Facebook", href: "https://facebook.com/kgnaus" },
          { label: "Instagram", href: "https://instagram.com/kgnaus" },
          { label: "Twitter", href: "https://twitter.com/kgnaus" },
        ],
      },
    },
    {
      type: "faq",
      props: {
        heading: "Frequently Asked Questions",
        body: "Find answers to common questions about KGNA",
        items: [
          {
            question: "How can I become a member of KGNA?",
            answer: "Membership is open to all individuals interested in preserving and promoting Kashmiri culture. You can join by filling out our membership form online or at any of our events.",
          },
          {
            question: "Are your events open to non-Kashmiris?",
            answer: "Yes! Our events are open to everyone interested in learning about and experiencing Kashmiri culture.",
          },
          {
            question: "How can I volunteer for KGNA?",
            answer: "We're always looking for volunteers! You can express your interest through the contact form above or email us directly.",
          },
        ],
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_CULTURE_CONTENT = {
  title: "Culture",
  sections: [
    {
      type: "hero",
      props: {
        heading: "Kashmiri Culture & Heritage",
        body: "Discover the rich tapestry of Kashmir's cultural heritage - from ancient arts and crafts to traditional cuisine, music, language, and timeless customs that define our identity.",
      },
    },
    {
      type: "legacy",
      props: {
        heading: "Our Cultural Legacy",
        body: "Kashmir's culture is a unique blend of Persian, Central Asian, and Indian influences, creating a distinctive cultural identity.",
        secondaryBody: "Every aspect of Kashmiri culture tells a story of resilience, creativity, and deep spiritual connection.",
      },
    },
    {
      type: "arts",
      props: {
        heading: "Traditional Arts & Crafts",
        body: "Kashmir's handicrafts are world-renowned for their exquisite beauty and meticulous craftsmanship passed down through generations.",
        items: [
          { name: "Pashmina Weaving", description: "The world-renowned art of weaving the finest cashmere wool into luxurious shawls", details: "Each authentic Pashmina shawl takes months to complete by hand.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
          { name: "Paper Mache", description: "Intricate decorative art using paper pulp, featuring colorful designs and patterns", details: "Known locally as kar-i-qalamdani, this art form features vibrant hand-painted designs.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
          { name: "Kani Shawls", description: "Traditional woven shawls with intricate patterns using small wooden sticks", details: "These masterpieces can take up to a year to complete.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
          { name: "Walnut Wood Carving", description: "Exquisite carved furniture and decorative items from Kashmir's walnut trees", details: "Distinguished by deep undercutting and intricate open work.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
        ],
      },
    },
    {
      type: "cuisine",
      props: {
        heading: "Kashmiri Cuisine",
        body: "A culinary journey through the flavors of Kashmir, where every dish tells a story of tradition, hospitality, and celebration.",
        items: [
          { name: "Wazwan", description: "The grand feast of 36 courses, a culinary art form and social ritual", highlights: "Rista, Rogan Josh, Tabak Maaz, Gushtaba", traditions: "Served on large copper plates called trami." },
          { name: "Kahwa", description: "Traditional green tea infused with saffron, cardamom, and almonds", highlights: "Saffron, Cardamom, Cinnamon, Almonds", traditions: "Served as a symbol of hospitality." },
          { name: "Noon Chai", description: "Pink salt tea, a morning tradition served with traditional breads", highlights: "Special tea leaves, Salt, Milk, Baking soda", traditions: "Accompanied by Kashmiri breads." },
          { name: "Harisa", description: "Traditional winter delicacy made from mutton and rice", highlights: "Slow-cooked overnight, Winter specialty, Nutritious", traditions: "Prepared during cold winter mornings." },
        ],
      },
    },
    {
      type: "language",
      props: {
        heading: "Kashmiri Language",
        body: "Kashmiri, also known as Koshur, is an Indo-Aryan language spoken by approximately 7 million people with a rich literary tradition.",
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_DONATE_CONTENT = {
  title: "Donate",
  sections: [
    {
      type: "hero",
      props: {
        heading: "Support Our Mission",
        body: "Your generosity helps preserve Kashmiri heritage and strengthens our community across North America",
      },
    },
    {
      type: "reasons",
      props: {
        heading: "Why Your Support Matters",
        items: [
          { title: "Preserve Heritage", description: "Help maintain and pass on Kashmiri traditions to future generations" },
          { title: "Build Community", description: "Support programs that bring the Kashmiri diaspora together" },
          { title: "Enable Growth", description: "Fund educational initiatives and cultural events" },
          { title: "Expand Reach", description: "Help us serve more communities across North America" },
        ],
      },
    },
    {
      type: "taxInfo",
      props: {
        heading: "Tax-Deductible Giving",
        body: "KGNA is a registered 501(c)(3) nonprofit organization. Your donation is tax-deductible to the fullest extent allowed by law.",
        note: "EIN: XX-XXXXXXX (will be provided on your receipt)",
      },
    },
    {
      type: "otherWays",
      props: {
        heading: "Other Ways to Give",
        items: "Donor Advised Funds\nCorporate Matching\nLegacy Giving\nStock Donations",
        contactEmail: "donate@kgna.us",
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_EVENTS_CONTENT = {
  title: "Events",
  sections: [
    {
      type: "hero",
      props: {
        heading: "Events & Gatherings",
        body: "Join us in celebrating Kashmiri culture through various events, workshops, and community gatherings throughout the year.",
      },
    },
    {
      type: "events",
      props: {
        upcomingHeading: "Upcoming Events",
        pastHeading: "Past Events",
        upcoming: [
          { id: "1", title: "Annual Cultural Festival 2025", description: "Join us for our biggest celebration of the year featuring traditional music, dance performances, authentic Kashmiri cuisine, and activities for all ages.", date: "2025-06-15", time: "5:00 PM - 10:00 PM", location: "Queens Community Center, New York", category: "cultural", imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000", registrationUrl: "#" },
          { id: "2", title: "Kashmiri Language Workshop", description: "Learn the basics of Kashmiri language in this interactive workshop.", date: "2025-02-20", time: "2:00 PM - 4:00 PM", location: "Virtual Event (Zoom)", category: "educational", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000", registrationUrl: "#" },
          { id: "3", title: "Spring Navroz Celebration", description: "Welcome spring with traditional Kashmiri Navroz festivities.", date: "2025-03-21", time: "11:00 AM - 3:00 PM", location: "KGNA Community Hall, Boston", category: "cultural", imageUrl: "https://images.unsplash.com/photo-1609920658906-8223bd289001?q=80&w=2000", registrationUrl: "#" },
        ],
        past: [
          { id: "p1", title: "KGNA Convention 2024", description: "Three-day convention featuring cultural programs, business sessions, and youth activities.", date: "2024-07-15", time: "All Day", location: "Washington DC", category: "cultural", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000" },
          { id: "p2", title: "Winter Food Festival", description: "Celebration of traditional Kashmiri winter cuisine with cooking demonstrations.", date: "2024-12-10", time: "12:00 PM - 6:00 PM", location: "Community Center, Seattle", category: "social", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2000" },
        ],
      },
    },
    {
      type: "newsletter",
      props: {
        heading: "Never Miss an Event",
        body: "Subscribe to our newsletter to receive updates about upcoming events, workshops, and community gatherings.",
        buttonLabel: "Subscribe to Newsletter",
        buttonHref: "/contact",
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_GALLERY_CONTENT = {
  title: "Gallery",
  sections: [
    {
      type: "hero",
      props: {
        heading: "Photo Gallery",
        body: "Capturing moments from our events, cultural celebrations, and the breathtaking beauty of Kashmir through the lens.",
      },
    },
    {
      type: "gallery",
      props: {
        featuredHeading: "Featured Photos",
        ctaHeading: "Share Your Memories",
        ctaBody: "Have photos from our events or cultural celebrations? We'd love to feature them in our gallery.",
        items: [
          { id: "1", title: "Annual Cultural Festival 2024", description: "Community members celebrating at our flagship event", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000", category: "events", date: "June 2024", location: "New York", featured: "yes" },
          { id: "2", title: "Youth Leadership Summit", description: "Young leaders discussing community initiatives", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000", category: "events", date: "April 2024", location: "Chicago", featured: "" },
          { id: "3", title: "Traditional Wazwan Preparation", description: "Master chefs preparing the grand feast", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2000", category: "culture", date: "2024", location: "", featured: "yes" },
        ],
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_NEWS_CONTENT = {
  title: "News",
  sections: [
    {
      type: "hero",
      props: {
        heading: "News & Updates",
        body: "Stay informed with the latest stories, announcements, and updates from our community",
      },
    },
    {
      type: "articles",
      props: {
        featuredHeading: "Featured Story",
        archiveHeading: "News Archive",
        archiveBody: "Looking for older news? Browse our complete archive of past articles and updates.",
        items: [
          { id: "1", title: "KGNA Hosts Successful Annual Cultural Festival 2024", excerpt: "Over 2,000 community members gathered to celebrate Kashmiri heritage with traditional music, dance, and cuisine.", category: "events", author: "Sarah Ahmed", date: "December 15, 2024", readTime: "5 min read", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000", featured: "yes", tags: "Festival, Culture, Community" },
          { id: "2", title: "New Kashmiri Language Program Launches for Youth", excerpt: "KGNA introduces a language learning program aimed at preserving Kashmiri language among younger generations.", category: "announcements", author: "Dr. Rashid Khan", date: "December 10, 2024", readTime: "3 min read", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000", featured: "", tags: "Education, Youth, Language" },
          { id: "3", title: "Community Spotlight: Meet Our Volunteer of the Year", excerpt: "Recognizing exceptional contributions to community service.", category: "stories", author: "Admin", date: "December 5, 2024", readTime: "4 min read", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000", featured: "yes", tags: "Volunteers, Recognition, Community" },
        ],
      },
    },
  ],
} satisfies CmsPageContent;

export const DEFAULT_PAGES = [
  {
    slug: "home",
    title: "Home",
    draftContent: DEFAULT_HOME_CONTENT,
  },
  {
    slug: "about",
    title: "About",
    draftContent: DEFAULT_ABOUT_CONTENT,
  },
  {
    slug: "culture",
    title: "Culture",
    draftContent: DEFAULT_CULTURE_CONTENT,
  },
  {
    slug: "contact",
    title: "Contact",
    draftContent: DEFAULT_CONTACT_CONTENT,
  },
  {
    slug: "donate",
    title: "Donate",
    draftContent: DEFAULT_DONATE_CONTENT,
  },
  {
    slug: "events",
    title: "Events",
    draftContent: DEFAULT_EVENTS_CONTENT,
  },
  {
    slug: "gallery",
    title: "Gallery",
    draftContent: DEFAULT_GALLERY_CONTENT,
  },
  {
    slug: "news",
    title: "News",
    draftContent: DEFAULT_NEWS_CONTENT,
  },
] as const;

export type CmsSection = z.infer<typeof cmsSectionSchema>;
export type CmsPageContent = z.infer<typeof cmsPageContentSchema>;
export type CmsDraftInput = z.input<typeof cmsPageContentSchema>;
