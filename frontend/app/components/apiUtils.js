// API utility functions
export const apiFetch = async (endpoint, options = {}) => {
  // Use relative URLs for development proxy
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  const defaultOptions = {
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    // Return fallback data instead of throwing
    return getFallbackData(endpoint);
  }
};

// Fallback data for when API is not available
const getFallbackData = (endpoint) => {
  switch (endpoint) {
    case '/api/site-config/':
      return {
        brand_name: "Car Insurance Comparison",
        site_name: "Car Insurance Comparison",
        email: "",
        phone_number: "(800) 308-0965",
        disclaimer: "",
        footer_disclaimer: "",
        copyright_text: "",
        footer_about_text: "",
        company_address: "",
        logo_url: "",
        logo_icon_url: "",
        favicon_url: "",
        logo_height: 35,
        social_links: null,
        social_links_text: "",
        facebook_url: "",
        twitter_url: "",
        instagram_url: "",
        youtube_url: "",
        linkedin_url: "",
        accent_orange_hex: "#c2410c",
        accent_orange_hover_hex: "#9a3412",
        accent_gradient_from_hex: "#000000",
        accent_gradient_to_hex: "#000000",
        updated_at: "2025-11-23T14:45:30.371914+00:00"
      };
    case '/api/menu/footer/':
      return {
        company: [
          { name: "About Us", page_slug: "about-us", anchor_id: null },
          { name: "Careers", page_slug: "careers", anchor_id: null },
          { name: "Advertiser Disclosure", page_slug: "advertiser-disclosure", anchor_id: null },
          { name: "Contact Us", page_slug: "contact", anchor_id: null }
        ],
        legal: [
          { name: "Privacy Policy", page_slug: "privacy-policy", anchor_id: null },
          { name: "Terms & Conditions", page_slug: "terms", anchor_id: null },
          { name: "CCPA", page_slug: "ccpa", anchor_id: null }
        ]
      };
    case '/api/homepage/':
      return {
        meta_title: "Car Insurance Comparison - Save Money on Auto Insurance",
        content: []
      };
    default:
      return {};
  }
};

// Specific API endpoints
export const api = {
  siteConfig: () => apiFetch('/api/site-config/'),
  homepage: () => apiFetch('/api/homepage/'),
  footerMenu: () => apiFetch('/api/menu/footer/'),
  footerAddress: () => apiFetch('/api/footer-address/'),
};