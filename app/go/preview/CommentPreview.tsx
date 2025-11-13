import type { CommentView } from "threadiverse";
import styles from "./CommentPreview.module.css";
import InlineMarkdown from "~/helpers/InlineMarkdown";

interface CommentPreviewProps {
  comment: CommentView;
}

export default function CommentPreview({ comment }: CommentPreviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.context}>
        <strong>{comment.creator.name}</strong> commented on{" "}
        <strong>{comment.post.name}</strong>
      </div>
      <title>{comment.comment.content}</title>

      <h2 className={styles.content}>
        <InlineMarkdown>{comment.comment.content}</InlineMarkdown>
      </h2>

      <div className={styles.stats}>
        {comment.counts.score} votes • {comment.counts.child_count} replies
      </div>
    </div>
  );
}
