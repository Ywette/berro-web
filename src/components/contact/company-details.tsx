import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function CompanyDetails() {
  const dictionary = await getDictionary();
  const { contact } = dictionary;

  return (
    <div className="grid gap-6">
      <h2 className="font-serif text-3xl tracking-wide text-ivory">{contact.company}</h2>

      <dl className="grid gap-5 text-sm">
        <div>
          <dt className="text-mist">{contact.legalAddress}</dt>
          <dd className="mt-1 leading-6 text-ivory">
            {contact.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </dd>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-mist">{contact.registrationNumber}</dt>
            <dd className="mt-1 text-ivory">{contact.registrationValue}</dd>
          </div>
          <div>
            <dt className="text-mist">{contact.vatNumber}</dt>
            <dd className="mt-1 text-ivory">{contact.vatValue}</dd>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-mist">{contact.email}</dt>
            <dd className="mt-1">
              <a href={`mailto:${contact.emailValue}`} className="text-ivory underline decoration-burgundy underline-offset-4 hover:text-white">
                {contact.emailValue}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-mist">{contact.phone}</dt>
            <dd className="mt-1">
              <a href="tel:+37126406179" className="text-ivory underline decoration-burgundy underline-offset-4 hover:text-white">
                {contact.phoneValue}
              </a>
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
