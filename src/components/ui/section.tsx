import Link from "@/components/ui/nav-link";
export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {link && (
        <Link className="text-link" href={link.href}>
          {link.label}
        </Link>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
