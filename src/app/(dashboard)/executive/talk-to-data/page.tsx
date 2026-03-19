'use client';

import { PageHeader } from '@/components/layout';
import { TalkToData } from '@/components/domain';

export default function TalkToDataPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Talk to Data"
        description="Ask Meridian anything about your claims data"
      />
      <div className="flex-1 min-h-0 mt-6">
        <TalkToData className="h-full" />
      </div>
    </div>
  );
}
