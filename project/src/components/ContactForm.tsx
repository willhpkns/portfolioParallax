import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  useEffect(() => {
    emailjs.init('qts6bev5KZTWG3Rks');
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        to_email: 'williamraymondhopkins@gmail.com',
        message: formData.message,
      };

      await emailjs.send(
        'williamraymondhopkins', // Service ID
        'template_fpnr6km', // Template ID
        templateParams,
        'qts6bev5KZTWG3Rks' // Public Key
      );

      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, msg: 'Message sent successfully!' },
      });
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (error) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: 'An error occurred. Please try again later.' },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="w-full p-3 rounded-lg bg-white border border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#5C4B37]"
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          className="w-full p-3 rounded-lg bg-white border border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#5C4B37]"
        />
      </div>
      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          required
          rows={6}
          className="w-full p-3 rounded-lg bg-white border border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#5C4B37]"
        />
      </div>
      <button
        type="submit"
        disabled={status.submitting}
        className="w-full py-3 px-6 bg-[#2C1810] text-white rounded-lg hover:bg-[#3D2A1F] transition-colors duration-300 disabled:opacity-50"
      >
        {status.submitting ? 'Sending...' : 'Send Message'}
      </button>
      {status.info.msg && (
        <div
          className={`p-4 rounded-lg ${
            status.info.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {status.info.msg}
        </div>
      )}
    </form>
  );
};

export default ContactForm;
