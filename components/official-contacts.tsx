import { officialSocialLinks } from "../lib/site-contact";
import { ContactEmail } from "./contact-email";
import styles from "./official-contacts.module.css";

export function OfficialContacts({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.contacts} ${compact ? styles.compact : ""}`}>
      <div>
        <p className={styles.label}>オシセンの公式SNS</p>
        <nav aria-label="オシセンの公式SNS" className={styles.socialLinks}>
          {officialSocialLinks.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              data-channel={social.id}
            >
              <span>
                <strong>{social.label}</strong>
                <span className={styles.handle}>{social.handle}</span>
              </span>
              <span aria-hidden="true">↗</span>
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
          ))}
        </nav>
      </div>
      <div>
        <p className={styles.label}>お問い合わせ</p>
        <ContactEmail />
      </div>
    </div>
  );
}
