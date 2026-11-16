import { EmailChooser } from "@/components/contact/email-chooser";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const phoneContacts = [
  { name: "Dace", display: "+371 2240 8040", wa: "37122408040" },
  { name: "Ilgonis", display: "+371 2640 6179", wa: "37126406179" },
] as const;

export async function CompanyDetails() {
  const dictionary = await getDictionary();
  const { contact } = dictionary;

  return (
    <div className="grid gap-8">
      <ul className="grid gap-3">
        {phoneContacts.map((person) => (
          <li key={person.wa}>
            <a
              href={`https://wa.me/${person.wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-ivory transition hover:border-white/25 hover:bg-white/8"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <WhatsAppIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] tracking-wide text-mist uppercase">
                  {person.name}
                </span>
                <span className="mt-0.5 block text-sm font-medium">{person.display}</span>
              </span>
            </a>
          </li>
        ))}
        <li>
          <EmailChooser email={contact.emailValue} label={contact.email} />
        </li>
      </ul>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 2.08.62 4.02 1.7 5.65L2 22l4.7-1.55a9.86 9.86 0 0 0 5.34 1.55c5.46 0 9.89-4.4 9.89-9.84C21.93 6.4 17.5 2 12.04 2Zm0 17.94c-1.66 0-3.2-.5-4.48-1.35l-.32-.2-2.79.92.94-2.72-.21-.34a7.9 7.9 0 0 1-1.34-4.41c0-4.38 3.6-7.94 8.2-7.94 4.6 0 8.2 3.56 8.2 7.94 0 4.38-3.6 7.94-8.2 7.94Zm4.5-5.94c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74 2.49 1.08 2.49.72 2.94.67.45-.04 1.46-.6 1.66-1.17.21-.58.21-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}
