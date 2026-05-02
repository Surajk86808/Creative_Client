export type BusinessStatus = 'draft' | 'generated' | 'sent' | 'viewed' | 'claimed' | 'expired';

export interface BusinessData {
  businessName: string;
  tagline: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  aboutText: string;
  heroImage: string;
  status: BusinessStatus;
  services: { title: string; description: string; icon: string }[];
  reasons: { title: string; description: string; icon: string }[];
  testimonials: { author: string; text: string; rating: number }[];
  businessHours: { days: string; hours: string }[];
}

export const mockDatabase: Record<string, BusinessData> = {
  'quality-dental-care': {
    businessName: 'Quality Dental Care',
    tagline: 'Modern Smiles, Gentle Care',
    slug: 'quality-dental-care',
    category: 'dentist',
    city: 'indore',
    country: 'india',
    phone: '+91 98765 43210',
    email: 'hello@qualitydental.in',
    website: 'https://qualitydental.in',
    rating: 4.8,
    reviewCount: 142,
    aboutText: 'Quality Dental Care is dedicated to providing the most advanced dental treatments in a relaxing and welcoming environment. Our expert team uses state-of-the-art technology to ensure your smile is beautiful and healthy.',
    heroImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2000',
    status: 'generated',
    services: [
      { title: 'Teeth Whitening', description: 'Professional whitening services for a brighter smile.', icon: 'Sparkles' },
      { title: 'Dental Implants', description: 'Permanent solutions for missing teeth.', icon: 'Syringe' },
      { title: 'Orthodontics', description: 'Clear aligners and braces for all ages.', icon: 'Activity' },
      { title: 'Routine Checkups', description: 'Preventative care and thorough examinations.', icon: 'Heart' },
    ],
    reasons: [
      { title: 'Expert Team', description: 'Highly qualified specialists.', icon: 'Users' },
      { title: 'Modern Tech', description: 'Latest dental technology.', icon: 'Zap' },
      { title: 'Painless Care', description: 'Comfort-first treatments.', icon: 'ShieldCheck' },
    ],
    testimonials: [
      { author: 'Rahul S.', text: 'Best dental experience I have ever had. Truly painless!', rating: 5 },
      { author: 'Neha M.', text: 'Very professional staff and clean clinic. Highly recommended.', rating: 5 },
      { author: 'Amit P.', text: 'Got my implants done here. Great results.', rating: 4 },
    ],
    businessHours: [
      { days: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
      { days: 'Saturday', hours: '10:00 AM - 6:00 PM' },
      { days: 'Sunday', hours: 'Closed' },
    ]
  },
  'joes-pizza': {
    businessName: 'Joe\'s Pizza',
    tagline: 'Authentic New York Slice',
    slug: 'joes-pizza',
    category: 'restaurant',
    city: 'new-york',
    country: 'usa',
    phone: '+1 212-555-0199',
    email: 'orders@joespizzany.com',
    website: 'https://joespizzany.com',
    rating: 4.9,
    reviewCount: 3200,
    aboutText: 'Serving the classic New York slice since 1975. Family owned and operated, we use only the freshest ingredients and real mozzarella cheese on every pie.',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000',
    status: 'sent',
    services: [
      { title: 'Classic Slices', description: 'Cheese, pepperoni, and more.', icon: 'Pizza' },
      { title: 'Whole Pies', description: 'Order a large for the whole family.', icon: 'CircleStack' },
      { title: 'Catering', description: 'Pizza for your next big event.', icon: 'Users' },
    ],
    reasons: [
      { title: 'Secret Sauce', description: 'Our famous family recipe.', icon: 'Heart' },
      { title: 'Fast Delivery', description: 'Hot pizza to your door.', icon: 'Zap' },
      { title: 'Fresh Dough', description: 'Made daily from scratch.', icon: 'ShieldCheck' },
    ],
    testimonials: [
      { author: 'Mike T.', text: 'The best slice in the city. Period.', rating: 5 },
      { author: 'Sarah W.', text: 'Always hits the spot late at night.', rating: 5 },
      { author: 'David K.', text: 'Classic NY style, nothing compares.', rating: 5 },
    ],
    businessHours: [
      { days: 'Monday - Thursday', hours: '10:00 AM - 2:00 AM' },
      { days: 'Friday - Saturday', hours: '10:00 AM - 4:00 AM' },
      { days: 'Sunday', hours: '11:00 AM - 2:00 AM' },
    ]
  }
};

export async function getBusinessData(country?: string, city?: string, category?: string, slug?: string): Promise<BusinessData | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!slug) return null;
  const data = mockDatabase[slug];
  
  if (data && data.country === country && data.city === city && data.category === category) {
    return data;
  }
  
  return null;
}
