import { Link } from 'react-router-dom';
import { useTheme } from '@contexts/ThemeContext';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaWhatsapp,
} from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  const { storeSettings } = useTheme();
  const s = storeSettings || {};
  const storeName = s.storeName || 'Your Store';

  const socials = [
    { icon: <FaFacebook />, href: s.facebook, label: 'Facebook' },
    { icon: <FaInstagram />, href: s.instagram, label: 'Instagram' },
    { icon: <FaTwitter />, href: s.twitter, label: 'Twitter' },
    { icon: <FaYoutube />, href: s.youtube, label: 'YouTube' },
    { icon: <FaTiktok />, href: s.tiktok, label: 'TikTok' },
    { icon: <FaWhatsapp />, href: s.whatsapp ? `https://wa.me/${s.whatsapp}` : null, label: 'WhatsApp' },
  ].filter(l => l.href);

  const shopLinks  = [
    { to: '/shop',            label: 'All Products' },
    { to: '/shop?featured=true', label: 'Featured' },
    { to: '/shop?newArrival=true', label: 'New Arrivals' },
    { to: '/shop?bestSeller=true', label: 'Best Sellers' },
    { to: '/shop?flashSale=true', label: 'Flash Sale' },
  ];

  const helpLinks = [
    { to: '/contact',         label: 'Contact Us' },
    { to: '/faq',             label: 'FAQ' },
    { to: '/track-order',     label: 'Track Order' },
    { to: '/returns',         label: 'Returns & Refunds' },
    { to: '/shipping',        label: 'Shipping Policy' },
  ];

  const legalLinks = [
    { to: '/privacy-policy',  label: 'Privacy Policy' },
    { to: '/terms',           label: 'Terms of Service' },
    { to: '/refund-policy',   label: 'Refund Policy' },
  ];

  return (
    <footer className="bg-primary-900 text-primary-200 pt-16 pb-8 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            {s.logo?.url
              ? <img src={s.logo.url} alt={storeName} className="h-10 w-auto brightness-200" />
              : <h3 className="text-xl font-bold text-white font-heading">{storeName}</h3>}
            <p className="text-sm text-primary-300 leading-relaxed">
              {s.businessDescription || s.footerTagline || ''}
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {socials.map(({ icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg bg-white/5 hover:bg-accent hover:text-white text-primary-300 transition-all duration-200">
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {shopLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-sm text-primary-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2.5">
              {helpLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-sm text-primary-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {s.email && (
                <li>
                  <a href={`mailto:${s.email}`}
                    className="flex items-center gap-2.5 text-sm text-primary-300 hover:text-white transition-colors">
                    <MdEmail size={16} className="shrink-0 text-accent" />
                    {s.email}
                  </a>
                </li>
              )}
              {s.phone && (
                <li>
                  <a href={`tel:${s.phone}`}
                    className="flex items-center gap-2.5 text-sm text-primary-300 hover:text-white transition-colors">
                    <MdPhone size={16} className="shrink-0 text-accent" />
                    {s.phone}
                  </a>
                </li>
              )}
              {s.address && (
                <li className="flex items-start gap-2.5 text-sm text-primary-300">
                  <MdLocationOn size={16} className="shrink-0 text-accent mt-0.5" />
                  <span>{s.address}{s.city ? `, ${s.city}` : ''}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legalLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="text-xs text-primary-400 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
