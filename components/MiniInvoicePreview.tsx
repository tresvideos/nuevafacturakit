
"use client";
import React from "react";
import { InvoiceDocByTemplate, DEFAULT_SAMPLE, TEMPLATES } from "@/components/invoice-core";

export default function MiniInvoicePreview({ templateId }: { templateId: string }){
  const invoice = { ...DEFAULT_SAMPLE, number:"0007", client:{...DEFAULT_SAMPLE.client, name:"Cliente Demo"}, templateId };
  const color = (TEMPLATES.find(t=>t.id===templateId)?.colors||["#0f172a"])[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="h-44 overflow-hidden rounded-lg bg-white">
        <div className="scale-[0.72] origin-top-left min-w-[640px]">
          <InvoiceDocByTemplate invoice={invoice} templateId={templateId} accentColor={color} compact />
        </div>
      </div>
    </div>
  );
}
