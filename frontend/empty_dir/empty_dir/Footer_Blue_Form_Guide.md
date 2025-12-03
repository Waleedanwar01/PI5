# Footer with Blue Form - Usage Guide

## 📁 Files Created

1. **FooterWithBlueForm.jsx** - Main footer component with blue form
2. **footer-demo/page.jsx** - Demo page showing the footer in action

## 🚀 How to Use

### Option 1: Replace Current Footer
To replace the existing footer in your layout:

```jsx
// In your layout.js or component
import FooterWithBlueForm from './components/FooterWithBlueForm.jsx';

// Replace your current Footer with:
<FooterWithBlueForm />
```

### Option 2: Use Conditional Rendering
Use the new footer only on specific pages:

```jsx
import { usePathname } from 'next/navigation';
import FooterWithBlueForm from './components/FooterWithBlueForm.jsx';
import Footer from './components/Footer.jsx';

export default function RootLayout({ children }) {
    const pathname = usePathname();
    
    return (
        <html>
            <body>
                {children}
                {pathname === '/contact' ? <FooterWithBlueForm /> : <Footer />}
            </body>
        </html>
    );
}
```

### Option 3: Add to Specific Pages Only
Use the new footer on contact or quote pages:

```jsx
// In contact page
import FooterWithBlueForm from '../components/FooterWithBlueForm.jsx';

export default function ContactPage() {
    return (
        <div>
            {/* Your contact page content */}
            <FooterWithBlueForm />
        </div>
    );
}
```

## 🎨 Features

### Blue Form Section
- **Gradient background** - Beautiful blue gradient (from-blue-600 to-blue-800)
- **Contact form** - Name, email, phone, and message fields
- **Form validation** - Required field validation
- **Form submission** - Integrated with your `/api/contact/` endpoint
- **Glassmorphism** - Modern frosted glass effect

### Contact Information Panel
- **Address display** - Shows your business address
- **Phone number** - Contact phone information
- **Email address** - Email contact details
- **Social media** - Social links with blue styling

### Original Footer Content
- **Company links** - Dynamic company navigation links
- **Legal links** - Legal and policy links
- **Copyright** - Dynamic copyright information
- **Disclaimer** - Legal disclaimer text
- **Responsive design** - Works on all screen sizes

## 🎯 Customization

### Change Form Colors
Modify the gradient in the component:
```jsx
// Change from blue to any color
<div className="bg-gradient-to-br from-purple-600 to-purple-800">
```

### Update Contact Information
The contact info is currently using placeholder values. You can:
1. Add these fields to your site config API
2. Hardcode the values in the component
3. Add new API endpoints for contact information

### Form Integration
The form sends data to `/api/contact/` with the source set as 'footer_blue_form'. 
Make sure your contact API can handle this.

## 📱 Responsive Design

The footer is fully responsive:
- **Desktop** - Two-column layout (form + info)
- **Tablet** - Maintains layout with adjusted spacing
- **Mobile** - Stacks vertically for better usability

## 🎭 Visual Effects

- **Backdrop blur** - Glass morphism effect on form
- **Hover states** - Interactive button and link animations
- **Gradient backgrounds** - Modern gradient designs
- **Smooth transitions** - CSS transitions for all interactive elements

## 🔗 API Endpoints Used

- `/api/site-config/` - Brand info, logos, social links
- `/api/footer-address/` - Footer address information  
- `/api/menu/footer/` - Company and legal navigation links
- `/api/contact/` - Form submission endpoint

## 🎨 Color Scheme

- **Primary Blue**: from-blue-600 to-blue-800
- **Form Background**: white/10 (transparent white)
- **Text Colors**: white, blue-100, blue-200
- **Form Borders**: white/30 (transparent white)
- **Buttons**: White with blue text

## 📝 Demo Page

Visit `/footer-demo` to see the footer in action with example content and usage instructions.