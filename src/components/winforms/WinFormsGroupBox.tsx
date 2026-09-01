import React from 'react';

interface WinFormsGroupBoxProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export const WinFormsGroupBox: React.FC<WinFormsGroupBoxProps> = ({
  id,
  title,
  children,
  className = '',
  badge,
}) => {
  return (
    <fieldset
      id={id}
      className={`border border-[#CBD5E1] rounded-[4px] p-4 pt-2.5 bg-white relative text-slate-800 ${className}`}
    >
      <legend className="px-2 text-[12px] font-semibold text-[#1E293B] bg-white flex items-center gap-2 select-none">
        <span>{title}</span>
        {badge}
      </legend>
      <div className="mt-1">{children}</div>
    </fieldset>
  );
};
