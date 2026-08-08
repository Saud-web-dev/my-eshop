import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { settingsAPI } from '@services/api';
import { getErrorMessage } from '@utils/helpers';
import { useTheme } from '@contexts/ThemeContext';
import Input, { Textarea, Select } from '@components/ui/Input';
import Button from '@components/ui/Button';
import ImageUpload from '@components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheck } from 'react-icons/md';

const STEPS = [
  { id: 1, title: 'Store Info',    desc: 'Basic store details' },
  { id: 2, title: 'Contact',       desc: 'How customers reach you' },
  { id: 3, title: 'Social Media',  desc: 'Your online presence' },
  { id: 4, title: 'Theme',         desc: 'Look & feel' },
  { id: 5, title: 'Shipping',      desc: 'Delivery settings' },
];

const SetupWizard = () => {
  const navigate  = useNavigate();
  const { loadSettings, updateTheme } = useTheme();
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState({});
  const [logo, setLogo]     = useState([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch } = useForm();

  const next = handleSubmit((formData) => {
    setData(prev => ({ ...prev, ...formData }));
    if (step < STEPS.length) setStep(s => s + 1);
  });

  const finish = handleSubmit(async (formData) => {
    setSaving(true);
    try {
      const payload = { ...data, ...formData, setupCompleted: true };
      await settingsAPI.completeSetup(payload);
      if (logo.length) {
        const fd = new FormData();
        fd.append('logo', logo[0]);
        await settingsAPI.uploadLogo(fd);
      }
      await loadSettings();
      toast.success('Store setup complete! Welcome to your admin panel.');
      navigate('/admin/dashboard');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  });

  const accentColor = watch('theme.accentColor', '#e94560');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">Store Setup Wizard</h1>
          <p className="text-primary-300 mt-2">Configure your store in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.id ? 'bg-green-500 text-white' :
                  step === s.id ? 'bg-accent text-white scale-110' :
                  'bg-white/20 text-white/50'
                }`}>
                  {step > s.id ? <MdCheck size={16} /> : s.id}
                </div>
                <span className={`text-[10px] whitespace-nowrap hidden sm:block ${step === s.id ? 'text-white' : 'text-primary-400'}`}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.id ? 'bg-green-500' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-modal p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}>

              <h2 className="text-xl font-bold text-text-primary mb-1">{STEPS[step-1].title}</h2>
              <p className="text-text-muted text-sm mb-6">{STEPS[step-1].desc}</p>

              <form className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Store Name" required defaultValue={data.storeName} {...register('storeName')} />
                      <Input label="Business Name" defaultValue={data.businessName} {...register('businessName')} />
                    </div>
                    <Textarea label="Business Description" rows={3} defaultValue={data.businessDescription} {...register('businessDescription')} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Currency" defaultValue={data.currency || 'PKR'} {...register('currency')} />
                      <Input label="Currency Symbol" defaultValue={data.currencySymbol || '₨'} {...register('currencySymbol')} />
                    </div>
                    <ImageUpload label="Store Logo" value={logo} onChange={setLogo} maxFiles={1} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Email" type="email" defaultValue={data.email} {...register('email')} />
                      <Input label="Phone" type="tel" defaultValue={data.phone} {...register('phone')} />
                      <Input label="WhatsApp" type="tel" defaultValue={data.whatsapp} {...register('whatsapp')} />
                      <Input label="Website" type="url" defaultValue={data.website} {...register('website')} />
                    </div>
                    <Textarea label="Address" rows={2} defaultValue={data.address} {...register('address')} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="City" defaultValue={data.city} {...register('city')} />
                      <Input label="Country" defaultValue={data.country || 'Pakistan'} {...register('country')} />
                    </div>
                  </>
                )}
                {step === 3 && (
                  <div className="grid grid-cols-2 gap-4">
                    {['facebook','instagram','twitter','youtube','tiktok','linkedin'].map(k => (
                      <Input key={k} label={k.charAt(0).toUpperCase()+k.slice(1)+' URL'} type="url"
                        defaultValue={data[k]} {...register(k)} />
                    ))}
                  </div>
                )}
                {step === 4 && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-text-secondary block mb-1.5">Accent Color</label>
                      <input type="color" defaultValue={data['theme.accentColor'] || '#e94560'}
                        {...register('theme.accentColor')}
                        onChange={e => updateTheme({ accentColor: e.target.value })}
                        className="w-16 h-10 rounded cursor-pointer border border-border" />
                    </div>
                    <Select label="Font Family" defaultValue="Inter" {...register('theme.fontFamily')}>
                      {['Inter','Roboto','Poppins','Montserrat','Lato','Open Sans'].map(f => <option key={f} value={f}>{f}</option>)}
                    </Select>
                    <Select label="Border Radius" defaultValue="md" {...register('theme.borderRadius')}>
                      {['sm','md','lg','xl','full'].map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </>
                )}
                {step === 5 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Default Shipping Cost (₨)" type="number" defaultValue={data.defaultShippingCost || 0} {...register('defaultShippingCost')} />
                      <Input label="Free Shipping Threshold (₨)" type="number" defaultValue={data.freeShippingThreshold || 0} {...register('freeShippingThreshold')} />
                    </div>
                    <Input label="Tax Rate (%)" type="number" step="0.01" defaultValue={data.taxRate || 0} {...register('taxRate')} />
                  </>
                )}
              </form>
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
              Back
            </Button>
            {step < STEPS.length
              ? <Button onClick={next}>Continue</Button>
              : <Button onClick={finish} loading={saving}>Complete Setup</Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
