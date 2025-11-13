import type { CommunityView } from "threadiverse";
import styles from "./CommunityPreview.module.css";
import InlineMarkdown from "~/helpers/InlineMarkdown";

interface CommunityPreviewProps {
  community: CommunityView;
}

export default function CommunityPreview({ community }: CommunityPreviewProps) {
  return (
    <div className={styles.container}>
      <title>{community.community.title}</title>
      <meta
        property="og:image"
        content={community.community.icon ?? community.community.banner}
      />

      {community.community.banner && (
        <img
          src={community.community.banner}
          alt={community.community.title}
          className={`fullsize ${styles.banner}`}
        />
      )}
      <h2 className={styles.title}>
        {community.community.icon && (
          <img
            src={community.community.icon}
            alt={community.community.title}
            className={styles.icon}
          />
        )}
        {community.community.title}
      </h2>
      {community.community.description && (
        <p className={styles.description}>
          <InlineMarkdown>{community.community.description}</InlineMarkdown>
        </p>
      )}
      <div className={styles.stats}>
        {community.counts.subscribers} subscribers • {community.counts.posts}{" "}
        posts
      </div>
    </div>
  );
}
