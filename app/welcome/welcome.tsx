import styles from "./welcome.module.css";

export function Welcome() {
  return (
    <div className={styles.container}>
      <p>
        Hi there! This site (vger.to) helps you share Lemmy posts and comments
        with Voyager users. If they have the app installed, shared links will
        open directly in Voyager. If not, they'll see a preview with options to
        view the content.
      </p>

      <div className={styles.conversion}>
        <code>https://lemmy.zip/post/123</code>
        <span>⇔</span>
        <code>https://vger.to/lemmy.zip/post/123</code>
      </div>

      <p>
        <strong>What problem does this solve?</strong> Want to share a Lemmy
        post with a friend using Voyager? The raw Lemmy link opens in a browser.
        To view it in Voyager, they’d need to copy and paste the URL into the
        app, or use Safari and tap “Open in Voyager” from the share menu.
      </p>

      <p>
        With <code>vger.to</code>, posts open automatically in Voyager — thanks
        to Universal Links.
      </p>

      <p>
        <strong>Q: Why not just share the direct Lemmy URL?</strong> You can set
        Voyager to share the original Lemmy link (e.g.{" "}
        <code>https://lemmy.zip/post/123</code>), but those always open in the
        browser. A <code>vger.to</code> link will open in the app if it's
        installed — making for a smoother experience and helping more people get
        into Lemmy through Voyager.
      </p>

      <p>
        <strong>Q: Why not use a custom protocol?</strong> Voyager supports{" "}
        <code>vger://</code> links like <code>vger://lemmy.zip/post/123</code>.
        They work great <em>if</em> Voyager is installed — but won’t open if the
        app isn’t installed.
      </p>

      <p>
        <strong>Q: Why is this a centralized service?</strong> Unfortunately,
        Universal Links on iOS and Android require a tight and bidirectional
        pairing between a specific app and a specific domain. They just weren’t
        built with federated platforms like Lemmy in mind.
      </p>
    </div>
  );
}
