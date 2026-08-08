import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { contentPageAPI, settingsAPI } from '@services/api';
import { useTheme } from '@contexts/ThemeContext';
import Input, { Textarea } from '@components/ui/Input';
import Button from '@components/ui/Button';
import { getErrorMessage } from '@utils/helpers';
import toast from 'react-hot-toast';
import { MdChevronRight, MdEmail, MdPhone, MdLocationOn, MdSchedule, MdCheckCircle } from 'react-icons/md';
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaWhatsapp, FaLinkedin,
} from 'react-icons/fa';
import { clsx } from 'clsx';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Contact = () => {
  const { storeSettings } = useTheme();
  const s = storeSettings || {};
  const storeName = s.storeName || 'Your Store';
  const [sending, setSending] = useState(false);

  const { data: pageData } = useQuery({
    queryKey: ['page', 'contact'],
    queryFn: () => contentPageAPI.getOne('contact'),
    select: d => d.data.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (d) => {
    setSending(true);
    try {
      await settingsAPI.sendContact({
        name: d.name,
        email: d.email,
        subject: d.subject,
        message: d.message,
      });
      toast.success('Message sent! We will get back to you soon.');
      reset();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const socials = [
    { icon: <FaFacebook />, href: s.facebook, label: 'Facebook' },
    { icon: <FaInstagram />, href: s.instagram, label: 'Instagram' },
    { icon: <FaTwitter />, href: s.twitter, label: 'Twitter' },
    { icon: <FaYoutube />, href: s.youtube, label: 'YouTube' },
    { icon: <FaTiktok />, href: s.tiktok, label: 'TikTok' },
    { icon: <FaLinkedin />, href: s.linkedin, label: 'LinkedIn' },
    { icon: <FaWhatsapp />, href: s.whatsapp ? `https://wa.me/${s.whatsapp}` : null, label: 'WhatsApp' },
  ].filter(x => x.href);

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const hours = s.businessHours?.[today];

  const pageTitle = pageData?.title || 'Contact Us';
  const pageContent = pageData?.content || '';

  return (
    <>
      <Helmet><title>{pageData?.metaTitle || `Contact Us – ${storeName}`}</title></Helmet>

      <div className="container-custom py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <MdChevronRight size={14} />
          <span className="text-text-secondary font-medium">Contact</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-2">{pageTitle}</h1>
          <div className="w-16 h-1 bg-accent rounded-full mb-6" />
          {pageContent && (
            <div className="prose-content text-text-secondary leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: pageContent }} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
          {/* Info column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface border border-border rounded-card p-6 space-y-4">
              {s.email && (
                <a href={`mailto:${s.email}`} className="flex items-start gap-3 text-text-secondary hover:text-accent transition-colors">
                  <MdEmail size={20} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-sm break-all">{s.email}</span>
                </a>
              )}
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-start gap-3 text-text-secondary hover:text-accent transition-colors">
                  <MdPhone size={20} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">{s.phone}</span>
                </a>
              )}
              {(s.address || s.city) && (
                <div className="flex items-start gap-3 text-text-secondary">
                  <MdLocationOn size={20} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">{s.address}{s.city ? `, ${s.city}` : ''}{s.country ? `, ${s.country}` : ''}</span>
                </div>
              )}
              {hours && (
                <div className="flex items-start gap-3 text-text-secondary">
                  <MdSchedule size={20} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {hours.isClosed ? 'Closed today' : `Open today ${hours.open || '9:00 AM'} – ${hours.close || '9:00 PM'}`}
                  </span>
                </div>
              )}
            </div>

            {socials.length > 0 && (
              <div className="bg-surface border border-border rounded-card p-6">
                <h3 className="font-semibold text-text-primary mb-4">Follow Us</h3>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {socials.map(({ icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      aria-label={label}
                      className="p-2.5 rounded-lg bg-surface-overlay hover:bg-accent hover:text-white text-text-secondary transition-all duration-200">
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form column */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Name" required placeholder="John Doe" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
                <Input label="Email" required type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              </div>
              <Input label="Subject" required placeholder="How can we help?" error={errors.subject?.message} {...register('subject', { required: 'Subject is required' })} />
              <Textarea label="Message" required rows={6} placeholder="Write your message…" error={errors.message?.message} {...register('message', { required: 'Message is required' })} />
              <Button type="submit" loading={sending} className={clsx('w-full sm:w-auto')}>Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
