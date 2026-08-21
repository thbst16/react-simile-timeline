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
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
      <div className="p-6 border-b border-base-200">
        <h3 className="text-xl font-semibold text-base-content">{title}</h3>
        <p className="mt-2 text-base-content/80">{description}</p>
      </div>
      <div className="p-6 bg-base-200">
        {children}
      </div>
      <div className="px-6 pb-6">
        <CodeBlock code={code} title="Show Source Code" />
      </div>
    </div>
  );
}
