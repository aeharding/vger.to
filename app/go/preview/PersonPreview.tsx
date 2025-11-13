import type { PersonView } from "threadiverse";
import styles from "./PersonPreview.module.css";
import InlineMarkdown from "~/helpers/InlineMarkdown";

interface PersonPreviewProps {
  person: PersonView;
}

export default function PersonPreview({ person }: PersonPreviewProps) {
  return (
    <div className={styles.container}>
      <title>{person.person.name}</title>
      <meta
        property="og:image"
        content={person.person.avatar ?? person.person.banner}
      />

      {person.person.banner && (
        <img
          src={person.person.banner}
          alt={person.person.name}
          className={styles.banner}
        />
      )}
      <h2 className={styles.title}>
        {person.person.avatar && (
          <img
            src={person.person.avatar}
            alt={person.person.name}
            className={styles.icon}
          />
        )}
        {person.person.name}
      </h2>
      {person.person.bio && (
        <p className={styles.bio}>
          <InlineMarkdown>{person.person.bio}</InlineMarkdown>
        </p>
      )}
      <div className={styles.stats}>
        {person.counts.post_count} posts • {person.counts.comment_count}{" "}
        comments
      </div>
    </div>
  );
}
