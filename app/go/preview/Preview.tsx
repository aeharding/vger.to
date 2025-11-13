import type { ResolveObjectResponse } from "threadiverse";
import PostPreview from "./PostPreview";
import styles from "./Preview.module.css";
import CommunityPreview from "./CommunityPreview";
import CommentPreview from "./CommentPreview";
import PersonPreview from "./PersonPreview";

interface PreviewProps {
  data: ResolveObjectResponse;
  url: string;
}

export default function Preview({ data, url }: PreviewProps) {
  function renderContent() {
    switch (true) {
      case !!data.post:
        return <PostPreview post={data.post} />;
      case !!data.community:
        return <CommunityPreview community={data.community} />;
      case !!data.comment:
        return <CommentPreview comment={data.comment} />;
      case !!data.person:
        return <PersonPreview person={data.person} />;
    }
  }

  return (
    <a
      className={styles.container}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {renderContent()}
    </a>
  );
}
