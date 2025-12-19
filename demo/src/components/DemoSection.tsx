import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

interface DemoSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  code: string;
}

export function DemoSection({ title, description, children, code }: DemoSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
      <div className="p-6 bg-gray-50">
        {children}
      </div>
      <div className="px-6 pb-6">
        <CodeBlock code={code} title="Show Source Code" />
      </div>
    </div>
  );
}
