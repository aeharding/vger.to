import type { PostView } from "threadiverse";
import styles from "./PostPreview.module.css";
import InlineMarkdown from "~/helpers/InlineMarkdown";
import { isUrlImage } from "~/helpers/url";

interface PostPreviewProps {
  post: PostView;
}

export default function PostPreview({ post }: PostPreviewProps) {
  return (
    <div className={styles.container}>
      <title>{post.post.name}</title>
      <meta property="og:image" content={post.post.thumbnail_url} />

      {post.post.url &&
        isUrlImage(post.post.url, post.post.url_content_type) && (
          <img
            src={post.post.url}
            alt={post.post.name}
            className={`fullsize ${styles.image} ${
              post.post.nsfw ? styles.blur : ""
            }`}
          />
        )}
      <h2 className={styles.title}>
        <InlineMarkdown parseBlocks={false}>{post.post.name}</InlineMarkdown>
      </h2>
      <div className={styles.stats}>
        {post.counts.score} votes • {post.counts.comments} comments
      </div>
    </div>
  );
}
