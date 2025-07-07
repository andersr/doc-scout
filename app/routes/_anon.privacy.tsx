import { PageTitle } from "~/components/layout/PageTitle";
import { PROSE_STYLES } from "~/styles/typography";
import PrivacyContent from "../static/Privacy.mdx";

export default function PrivacyPage() {
  return (
    <div className={PROSE_STYLES}>
      <PageTitle title="Privacy Policy" />
      <PrivacyContent />
    </div>
  );
}
