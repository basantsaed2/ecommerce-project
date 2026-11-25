"use client";
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface GuestInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
  isLoading?: boolean;
}

export default function GuestInfoDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: GuestInfoDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 md:p-10 text-center">
          <h3 className="text-2xl font-black text-primary tracking-tighter mb-4">
            {'معلومات الزائر'}
          </h3>
          <p className="text-gray-500 mb-6">
            {'يرجى إدخال اسمك ورقم هاتفك لإكمال الطلب.'}
          </p>
          <div className="space-y-4 mb-6 text-left">
            <label className="block text-sm font-medium text-gray-700">{'الاسم'}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <label className="block text-sm font-medium text-gray-700">{'رقم الهاتف'}</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onConfirm(name.trim(), phone.trim())}
              disabled={isLoading || !name.trim() || !phone.trim()}
              className="w-full py-3 bg-primary text-white rounded-xl font-black text-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isLoading ? t.common.loading || 'جاري التحميل...' : t.common.confirm || 'تأكيد'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-lg hover:bg-gray-200 transition"
            >
              {t.common.cancel || 'إلغاء'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
