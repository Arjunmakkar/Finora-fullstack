import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Question');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;

    setSubmitting(true);
    // Simulate instantaneous local processing / email dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 2500);
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-20 z-40 flex h-10 items-center gap-2 rounded-card border border-border-strong bg-surface px-3.5 text-ink-primary shadow-elevated transition-colors hover:border-accent-teal hover:bg-elevated hover:text-accent-teal focus:outline-none"
        aria-label="Contact support"
        title="Contact support"
      >
        <MessageSquare size={16} className="text-accent-teal shrink-0" />
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Contact</span>
      </motion.button>

      {/* Contact Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg rounded-xl border border-border-subtle bg-surface p-6 shadow-elevated"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-card bg-elevated border border-border-strong text-accent-teal">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink-primary">Get in Touch</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
                      Direct support & feedback from the Finora team
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-card p-1 text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink-primary"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-card bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-display text-lg font-bold text-ink-primary">Message Sent Successfully</h4>
                  <p className="mt-2 text-xs text-ink-secondary max-w-xs">
                    Thank you for reaching out. We typically respond to support requests within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-secondary">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-secondary">Email address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-secondary">Topic</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="select-field"
                    >
                      <option value="General Question">General Question</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Privacy & Security">Privacy & Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-secondary">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you today?"
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <span className="text-[10px] text-ink-tertiary">
                      Direct contact: <a href="mailto:support@finora.app" className="text-accent-teal hover:underline font-medium">support@finora.app</a>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submitting || !email.trim() || !message.trim()}
                        className="gap-2"
                      >
                        {submitting ? 'Sending...' : (
                          <>Send Message <Send size={14} /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
